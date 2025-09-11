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
        console.log('Parsing basic info from text...');
        console.log('Text preview:', text.substring(0, 500));
        
        // Parse name - more specific patterns for Pathfinder character sheets
        const namePatterns = [
            /(?:Name|Character Name)[:\s]*([A-Za-z\s]+?)(?:\n|Class|Level|Ancestry)/i,
            /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+Level|\s+Class|\s+Ancestry|\n)/m,
            /Character:\s*([A-Za-z\s]+?)(?:\n|Class|Level)/i,
            /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+\d+|\s+level)/m
        ];
        
        for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match && match[1].trim().length > 2 && match[1].trim().length < 50) {
                // Filter out common false positives
                const name = match[1].trim();
                if (!name.includes('Unarmed') && !name.includes('Simple') && 
                    !name.includes('Martial') && !name.includes('Advanced') &&
                    !name.includes('Other') && !name.includes('T E M L') &&
                    !name.includes('B P S') && !name.includes('Background') &&
                    !name.includes('Notes') && !name.includes('Skills') &&
                    !name.includes('Feats') && !name.includes('Spells')) {
                    character.name = name;
                    console.log('Found name:', character.name);
                    break;
                }
            }
        }

        // Parse class and level - more specific patterns
        const classLevelPatterns = [
            /([A-Za-z\s]+)\s+(\d+)(?:\s+level|\s+Level)/i,
            /Level\s+(\d+)\s+([A-Za-z\s]+)/i,
            /Class[:\s]*([A-Za-z\s]+).*?Level[:\s]*(\d+)/i,
            /([A-Za-z]+)\s+(\d+)(?:\s|$)/m
        ];
        
        for (const pattern of classLevelPatterns) {
            const match = text.match(pattern);
            if (match && match[1] && match[2]) {
                const className = match[1].trim();
                const level = parseInt(match[2]);
                
                // Filter out false positives for class
                if (className.length > 2 && className.length < 30 && 
                    !className.includes('Unarmed') && !className.includes('Simple') &&
                    !className.includes('Martial') && !className.includes('Advanced') &&
                    !className.includes('Other') && !className.includes('Background') &&
                    !className.includes('Notes') && !className.includes('Skills') &&
                    level >= 1 && level <= 20) {
                    character.class = className;
                    character.level = level;
                    console.log('Found class:', character.class, 'level:', character.level);
                    break;
                }
            }
        }

        // Parse ancestry - multiple patterns
        const ancestryPatterns = [
            /(?:Ancestry|Race)[:\s]*([A-Za-z\s]+?)(?:\n|$)/i,
            /Ancestry[:\s]*([A-Za-z]+)/i,
            /Race[:\s]*([A-Za-z]+)/i
        ];
        
        for (const pattern of ancestryPatterns) {
            const match = text.match(pattern);
            if (match && match[1].trim().length > 2) {
                character.ancestry = match[1].trim();
                console.log('Found ancestry:', character.ancestry);
                break;
            }
        }

        // Parse background
        const backgroundPatterns = [
            /(?:Background)[:\s]*([A-Za-z\s]+?)(?:\n|$)/i,
            /Background[:\s]*([A-Za-z]+)/i
        ];
        
        for (const pattern of backgroundPatterns) {
            const match = text.match(pattern);
            if (match && match[1].trim().length > 2) {
                character.background = match[1].trim();
                console.log('Found background:', character.background);
                break;
            }
        }

        // Parse alignment
        const alignmentPatterns = [
            /(?:Alignment)[:\s]*([A-Za-z\s]+?)(?:\n|$)/i,
            /Alignment[:\s]*([A-Za-z]+)/i
        ];
        
        for (const pattern of alignmentPatterns) {
            const match = text.match(pattern);
            if (match && match[1].trim().length > 1) {
                character.alignment = match[1].trim();
                console.log('Found alignment:', character.alignment);
                break;
            }
        }
    }

    parseAbilityScores(text, character) {
        console.log('Parsing ability scores...');
        
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        const abilityAbbrevs = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        
        abilities.forEach((ability, index) => {
            const abbrev = abilityAbbrevs[index];
            
            // Multiple patterns for each ability
            const patterns = [
                new RegExp(`${abbrev}\\s*([0-9]+)`, 'i'),
                new RegExp(`${ability}\\s*([0-9]+)`, 'i'),
                new RegExp(`${abbrev.toUpperCase()}\\s*([0-9]+)`, 'i'),
                new RegExp(`${abbrev}:\\s*([0-9]+)`, 'i'),
                new RegExp(`${ability}:\\s*([0-9]+)`, 'i')
            ];
            
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    const score = parseInt(match[1]);
                    if (score >= 1 && score <= 30) { // Valid ability score range
                        character.abilities[ability] = score;
                        character.abilityModifiers[ability] = Math.floor((score - 10) / 2);
                        console.log(`Found ${ability}: ${score} (mod: ${character.abilityModifiers[ability]})`);
                        break;
                    }
                }
            }
        });
    }

    parseCombatStats(text, character) {
        console.log('Parsing combat stats...');
        
        // Parse AC - multiple patterns
        const acPatterns = [
            /(?:AC|Armor Class)[:\s]*([0-9]+)/i,
            /AC[:\s]*([0-9]+)/i,
            /Armor Class[:\s]*([0-9]+)/i
        ];
        
        for (const pattern of acPatterns) {
            const match = text.match(pattern);
            if (match) {
                const ac = parseInt(match[1]);
                if (ac >= 0 && ac <= 50) { // Valid AC range
                    character.ac = ac;
                    console.log('Found AC:', character.ac);
                    break;
                }
            }
        }

        // Parse HP - multiple patterns
        const hpPatterns = [
            /(?:HP|Hit Points)[:\s]*([0-9]+)/i,
            /HP[:\s]*([0-9]+)/i,
            /Hit Points[:\s]*([0-9]+)/i,
            /Health[:\s]*([0-9]+)/i
        ];
        
        for (const pattern of hpPatterns) {
            const match = text.match(pattern);
            if (match) {
                const hp = parseInt(match[1]);
                if (hp >= 1 && hp <= 1000) { // Valid HP range
                    character.hp = hp;
                    console.log('Found HP:', character.hp);
                    break;
                }
            }
        }

        // Parse Speed - multiple patterns
        const speedPatterns = [
            /(?:Speed)[:\s]*([0-9]+)/i,
            /Speed[:\s]*([0-9]+)/i,
            /Movement[:\s]*([0-9]+)/i
        ];
        
        for (const pattern of speedPatterns) {
            const match = text.match(pattern);
            if (match) {
                const speed = parseInt(match[1]);
                if (speed >= 0 && speed <= 200) { // Valid speed range
                    character.speed = speed;
                    console.log('Found Speed:', character.speed);
                    break;
                }
            }
        }
    }

    parseSkills(text, character) {
        console.log('Parsing skills...');
        
        const commonSkills = [
            'acrobatics', 'arcana', 'athletics', 'crafting', 'deception', 'diplomacy',
            'intimidation', 'medicine', 'nature', 'occultism', 'performance', 'religion',
            'society', 'stealth', 'survival', 'thievery', 'perception'
        ];

        commonSkills.forEach(skill => {
            // Multiple patterns for each skill
            const patterns = [
                new RegExp(`([+-]?[0-9]+)${skill}`, 'i'),
                new RegExp(`${skill}\\s*([+-]?[0-9]+)`, 'i'),
                new RegExp(`${skill}\\s*[:\s]*([+-]?[0-9]+)`, 'i'),
                new RegExp(`([+-]?[0-9]+)\\s*${skill}`, 'i')
            ];

            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    const modifier = parseInt(match[1]);
                    if (modifier >= -10 && modifier <= 50) { // Valid skill modifier range
                        character.skills.push({
                            name: skill,
                            modifier: modifier
                        });
                        console.log(`Found skill ${skill}: ${modifier >= 0 ? '+' : ''}${modifier}`);
                        break;
                    }
                }
            }
        });
        
        console.log(`Total skills found: ${character.skills.length}`);
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
