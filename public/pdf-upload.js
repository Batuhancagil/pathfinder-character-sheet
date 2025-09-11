class PDFUploadManager {
    constructor() {
        this.parser = new PDFParser();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // PDF Upload button
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'uploadPdfBtn') {
                this.showPDFUploadDialog();
            }
        });

        // PDF Upload dialog events
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'processPdfBtn') {
                this.processPDF();
            }
            if (e.target && e.target.id === 'cancelPdfBtn') {
                this.closePDFDialog();
            }
        });

        // File input change
        document.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'pdfFileInput') {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Drag and drop events
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                this.handleFileSelect(files[0]);
            }
        });
    }

    showPDFUploadDialog() {
        console.log('Showing PDF upload dialog');
        
        // Check if dialog already exists
        const existingDialog = document.querySelector('.pdf-upload-dialog');
        if (existingDialog) {
            document.body.removeChild(existingDialog);
        }

        const dialog = document.createElement('div');
        dialog.className = 'pdf-upload-dialog';
        dialog.innerHTML = `
            <div class="pdf-upload-content">
                <div class="pdf-upload-header">
                    <h3>Upload PDF Character Sheet</h3>
                    <p>Upload a Pathfinder character sheet PDF to automatically extract character data</p>
                </div>
                <div class="pdf-upload-body">
                    <div class="file-upload-area" id="fileUploadArea">
                        <div class="upload-icon">📄</div>
                        <p class="upload-text">Drag & drop your PDF here or click to browse</p>
                        <input type="file" id="pdfFileInput" accept=".pdf" style="display: none;">
                        <button class="btn-secondary" onclick="document.getElementById('pdfFileInput').click()">Choose File</button>
                    </div>
                    <div class="selected-file" id="selectedFile" style="display: none;">
                        <div class="file-info">
                            <span class="file-icon">📄</span>
                            <div class="file-details">
                                <div class="file-name" id="fileName"></div>
                                <div class="file-size" id="fileSize"></div>
                            </div>
                        </div>
                        <button class="btn-small" id="removeFileBtn">Remove</button>
                    </div>
                    <div class="processing-status" id="processingStatus" style="display: none;">
                        <div class="spinner"></div>
                        <p>Processing PDF...</p>
                    </div>
                    <div id="pdfError" class="error-message" style="display: none;"></div>
                </div>
                <div class="pdf-upload-footer">
                    <button id="cancelPdfBtn" class="btn btn-secondary">Cancel</button>
                    <button id="processPdfBtn" class="btn btn-primary" disabled>Process PDF</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
        
        // Setup remove file button
        const removeFileBtn = dialog.querySelector('#removeFileBtn');
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', () => {
                this.clearSelectedFile();
            });
        }
    }

    handleFileSelect(file) {
        if (!file) return;
        
        if (file.type !== 'application/pdf') {
            this.showError('Please select a PDF file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showError('File size must be less than 10MB');
            return;
        }

        // Update UI
        const uploadArea = document.querySelector('#fileUploadArea');
        const selectedFile = document.querySelector('#selectedFile');
        const fileName = document.querySelector('#fileName');
        const fileSize = document.querySelector('#fileSize');
        const processBtn = document.querySelector('#processPdfBtn');

        if (uploadArea && selectedFile && fileName && fileSize && processBtn) {
            uploadArea.style.display = 'none';
            selectedFile.style.display = 'flex';
            fileName.textContent = file.name;
            fileSize.textContent = this.formatFileSize(file.size);
            processBtn.disabled = false;
        }

        this.selectedFile = file;
    }

    clearSelectedFile() {
        const uploadArea = document.querySelector('#fileUploadArea');
        const selectedFile = document.querySelector('#selectedFile');
        const processBtn = document.querySelector('#processPdfBtn');
        const fileInput = document.querySelector('#pdfFileInput');

        if (uploadArea && selectedFile && processBtn && fileInput) {
            uploadArea.style.display = 'flex';
            selectedFile.style.display = 'none';
            processBtn.disabled = true;
            fileInput.value = '';
        }

        this.selectedFile = null;
    }

    async processPDF() {
        if (!this.selectedFile) {
            this.showError('Please select a PDF file first');
            return;
        }

        const processBtn = document.querySelector('#processPdfBtn');
        const processingStatus = document.querySelector('#processingStatus');
        const selectedFile = document.querySelector('#selectedFile');

        // Update UI
        processBtn.disabled = true;
        processBtn.textContent = 'Processing...';
        selectedFile.style.display = 'none';
        processingStatus.style.display = 'flex';
        this.clearError();

        try {
            console.log('Processing PDF:', this.selectedFile.name);
            
            // Parse PDF
            const characterData = await this.parser.parsePDF(this.selectedFile);
            
            // Show preview and allow editing
            this.showCharacterPreview(characterData);
            
        } catch (error) {
            console.error('PDF processing error:', error);
            this.showError(`Failed to process PDF: ${error.message}`);
            
            // Reset UI
            processBtn.disabled = false;
            processBtn.textContent = 'Process PDF';
            processingStatus.style.display = 'none';
            selectedFile.style.display = 'flex';
        }
    }

    showCharacterPreview(characterData) {
        // Close upload dialog
        this.closePDFDialog();

        // Show character preview dialog
        const dialog = document.createElement('div');
        dialog.className = 'character-preview-dialog';
        dialog.innerHTML = `
            <div class="character-preview-content">
                <div class="character-preview-header">
                    <h3>Character Preview</h3>
                    <p>Review and edit the extracted character data</p>
                </div>
                <div class="character-preview-body">
                    <div class="preview-section">
                        <h4>Basic Information</h4>
                        <div class="preview-grid">
                            <div class="preview-item">
                                <label>Name:</label>
                                <input type="text" id="previewName" value="${characterData.name || ''}">
                            </div>
                            <div class="preview-item">
                                <label>Class:</label>
                                <input type="text" id="previewClass" value="${characterData.class || ''}">
                            </div>
                            <div class="preview-item">
                                <label>Level:</label>
                                <input type="number" id="previewLevel" value="${characterData.level || 1}" min="1" max="20">
                            </div>
                            <div class="preview-item">
                                <label>Ancestry:</label>
                                <input type="text" id="previewAncestry" value="${characterData.ancestry || ''}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="preview-section">
                        <h4>Ability Scores</h4>
                        <div class="preview-grid">
                            ${Object.entries(characterData.abilities || {}).map(([ability, score]) => `
                                <div class="preview-item">
                                    <label>${ability.charAt(0).toUpperCase() + ability.slice(1)}:</label>
                                    <input type="number" id="preview${ability}" value="${score}" min="1" max="30">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="preview-section">
                        <h4>Combat Stats</h4>
                        <div class="preview-grid">
                            <div class="preview-item">
                                <label>AC:</label>
                                <input type="number" id="previewAC" value="${characterData.ac || 10}" min="0">
                            </div>
                            <div class="preview-item">
                                <label>HP:</label>
                                <input type="number" id="previewHP" value="${characterData.hp || 8}" min="1">
                            </div>
                            <div class="preview-item">
                                <label>Speed:</label>
                                <input type="number" id="previewSpeed" value="${characterData.speed || 25}" min="0">
                            </div>
                        </div>
                    </div>
                    
                    <div class="preview-section">
                        <h4>Skills (${characterData.skills?.length || 0} found)</h4>
                        <div class="skills-preview">
                            ${characterData.skills?.map(skill => `
                                <div class="skill-preview-item">
                                    <span class="skill-name">${skill.name}</span>
                                    <span class="skill-modifier">${skill.modifier >= 0 ? '+' : ''}${skill.modifier}</span>
                                </div>
                            `).join('') || '<p>No skills detected</p>'}
                        </div>
                    </div>
                </div>
                <div class="character-preview-footer">
                    <button id="cancelPreviewBtn" class="btn btn-secondary">Cancel</button>
                    <button id="saveCharacterBtn" class="btn btn-primary">Save Character</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Setup event listeners
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'cancelPreviewBtn') {
                document.body.removeChild(dialog);
            }
            if (e.target && e.target.id === 'saveCharacterBtn') {
                this.saveCharacterFromPreview(characterData);
            }
        });
    }

    saveCharacterFromPreview(originalData) {
        // Collect updated data from preview form
        const updatedData = { ...originalData };
        
        // Basic info
        updatedData.name = document.querySelector('#previewName')?.value || '';
        updatedData.class = document.querySelector('#previewClass')?.value || '';
        updatedData.level = parseInt(document.querySelector('#previewLevel')?.value) || 1;
        updatedData.ancestry = document.querySelector('#previewAncestry')?.value || '';
        
        // Combat stats
        updatedData.ac = parseInt(document.querySelector('#previewAC')?.value) || 10;
        updatedData.hp = parseInt(document.querySelector('#previewHP')?.value) || 8;
        updatedData.speed = parseInt(document.querySelector('#previewSpeed')?.value) || 25;
        
        // Ability scores
        Object.keys(updatedData.abilities || {}).forEach(ability => {
            const value = parseInt(document.querySelector(`#preview${ability}`)?.value);
            if (value) {
                updatedData.abilities[ability] = value;
                updatedData.abilityModifiers[ability] = Math.floor((value - 10) / 2);
            }
        });

        // Save character using existing import system
        if (window.characterCardManager && window.characterCardManager.importer) {
            window.characterCardManager.importer.importCharacter(updatedData);
            window.characterCardManager.refreshCharacters();
        }

        // Close preview dialog
        const previewDialog = document.querySelector('.character-preview-dialog');
        if (previewDialog) {
            document.body.removeChild(previewDialog);
        }

        console.log('Character saved from PDF:', updatedData);
    }

    closePDFDialog() {
        const dialog = document.querySelector('.pdf-upload-dialog');
        if (dialog) {
            document.body.removeChild(dialog);
        }
    }

    showError(message) {
        const errorDiv = document.querySelector('#pdfError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    clearError() {
        const errorDiv = document.querySelector('#pdfError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pdfUploadManager = new PDFUploadManager();
});
