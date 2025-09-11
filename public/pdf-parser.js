class PDFParser {
    constructor() {
        this.pdfjsLib = window.pdfjsLib;
        this.setupPDFJS();
    }

    setupPDFJS() {
        // Configure PDF.js worker
        this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    async parsePDF(file) {
        try {
            console.log('Starting PDF parsing for:', file.name);
            
            // Read file as array buffer
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            
            // Load PDF document
            const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            console.log('PDF loaded, pages:', pdf.numPages);
            
            // Extract text from all pages
            let fullText = '';
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }
            
            console.log('Extracted text length:', fullText.length);
            
            // Parse character data using AI-like pattern recognition
            const characterData = await this.parseCharacterData(fullText);
            
            return characterData;
            
        } catch (error) {
            console.error('PDF parsing error:', error);
            throw new Error(`Failed to parse PDF: ${error.message}`);
        }
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    async parseCharacterData(text) {
        console.log('Parsing character data from text...');
        
        // Initialize character object
        const character = {
            name: '',
            class: '',
            level: 1,
            ancestry: '',
            heritage: '',
            background: '',
            alignment: '',
            deity: '',
            abilities: {},
            abilityModifiers: {},
            ac: 10,
            hp: 8,
            speed: 25,
            skills: [],
            feats: [],
            spells: [],
            equipment: [],
            inventory: []
        };

        // Parse basic information
        this.parseBasicInfo(text, character);
        
        // Parse ability scores
        this.parseAbilityScores(text, character);
        
        // Parse combat stats
        this.parseCombatStats(text, character);
        
        // Parse skills
        this.parseSkills(text, character);
        
        // Parse feats
        this.parseFeats(text, character);
        
        // Parse spells
        this.parseSpells(text, character);
        
        // Parse equipment
        this.parseEquipment(text, character);

        console.log('Parsed character data:', character);
        return character;
    }

    parseBasicInfo(text, character) {
        // Parse name (usually at the top)
        const nameMatch = text.match(/(?:Name|Character Name)[:\s]*([A-Za-z\s]+)/i);
        if (nameMatch) {
            character.name = nameMatch[1].trim();
        }

        // Parse class and level
        const classLevelMatch = text.match(/([A-Za-z\s]+)\s+(\d+)(?:\s+level|\s+Level)/i);
        if (classLevelMatch) {
            character.class = classLevelMatch[1].trim();
            character.level = parseInt(classLevelMatch[2]);
        }

        // Parse ancestry
        const ancestryMatch = text.match(/(?:Ancestry|Race)[:\s]*([A-Za-z\s]+)/i);
        if (ancestryMatch) {
            character.ancestry = ancestryMatch[1].trim();
        }

        // Parse background
        const backgroundMatch = text.match(/(?:Background)[:\s]*([A-Za-z\s]+)/i);
        if (backgroundMatch) {
            character.background = backgroundMatch[1].trim();
        }

        // Parse alignment
        const alignmentMatch = text.match(/(?:Alignment)[:\s]*([A-Za-z\s]+)/i);
        if (alignmentMatch) {
            character.alignment = alignmentMatch[1].trim();
        }
    }

    parseAbilityScores(text, character) {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        const abilityAbbrevs = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        
        abilities.forEach((ability, index) => {
            const abbrev = abilityAbbrevs[index];
            
            // Look for patterns like "STR 18" or "Strength 18"
            const patterns = [
                new RegExp(`${abbrev}\\s*([0-9]+)`, 'i'),
                new RegExp(`${ability}\\s*([0-9]+)`, 'i')
            ];
            
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    const score = parseInt(match[1]);
                    character.abilities[ability] = score;
                    character.abilityModifiers[ability] = Math.floor((score - 10) / 2);
                    break;
                }
            }
        });
    }

    parseCombatStats(text, character) {
        // Parse AC
        const acMatch = text.match(/(?:AC|Armor Class)[:\s]*([0-9]+)/i);
        if (acMatch) {
            character.ac = parseInt(acMatch[1]);
        }

        // Parse HP
        const hpMatch = text.match(/(?:HP|Hit Points)[:\s]*([0-9]+)/i);
        if (hpMatch) {
            character.hp = parseInt(hpMatch[1]);
        }

        // Parse Speed
        const speedMatch = text.match(/(?:Speed)[:\s]*([0-9]+)/i);
        if (speedMatch) {
            character.speed = parseInt(speedMatch[1]);
        }
    }

    parseSkills(text, character) {
        const commonSkills = [
            'acrobatics', 'arcana', 'athletics', 'crafting', 'deception', 'diplomacy',
            'intimidation', 'medicine', 'nature', 'occultism', 'performance', 'religion',
            'society', 'stealth', 'survival', 'thievery', 'perception'
        ];

        commonSkills.forEach(skill => {
            // Look for patterns like "+19Perception" or "Perception +19"
            const patterns = [
                new RegExp(`([+-]?[0-9]+)${skill}`, 'i'),
                new RegExp(`${skill}\\s*([+-]?[0-9]+)`, 'i')
            ];

            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    const modifier = parseInt(match[1]);
                    character.skills.push({
                        name: skill,
                        modifier: modifier
                    });
                    break;
                }
            }
        });
    }

    parseFeats(text, character) {
        // Look for feat patterns
        const featPatterns = [
            /(?:Feat|Feats)[:\s]*([^.\n]+)/gi,
            /([A-Za-z\s]+)\s+\(feat\)/gi
        ];

        featPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const featText = match[1].trim();
                if (featText && featText.length > 3) {
                    character.feats.push({
                        name: featText,
                        level: character.level || 1,
                        description: ''
                    });
                }
            }
        });
    }

    parseSpells(text, character) {
        // Look for spell patterns
        const spellPatterns = [
            /(?:Spell|Spells)[:\s]*([^.\n]+)/gi,
            /([A-Za-z\s]+)\s+\(spell\)/gi
        ];

        spellPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const spellText = match[1].trim();
                if (spellText && spellText.length > 3) {
                    character.spells.push({
                        name: spellText,
                        level: 1,
                        description: ''
                    });
                }
            }
        });
    }

    parseEquipment(text, character) {
        // Look for equipment patterns
        const equipmentPatterns = [
            /(?:Equipment|Gear)[:\s]*([^.\n]+)/gi,
            /([A-Za-z\s]+)\s+\(equipment\)/gi
        ];

        equipmentPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const equipmentText = match[1].trim();
                if (equipmentText && equipmentText.length > 3) {
                    character.equipment.push({
                        name: equipmentText,
                        quantity: 1,
                        description: ''
                    });
                }
            }
        });
    }
}

// Export for use in other modules
window.PDFParser = PDFParser;
