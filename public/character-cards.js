// Character Card Management System
class CharacterCardManager {
    constructor() {
        this.importer = new CharacterImporter();
        this.currentCharacter = null;
        this.cardContainer = null;
        this.characterDisplay = null;
        this.init();
    }

    init() {
        this.cardContainer = document.getElementById('characterCards');
        this.characterDisplay = document.getElementById('characterDisplay');
        this.setupEventListeners();
        this.renderCharacterCards();
    }

    setupEventListeners() {
        // Character import button - use event delegation
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'importCharacterBtn') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Import button clicked');
                this.showImportDialog();
            }
        });

        // Character selection - click on card
        document.addEventListener('click', (e) => {
            if (e.target.closest('.character-card')) {
                const card = e.target.closest('.character-card');
                const characterId = card.dataset.characterId;
                if (characterId) {
                    console.log('Character card clicked:', characterId);
                    this.selectCharacter(characterId);
                }
            }
        });

        // Character deletion
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-character-btn')) {
                e.stopPropagation();
                const characterId = e.target.dataset.characterId;
                this.deleteCharacter(characterId);
            }
        });

        // Back to cards button
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'backToCardsBtn') {
                this.showCharacterCards();
            }
        });

        // Import dialog buttons
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'importBtn') {
                console.log('Import dialog button clicked');
                this.handleImport();
            }
            if (e.target && e.target.id === 'cancelImportBtn') {
                const dialog = e.target.closest('.import-dialog');
                if (dialog) {
                    document.body.removeChild(dialog);
                }
            }
        });
    }

    showImportDialog() {
        console.log('Showing import dialog');
        
        // Check if dialog already exists
        const existingDialog = document.querySelector('.import-dialog');
        if (existingDialog) {
            console.log('Dialog already exists, removing it first');
            document.body.removeChild(existingDialog);
        }
        
        const dialog = document.createElement('div');
        dialog.className = 'import-dialog';
        dialog.innerHTML = `
            <div class="import-dialog-content">
                <h3>Import Character from Pathbuilder</h3>
                <p>Paste your Pathbuilder JSON export below:</p>
                <textarea id="pathbuilderJson" placeholder="Paste Pathbuilder JSON here..." rows="10"></textarea>
                <div class="import-actions">
                    <button id="importBtn" class="btn btn-primary">Import Character</button>
                    <button id="cancelImportBtn" class="btn btn-secondary">Cancel</button>
                </div>
                <div id="importError" class="error-message" style="display: none;"></div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Focus on textarea and select all text
        const textarea = dialog.querySelector('#pathbuilderJson');
        if (textarea) {
            textarea.focus();
            textarea.select();
            console.log('Textarea focused and selected');
        }

        // Close on outside click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });

        // Handle paste event
        textarea.addEventListener('paste', (e) => {
            console.log('Paste event detected');
            setTimeout(() => {
                console.log('Textarea value after paste:', textarea.value);
                console.log('Textarea value length after paste:', textarea.value.length);
            }, 100);
        });

        // Handle input event
        textarea.addEventListener('input', (e) => {
            console.log('Textarea input event, value length:', e.target.value.length);
            console.log('Textarea value:', e.target.value.substring(0, 100) + '...');
        });

        // Handle change event
        textarea.addEventListener('change', (e) => {
            console.log('Textarea change event, value length:', e.target.value.length);
        });

        // Handle keyup event for additional debugging
        textarea.addEventListener('keyup', (e) => {
            console.log('Textarea keyup event, value length:', e.target.value.length);
        });
    }

    handleImport() {
        console.log('Handling import');
        
        // First, let's check if the dialog still exists
        const dialog = document.querySelector('.import-dialog');
        console.log('Dialog element:', dialog);
        
        if (!dialog) {
            console.error('Import dialog not found!');
            return;
        }
        
        const jsonInput = dialog.querySelector('#pathbuilderJson');
        const errorDiv = dialog.querySelector('#importError');
        
        console.log('JSON input element:', jsonInput);
        console.log('JSON input value:', jsonInput ? jsonInput.value : 'null');
        console.log('JSON input value length:', jsonInput ? jsonInput.value.length : 0);
        
        // Try multiple ways to get the value
        let jsonValue = '';
        if (jsonInput) {
            jsonValue = jsonInput.value || jsonInput.textContent || jsonInput.innerText || '';
            console.log('JSON value from different sources:');
            console.log('- value:', jsonInput.value);
            console.log('- textContent:', jsonInput.textContent);
            console.log('- innerText:', jsonInput.innerText);
            console.log('- Final jsonValue:', jsonValue);
        }
        
        if (!jsonValue || !jsonValue.trim()) {
            console.log('No JSON input or empty value');
            if (errorDiv) {
                errorDiv.textContent = 'Please paste your Pathbuilder JSON in the textarea above';
                errorDiv.style.display = 'block';
            }
            return;
        }
        
        try {
            console.log('Parsing JSON...');
            const jsonData = JSON.parse(jsonValue);
            console.log('JSON parsed successfully:', jsonData);
            
            const validation = this.importer.validatePathbuilderJson(jsonData);
            console.log('Validation result:', validation);
            
            if (!validation.valid) {
                console.log('Validation failed:', validation.error);
                if (errorDiv) {
                    errorDiv.textContent = validation.error;
                    errorDiv.style.display = 'block';
                }
                return;
            }

            console.log('Importing character...');
            const character = this.importer.importCharacter(jsonData);
            console.log('Character imported:', character);
            
            if (character) {
                console.log('Character import successful, re-rendering cards');
                this.renderCharacterCards();
                console.log('Cards re-rendered, selecting character');
                this.selectCharacter(character.id);
                console.log('Character selected, closing dialog');
                if (dialog) {
                    document.body.removeChild(dialog);
                }
                console.log('Import process completed');
            } else {
                console.error('Character import returned null');
                if (errorDiv) {
                    errorDiv.textContent = 'Failed to import character';
                    errorDiv.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Import error:', error);
            if (errorDiv) {
                errorDiv.textContent = 'Invalid JSON format: ' + error.message;
                errorDiv.style.display = 'block';
            }
        }
    }

    renderCharacterCards() {
        console.log('Rendering character cards');
        if (!this.cardContainer) {
            console.error('Card container not found');
            return;
        }

        const characters = this.importer.getAllCharacters();
        console.log('Rendering character cards, count:', characters.length);
        
        if (characters.length === 0) {
            this.cardContainer.innerHTML = `
                <div class="no-characters">
                    <h3>No Characters Imported</h3>
                    <p>Import your first character from Pathbuilder to get started!</p>
                    <button id="importCharacterBtn" class="btn btn-primary">Import Character</button>
                </div>
            `;
            return;
        }

        this.cardContainer.innerHTML = `
            <div class="character-cards-header">
                <h3>Your Characters</h3>
                <button id="importCharacterBtn" class="btn btn-primary">Import New Character</button>
            </div>
            <div class="character-cards-grid">
                ${characters.map(char => this.createCharacterCard(char)).join('')}
            </div>
        `;
        
        console.log('Character cards rendered successfully');
    }

    createCharacterCard(character) {
        const summary = this.importer.getCharacterSummary(character);
        const classIcon = this.getClassIcon(character.class);
        
        return `
            <div class="character-card" data-character-id="${character.id}">
                <div class="character-card-header">
                    <div class="character-class-icon">${classIcon}</div>
                    <div class="character-info">
                        <h4>${character.name}</h4>
                        <p class="character-class">${character.class} ${character.level}</p>
                        <p class="character-ancestry">${character.ancestry} ${character.heritage}</p>
                    </div>
                    <button class="delete-character-btn" data-character-id="${character.id}" title="Delete Character">×</button>
                </div>
                <div class="character-stats">
                    <div class="stat">
                        <span class="stat-label">AC</span>
                        <span class="stat-value">${summary.ac}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">HP</span>
                        <span class="stat-value">${summary.hp}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Speed</span>
                        <span class="stat-value">${summary.speed}</span>
                    </div>
                </div>
                <div class="character-abilities">
                    ${Object.entries(summary.abilities).map(([ability, score]) => `
                        <div class="ability">
                            <span class="ability-name">${ability.toUpperCase()}</span>
                            <span class="ability-score">${score}</span>
                            <span class="ability-modifier">${summary.abilityModifiers[ability] >= 0 ? '+' : ''}${summary.abilityModifiers[ability]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getClassIcon(className) {
        const icons = {
            'Wizard': '🧙‍♂️',
            'Cleric': '⛑️',
            'Fighter': '⚔️',
            'Rogue': '🗡️',
            'Ranger': '🏹',
            'Paladin': '🛡️',
            'Barbarian': '🔨',
            'Bard': '🎵',
            'Druid': '🌿',
            'Monk': '🥋',
            'Sorcerer': '✨',
            'Warlock': '👹'
        };
        return icons[className] || '👤';
    }

    selectCharacter(characterId) {
        console.log('Selecting character:', characterId);
        const character = this.importer.getCharacterById(characterId);
        if (!character) {
            console.error('Character not found:', characterId);
            return;
        }

        this.currentCharacter = character;
        this.showCharacterSheet(character);
    }

    showCharacterSheet(character) {
        console.log('Showing character sheet for:', character.name);
        if (!this.characterDisplay) {
            console.error('Character display not found');
            return;
        }

        this.characterDisplay.innerHTML = `
            <div class="character-sheet-header">
                <button id="backToCardsBtn" class="btn btn-secondary">← Back to Characters</button>
                <h2>${character.name} - ${character.class} ${character.level}</h2>
            </div>
            <div class="character-sheet-content">
                ${this.renderCharacterSheet(character)}
            </div>
        `;

        // Hide character cards, show character display
        if (this.cardContainer) {
            this.cardContainer.style.display = 'none';
        }
        this.characterDisplay.style.display = 'block';
        
        console.log('Character sheet displayed');
    }

    renderCharacterSheet(character) {
        const summary = this.importer.getCharacterSummary(character);
        
        return `
            <div class="character-sheet">
                <div class="character-basic-info">
                    <div class="info-section">
                        <h3>Basic Information</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Ancestry:</label>
                                <span>${character.ancestry} ${character.heritage}</span>
                            </div>
                            <div class="info-item">
                                <label>Background:</label>
                                <span>${character.background}</span>
                            </div>
                            <div class="info-item">
                                <label>Alignment:</label>
                                <span>${character.alignment}</span>
                            </div>
                            <div class="info-item">
                                <label>Deity:</label>
                                <span>${character.deity}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="character-abilities-section">
                    <h3>Ability Scores</h3>
                    <div class="abilities-grid">
                        ${Object.entries(summary.abilities).map(([ability, score]) => `
                            <div class="ability-score">
                                <div class="ability-name">${ability.toUpperCase()}</div>
                                <div class="ability-value">${score}</div>
                                <div class="ability-modifier">${summary.abilityModifiers[ability] >= 0 ? '+' : ''}${summary.abilityModifiers[ability]}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="character-combat-stats">
                    <h3>Combat Stats</h3>
                    <div class="combat-stats-grid">
                        <div class="combat-stat">
                            <label>Armor Class:</label>
                            <span>${summary.ac}</span>
                        </div>
                        <div class="combat-stat">
                            <label>Hit Points:</label>
                            <span>${summary.hp}</span>
                        </div>
                        <div class="combat-stat">
                            <label>Speed:</label>
                            <span>${summary.speed} ft</span>
                        </div>
                    </div>
                </div>

                <div class="character-feats">
                    <h3>Feats</h3>
                    <div class="feats-list">
                        ${character.feats.map(feat => `
                            <div class="feat-item">
                                <span class="feat-name">${feat[0]}</span>
                                <span class="feat-level">Level ${feat[3]}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="character-spells">
                    <h3>Spellcasting</h3>
                    ${character.spellCasters.map(caster => `
                        <div class="spellcaster">
                            <h4>${caster.name} (${caster.magicTradition})</h4>
                            <div class="spell-levels">
                                ${caster.perDay.map((slots, level) => `
                                    <div class="spell-level">
                                        <span class="level">${level}</span>
                                        <span class="slots">${slots} slots</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showCharacterCards() {
        if (this.cardContainer) {
            this.cardContainer.style.display = 'block';
        }
        if (this.characterDisplay) {
            this.characterDisplay.style.display = 'none';
        }
        this.currentCharacter = null;
    }

    deleteCharacter(characterId) {
        if (confirm('Are you sure you want to delete this character?')) {
            if (this.importer.deleteCharacter(characterId)) {
                this.renderCharacterCards();
                if (this.currentCharacter && this.currentCharacter.id === characterId) {
                    this.showCharacterCards();
                }
            }
        }
    }

    getCurrentCharacter() {
        return this.currentCharacter;
    }
}

// Export for use in other modules
window.CharacterCardManager = CharacterCardManager;
