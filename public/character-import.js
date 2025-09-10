// Pathfinder Character Import System
class CharacterImporter {
    constructor() {
        this.supportedClasses = ['Wizard', 'Cleric', 'Fighter', 'Rogue', 'Ranger', 'Paladin', 'Barbarian', 'Bard', 'Druid', 'Monk', 'Sorcerer', 'Warlock'];
        this.importedCharacters = [];
        console.log('CharacterImporter initialized');
    }

    // Load characters from database or localStorage
    async loadCharacters() {
        console.log('Loading characters...');
        console.log('Auth manager available:', !!window.authManager);
        console.log('User authenticated:', window.authManager ? window.authManager.isUserAuthenticated() : false);
        
        if (window.authManager && window.authManager.isUserAuthenticated()) {
            // Load from database
            try {
                const token = window.authManager.getToken();
                console.log('Token available:', !!token);
                
                const response = await fetch('/api/characters', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Database response status:', response.status);
                
                if (response.ok) {
                    const characters = await response.json();
                    this.importedCharacters = characters;
                    console.log('Loaded characters from database:', characters.length);
                    console.log('Characters:', characters);
                } else {
                    console.error('Failed to load characters from database, falling back to localStorage');
                    this.importedCharacters = this.loadFromStorage();
                }
            } catch (error) {
                console.error('Error loading characters from database:', error);
                this.importedCharacters = this.loadFromStorage();
            }
        } else {
            // User not authenticated - clear characters
            console.log('User not authenticated - clearing characters');
            this.importedCharacters = [];
        }
        
        console.log('Final character count:', this.importedCharacters.length);
    }

    // Load characters from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('pathfinder_characters');
            if (!stored) {
                console.log('No characters in localStorage');
                return [];
            }
            
            const result = JSON.parse(stored);
            if (!Array.isArray(result)) {
                console.error('Invalid character data format in localStorage');
                localStorage.removeItem('pathfinder_characters');
                return [];
            }
            
            console.log('Loaded characters from storage:', result.length);
            return result;
        } catch (error) {
            console.error('Error loading characters from storage:', error);
            // Clear corrupted data
            localStorage.removeItem('pathfinder_characters');
            return [];
        }
    }

    // Save characters to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('pathfinder_characters', JSON.stringify(this.importedCharacters));
            console.log('Characters saved to storage, count:', this.importedCharacters.length);
        } catch (error) {
            console.error('Error saving characters to storage:', error);
        }
    }

    // Import character from Pathbuilder JSON
    async importCharacter(pathbuilderJson) {
        try {
            console.log('Importing character from JSON');
            
            const character = this.parsePathbuilderJson(pathbuilderJson);
            if (character) {
                character.id = this.generateId();
                character.importedAt = new Date().toISOString();
                
                // Try to save to database if user is authenticated
                if (window.authManager && window.authManager.isUserAuthenticated()) {
                    try {
                        const savedCharacter = await this.saveCharacterToDatabase(character);
                        console.log('Character saved to database:', savedCharacter.name);
                        return savedCharacter;
                    } catch (dbError) {
                        console.warn('Database save failed, saving to localStorage:', dbError.message);
                        this.importedCharacters.push(character);
                        this.saveToStorage();
                        return character;
                    }
                } else {
                    // Save to localStorage if not authenticated
                    this.importedCharacters.push(character);
                    this.saveToStorage();
                    return character;
                }
                
                console.log('Character imported successfully:', character.name, 'ID:', character.id);
                return character;
            } else {
                console.error('Failed to parse character');
                return null;
            }
        } catch (error) {
            console.error('Error importing character:', error);
            throw new Error('Failed to import character: ' + error.message);
        }
    }

    // Save character to database
    async saveCharacterToDatabase(character) {
        try {
            const response = await fetch('/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ characterData: character })
            });

            if (response.ok) {
                const savedCharacter = await response.json();
                console.log('Character saved to database:', savedCharacter.id);
                return savedCharacter;
            } else {
                console.error('Failed to save character to database');
                throw new Error('Failed to save character to database');
            }
        } catch (error) {
            console.error('Error saving character to database:', error);
            throw error;
        }
    }

    // Parse Pathbuilder JSON format
    parsePathbuilderJson(jsonData) {
        console.log('Parsing Pathbuilder JSON');
        if (!jsonData.success || !jsonData.build) {
            throw new Error('Invalid Pathbuilder JSON format');
        }

        const build = jsonData.build;
        console.log('Build data:', build);
        
        // Basic character info
        const character = {
            name: build.name || 'Unknown',
            class: build.class || 'Unknown',
            level: build.level || 1,
            ancestry: build.ancestry || 'Unknown',
            heritage: build.heritage || 'Unknown',
            background: build.background || 'Unknown',
            alignment: build.alignment || 'N',
            gender: build.gender || 'Unknown',
            age: build.age || 'Unknown',
            deity: build.deity || 'None',
            size: build.size || 2,
            sizeName: build.sizeName || 'Medium',
            keyAbility: build.keyability || 'str',
            languages: build.languages || [],
            resistances: build.resistances || [],
            specials: build.specials || [],
            lores: build.lores || [],
            
            // Abilities
            abilities: {
                str: build.abilities?.str || 10,
                dex: build.abilities?.dex || 10,
                con: build.abilities?.con || 10,
                int: build.abilities?.int || 10,
                wis: build.abilities?.wis || 10,
                cha: build.abilities?.cha || 10
            },
            
            // Ability modifiers
            abilityModifiers: this.calculateAbilityModifiers(build.abilities),
            
            // Attributes
            attributes: {
                ancestryHp: build.attributes?.ancestryhp || 0,
                classHp: build.attributes?.classhp || 0,
                bonusHp: build.attributes?.bonushp || 0,
                bonusHpPerLevel: build.attributes?.bonushpPerLevel || 0,
                speed: build.attributes?.speed || 25,
                speedBonus: build.attributes?.speedBonus || 0
            },
            
            // Proficiencies
            proficiencies: build.proficiencies || {},
            
            // Feats
            feats: build.feats || [],
            
            // Equipment
            equipment: build.equipment || [],
            weapons: build.weapons || [],
            armor: build.armor || [],
            money: build.money || { cp: 0, sp: 0, gp: 0, pp: 0 },
            
            // Spellcasting
            spellCasters: build.spellCasters || [],
            focusPoints: build.focusPoints || 0,
            focus: build.focus || {},
            
            // AC
            acTotal: build.acTotal || { acTotal: 10 },
            
            // Pets and Familiars
            pets: build.pets || [],
            familiars: build.familiars || [],
            
            // Original Pathbuilder data for reference
            originalData: build
        };

        console.log('Character parsed successfully:', character.name);
        return character;
    }

    // Calculate ability modifiers
    calculateAbilityModifiers(abilities) {
        const modifiers = {};
        for (const [ability, score] of Object.entries(abilities)) {
            modifiers[ability] = Math.floor((score - 10) / 2);
        }
        return modifiers;
    }

    // Generate unique ID
    generateId() {
        return 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get all imported characters
    getAllCharacters() {
        console.log('Getting all characters, count:', this.importedCharacters.length);
        return this.importedCharacters;
    }

    // Get character by ID
    getCharacterById(id) {
        const character = this.importedCharacters.find(char => char.id === id);
        console.log('Getting character by ID:', id, 'Found:', !!character);
        return character;
    }

    // Delete character
    deleteCharacter(id) {
        const index = this.importedCharacters.findIndex(char => char.id === id);
        if (index > -1) {
            this.importedCharacters.splice(index, 1);
            this.saveToStorage();
            console.log('Character deleted:', id);
            return true;
        }
        return false;
    }

    // Update character
    updateCharacter(id, updates) {
        const character = this.getCharacterById(id);
        if (character) {
            Object.assign(character, updates);
            this.saveToStorage();
            return character;
        }
        return null;
    }

    // Validate Pathbuilder JSON
    validatePathbuilderJson(jsonData) {
        try {
            console.log('Validating JSON data:', jsonData);
            
            if (!jsonData) {
                return { valid: false, error: 'No JSON data provided' };
            }
            
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (!data.success) {
                return { valid: false, error: 'Invalid Pathbuilder JSON: success field missing' };
            }
            
            if (!data.build) {
                return { valid: false, error: 'Invalid Pathbuilder JSON: build data missing' };
            }
            
            const build = data.build;
            
            if (!build.name) {
                return { valid: false, error: 'Character name is required' };
            }
            
            if (!build.class) {
                return { valid: false, error: 'Character class is required' };
            }
            
            if (!build.abilities) {
                return { valid: false, error: 'Character abilities are required' };
            }
            
            console.log('JSON validation successful');
            return { valid: true };
        } catch (error) {
            console.error('JSON validation error:', error);
            return { valid: false, error: 'Invalid JSON format: ' + error.message };
        }
    }

    // Export character to Pathbuilder format
    exportCharacter(id) {
        const character = this.getCharacterById(id);
        if (character && character.originalData) {
            return {
                success: true,
                build: character.originalData
            };
        }
        return null;
    }

    // Get character summary for display
    getCharacterSummary(character) {
        return {
            id: character.id,
            name: character.name,
            class: character.class,
            level: character.level,
            ancestry: character.ancestry,
            heritage: character.heritage,
            background: character.background,
            keyAbility: character.keyAbility,
            abilities: character.abilities,
            abilityModifiers: character.abilityModifiers,
            ac: character.acTotal?.acTotal || 10,
            hp: this.calculateTotalHp(character),
            speed: character.attributes?.speed || 25,
            importedAt: character.importedAt
        };
    }

    // Calculate total HP
    calculateTotalHp(character) {
        const attrs = character.attributes;
        const conMod = character.abilityModifiers?.con || 0;
        const baseHp = (attrs?.ancestryHp || 0) + (attrs?.classHp || 0) + (attrs?.bonusHp || 0);
        const levelHp = (character.level - 1) * ((attrs?.classHp || 0) + (attrs?.bonusHpPerLevel || 0) + conMod);
        return baseHp + levelHp;
    }

    // Get characters by class
    getCharactersByClass(className) {
        return this.importedCharacters.filter(char => char.class === className);
    }

    // Search characters
    searchCharacters(query) {
        const lowerQuery = query.toLowerCase();
        return this.importedCharacters.filter(char => 
            char.name.toLowerCase().includes(lowerQuery) ||
            char.class.toLowerCase().includes(lowerQuery) ||
            char.ancestry.toLowerCase().includes(lowerQuery) ||
            char.background.toLowerCase().includes(lowerQuery)
        );
    }
}

// Export for use in other modules
window.CharacterImporter = CharacterImporter;
