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
            inventory: [],
            // New Pathfinder 2e fields
            defenses: {},
            languages: [],
            perception: 0,
            strikes: [],
            weaponProficiencies: [],
            classDC: 0,
            reminders: [],
            ancestryFeats: [],
            classAbilities: [],
            bulk: { light: 0, bulk: 0, encumbered: 0, maximum: 0 },
            wealth: { copper: 0, silver: 0, gold: 0, platinum: 0 },
            actions: [],
            freeActions: [],
            reactions: [],
            magicalTradition: '',
            spellSlots: {},
            spellStatistics: {},
            focusSpells: [],
            innateSpells: [],
            rituals: []
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
        
        // Parse additional Pathfinder 2e specific fields
        this.parseDefenses(text, character);
        this.parseLanguages(text, character);
        this.parsePerception(text, character);
        this.parseSpeed(text, character);
        this.parseStrikes(text, character);
        this.parseWeaponProficiencies(text, character);
        this.parseClassDC(text, character);
        this.parseReminders(text, character);
        this.parseAncestryFeats(text, character);
        this.parseClassAbilities(text, character);
        this.parseInventory(text, character);
        this.parseBulk(text, character);
        this.parseWealth(text, character);
        this.parseActions(text, character);
        this.parseFreeActions(text, character);
        this.parseMagicalTradition(text, character);
        this.parseSpellSlots(text, character);
        this.parseSpellStatistics(text, character);
        this.parseFocusSpells(text, character);
        this.parseInnateSpells(text, character);
        this.parseRituals(text, character);

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

    // New Pathfinder 2e specific parsing methods
    parseDefenses(text, character) {
        console.log('Parsing defenses...');
        
        // Parse Fortitude, Reflex, Will saves
        const defensePatterns = [
            /Fortitude[:\s]*([+-]?\d+)/i,
            /Reflex[:\s]*([+-]?\d+)/i,
            /Will[:\s]*([+-]?\d+)/i
        ];
        
        character.defenses = {
            fortitude: 0,
            reflex: 0,
            will: 0
        };
        
        const defenseNames = ['fortitude', 'reflex', 'will'];
        defenseNames.forEach((defense, index) => {
            const match = text.match(defensePatterns[index]);
            if (match) {
                character.defenses[defense] = parseInt(match[1]);
                console.log(`Found ${defense}:`, character.defenses[defense]);
            }
        });
    }

    parseLanguages(text, character) {
        console.log('Parsing languages...');
        
        const languagePatterns = [
            /(?:Languages|Language)[:\s]*([^.\n]+)/i,
            /Common,?\s*([^.\n]+)/i
        ];
        
        for (const pattern of languagePatterns) {
            const match = text.match(pattern);
            if (match) {
                const languages = match[1].split(/[,\n]/).map(lang => lang.trim()).filter(lang => lang.length > 0);
                character.languages = languages;
                console.log('Found languages:', character.languages);
                break;
            }
        }
    }

    parsePerception(text, character) {
        console.log('Parsing perception...');
        
        const perceptionPatterns = [
            /Perception[:\s]*([+-]?\d+)/i,
            /Perception\s+([+-]?\d+)/i
        ];
        
        for (const pattern of perceptionPatterns) {
            const match = text.match(pattern);
            if (match) {
                character.perception = parseInt(match[1]);
                console.log('Found perception:', character.perception);
                break;
            }
        }
    }

    parseSpeed(text, character) {
        // Speed is already parsed in parseCombatStats, but let's enhance it
        console.log('Parsing speed details...');
        
        const speedPatterns = [
            /Speed[:\s]*(\d+)\s*feet/i,
            /Speed[:\s]*(\d+)/i
        ];
        
        for (const pattern of speedPatterns) {
            const match = text.match(pattern);
            if (match) {
                character.speed = parseInt(match[1]);
                console.log('Found speed:', character.speed);
                break;
            }
        }
    }

    parseStrikes(text, character) {
        console.log('Parsing strikes...');
        
        const strikePatterns = [
            /([A-Za-z\s]+)\s+([+-]?\d+)\s+to\s+hit/i,
            /Strike[:\s]*([A-Za-z\s]+)/i
        ];
        
        for (const pattern of strikePatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                if (match[1] && match[1].trim().length > 2) {
                    character.strikes.push({
                        name: match[1].trim(),
                        bonus: match[2] ? parseInt(match[2]) : 0,
                        damage: '',
                        type: ''
                    });
                }
            }
        }
        
        console.log('Found strikes:', character.strikes.length);
    }

    parseWeaponProficiencies(text, character) {
        console.log('Parsing weapon proficiencies...');
        
        const proficiencyPatterns = [
            /(?:Weapon Proficiencies|Proficiencies)[:\s]*([^.\n]+)/i,
            /(?:Simple|Martial|Advanced)\s+Weapons/i
        ];
        
        for (const pattern of proficiencyPatterns) {
            const match = text.match(pattern);
            if (match) {
                const proficiencies = match[1].split(/[,\n]/).map(prof => prof.trim()).filter(prof => prof.length > 0);
                character.weaponProficiencies = proficiencies;
                console.log('Found weapon proficiencies:', character.weaponProficiencies);
                break;
            }
        }
    }

    parseClassDC(text, character) {
        console.log('Parsing class DC...');
        
        const classDCPatterns = [
            /Class DC[:\s]*(\d+)/i,
            /DC[:\s]*(\d+)/i
        ];
        
        for (const pattern of classDCPatterns) {
            const match = text.match(pattern);
            if (match) {
                character.classDC = parseInt(match[1]);
                console.log('Found class DC:', character.classDC);
                break;
            }
        }
    }

    parseReminders(text, character) {
        console.log('Parsing reminders...');
        
        const reminderPatterns = [
            /(?:Reminders|Notes)[:\s]*([^.\n]+)/i,
            /Remember[:\s]*([^.\n]+)/i
        ];
        
        for (const pattern of reminderPatterns) {
            const match = text.match(pattern);
            if (match) {
                const reminders = match[1].split(/[,\n]/).map(rem => rem.trim()).filter(rem => rem.length > 0);
                character.reminders = reminders;
                console.log('Found reminders:', character.reminders);
                break;
            }
        }
    }

    parseAncestryFeats(text, character) {
        console.log('Parsing ancestry feats...');
        
        const ancestryFeatPatterns = [
            /(?:Ancestry Feats|Ancestry and General Feats)[:\s]*([^.\n]+)/i,
            /Ancestry[:\s]*([A-Za-z\s]+)/i
        ];
        
        for (const pattern of ancestryFeatPatterns) {
            const match = text.match(pattern);
            if (match) {
                const feats = match[1].split(/[,\n]/).map(feat => feat.trim()).filter(feat => feat.length > 0);
                character.ancestryFeats = feats;
                console.log('Found ancestry feats:', character.ancestryFeats);
                break;
            }
        }
    }

    parseClassAbilities(text, character) {
        console.log('Parsing class abilities...');
        
        const classAbilityPatterns = [
            /(?:Class Abilities|Class Features)[:\s]*([^.\n]+)/i,
            /(?:Abilities|Features)[:\s]*([^.\n]+)/i
        ];
        
        for (const pattern of classAbilityPatterns) {
            const match = text.match(pattern);
            if (match) {
                const abilities = match[1].split(/[,\n]/).map(ability => ability.trim()).filter(ability => ability.length > 0);
                character.classAbilities = abilities;
                console.log('Found class abilities:', character.classAbilities);
                break;
            }
        }
    }

    parseInventory(text, character) {
        console.log('Parsing inventory...');
        
        const inventoryPatterns = [
            /(?:Inventory|Equipment)[:\s]*([^.\n]+)/i,
            /Gear[:\s]*([^.\n]+)/i
        ];
        
        for (const pattern of inventoryPatterns) {
            const match = text.match(pattern);
            if (match) {
                const items = match[1].split(/[,\n]/).map(item => item.trim()).filter(item => item.length > 0);
                character.inventory = items.map(item => ({
                    name: item,
                    quantity: 1,
                    bulk: 0
                }));
                console.log('Found inventory items:', character.inventory.length);
                break;
            }
        }
    }

    parseBulk(text, character) {
        console.log('Parsing bulk...');
        
        const bulkPatterns = [
            /Bulk[:\s]*(\d+\.?\d*)/i,
            /Light[:\s]*(\d+\.?\d*)/i,
            /Encumbered[:\s]*(\d+\.?\d*)/i
        ];
        
        character.bulk = {
            light: 0,
            bulk: 0,
            encumbered: 0,
            maximum: 0
        };
        
        const bulkKeys = ['bulk', 'light', 'encumbered'];
        bulkKeys.forEach((key, index) => {
            const match = text.match(bulkPatterns[index]);
            if (match) {
                character.bulk[key] = parseFloat(match[1]);
                console.log(`Found ${key} bulk:`, character.bulk[key]);
            }
        });
    }

    parseWealth(text, character) {
        console.log('Parsing wealth...');
        
        const wealthPatterns = [
            /Copper[:\s]*(\d+)/i,
            /Silver[:\s]*(\d+)/i,
            /Gold[:\s]*(\d+)/i,
            /Platinum[:\s]*(\d+)/i
        ];
        
        character.wealth = {
            copper: 0,
            silver: 0,
            gold: 0,
            platinum: 0
        };
        
        const wealthKeys = ['copper', 'silver', 'gold', 'platinum'];
        wealthKeys.forEach((key, index) => {
            const match = text.match(wealthPatterns[index]);
            if (match) {
                character.wealth[key] = parseInt(match[1]);
                console.log(`Found ${key}:`, character.wealth[key]);
            }
        });
    }

    parseActions(text, character) {
        console.log('Parsing actions...');
        
        const actionPatterns = [
            /(?:Actions|Activities)[:\s]*([^.\n]+)/i,
            /Action[:\s]*([A-Za-z\s]+)/i
        ];
        
        for (const pattern of actionPatterns) {
            const match = text.match(pattern);
            if (match) {
                const actions = match[1].split(/[,\n]/).map(action => action.trim()).filter(action => action.length > 0);
                character.actions = actions;
                console.log('Found actions:', character.actions);
                break;
            }
        }
    }

    parseFreeActions(text, character) {
        console.log('Parsing free actions and reactions...');
        
        const freeActionPatterns = [
            /(?:Free Actions|Reactions)[:\s]*([^.\n]+)/i,
            /Reaction[:\s]*([A-Za-z\s]+)/i
        ];
        
        for (const pattern of freeActionPatterns) {
            const match = text.match(pattern);
            if (match) {
                const actions = match[1].split(/[,\n]/).map(action => action.trim()).filter(action => action.length > 0);
                character.freeActions = actions;
                console.log('Found free actions:', character.freeActions);
                break;
            }
        }
    }

    parseMagicalTradition(text, character) {
        console.log('Parsing magical tradition...');
        
        const traditionPatterns = [
            /(?:Magical Tradition|Tradition)[:\s]*([A-Za-z\s]+)/i,
            /(?:Arcane|Divine|Occult|Primal)/i
        ];
        
        for (const pattern of traditionPatterns) {
            const match = text.match(pattern);
            if (match) {
                character.magicalTradition = match[1].trim();
                console.log('Found magical tradition:', character.magicalTradition);
                break;
            }
        }
    }

    parseSpellSlots(text, character) {
        console.log('Parsing spell slots...');
        
        const spellSlotPatterns = [
            /1st[:\s]*(\d+)/i,
            /2nd[:\s]*(\d+)/i,
            /3rd[:\s]*(\d+)/i,
            /4th[:\s]*(\d+)/i,
            /5th[:\s]*(\d+)/i
        ];
        
        character.spellSlots = {};
        
        const levels = ['1st', '2nd', '3rd', '4th', '5th'];
        levels.forEach((level, index) => {
            const match = text.match(spellSlotPatterns[index]);
            if (match) {
                character.spellSlots[level] = parseInt(match[1]);
                console.log(`Found ${level} spell slots:`, character.spellSlots[level]);
            }
        });
    }

    parseSpellStatistics(text, character) {
        console.log('Parsing spell statistics...');
        
        const spellStatPatterns = [
            /(?:Spell Attack|Attack)[:\s]*([+-]?\d+)/i,
            /(?:Spell DC|DC)[:\s]*(\d+)/i
        ];
        
        character.spellStatistics = {
            attack: 0,
            dc: 0
        };
        
        const statKeys = ['attack', 'dc'];
        statKeys.forEach((key, index) => {
            const match = text.match(spellStatPatterns[index]);
            if (match) {
                character.spellStatistics[key] = parseInt(match[1]);
                console.log(`Found spell ${key}:`, character.spellStatistics[key]);
            }
        });
    }

    parseFocusSpells(text, character) {
        console.log('Parsing focus spells...');
        
        const focusSpellPatterns = [
            /(?:Focus Spells|Focus)[:\s]*([^.\n]+)/i,
            /Focus[:\s]*([A-Za-z\s]+)/i
        ];
        
        for (const pattern of focusSpellPatterns) {
            const match = text.match(pattern);
            if (match) {
                const spells = match[1].split(/[,\n]/).map(spell => spell.trim()).filter(spell => spell.length > 0);
                character.focusSpells = spells;
                console.log('Found focus spells:', character.focusSpells);
                break;
            }
        }
    }

    parseInnateSpells(text, character) {
        console.log('Parsing innate spells...');
        
        const innateSpellPatterns = [
            /(?:Innate Spells|Innate)[:\s]*([^.\n]+)/i,
            /Innate[:\s]*([A-Za-z\s]+)/i
        ];
        
        for (const pattern of innateSpellPatterns) {
            const match = text.match(pattern);
            if (match) {
                const spells = match[1].split(/[,\n]/).map(spell => spell.trim()).filter(spell => spell.length > 0);
                character.innateSpells = spells;
                console.log('Found innate spells:', character.innateSpells);
                break;
            }
        }
    }

    parseRituals(text, character) {
        console.log('Parsing rituals...');
        
        const ritualPatterns = [
            /(?:Rituals|Ritual)[:\s]*([^.\n]+)/i,
            /Ritual[:\s]*([A-Za-z\s]+)/i
        ];
        
        for (const pattern of ritualPatterns) {
            const match = text.match(pattern);
            if (match) {
                const rituals = match[1].split(/[,\n]/).map(ritual => ritual.trim()).filter(ritual => ritual.length > 0);
                character.rituals = rituals;
                console.log('Found rituals:', character.rituals);
                break;
            }
        }
    }
}

// Export for use in other modules
window.PDFParser = PDFParser;
