// Pathfinder 2e Character Sheet JavaScript

// Character data from Pathbuilder JSON
const characterData = {
    "success": true,
    "build": {
        "name": "Wharsh",
        "class": "Wizard",
        "dualClass": null,
        "level": 12,
        "xp": 0,
        "ancestry": "Strix",
        "heritage": "Aiuvarin",
        "background": "Seer Of The Dead",
        "alignment": "N",
        "gender": "Male",
        "age": "21",
        "deity": "Mistis",
        "size": 2,
        "sizeName": "Medium",
        "keyability": "int",
        "languages": ["Common", "Draconic", "Dwarven", "Empyrean", "Fey", "Necril", "Strix"],
        "rituals": [],
        "resistances": [],
        "inventorMods": [],
        "abilities": {
            "str": 10,
            "dex": 12,
            "con": 18,
            "int": 19,
            "wis": 16,
            "cha": 16,
            "breakdown": {
                "ancestryFree": ["Int"],
                "ancestryBoosts": ["Dex"],
                "ancestryFlaws": [],
                "backgroundBoosts": ["Con"],
                "classBoosts": ["Int"],
                "mapLevelledBoosts": {
                    "1": ["Con", "Wis", "Int", "Cha"],
                    "5": ["Con", "Wis", "Int", "Cha"],
                    "10": ["Con", "Wis", "Int", "Cha"]
                }
            }
        },
        "attributes": {
            "ancestryhp": 8,
            "classhp": 6,
            "bonushp": 0,
            "bonushpPerLevel": 0,
            "speed": 25,
            "speedBonus": 0
        },
        "proficiencies": {
            "classDC": 2,
            "perception": 4,
            "fortitude": 4,
            "reflex": 4,
            "will": 4,
            "heavy": 0,
            "medium": 0,
            "light": 0,
            "unarmored": 2,
            "advanced": 0,
            "martial": 0,
            "simple": 4,
            "unarmed": 4,
            "castingArcane": 4,
            "castingDivine": 0,
            "castingOccult": 0,
            "castingPrimal": 2,
            "acrobatics": 0,
            "arcana": 6,
            "athletics": 0,
            "crafting": 4,
            "deception": 2,
            "diplomacy": 0,
            "intimidation": 0,
            "medicine": 2,
            "nature": 2,
            "occultism": 2,
            "performance": 0,
            "religion": 2,
            "society": 2,
            "stealth": 0,
            "survival": 0,
            "thievery": 0
        },
        "mods": {},
        "feats": [
            ["Familiar", null, "Awarded Feat", 1],
            ["Aiuvarin", null, "Heritage", 1, "Heritage Feat", "standardChoice", null],
            ["Wildborn Magic", null, "Ancestry Feat", 1, "Strix Feat 1", "standardChoice", null],
            ["Tattoo Artist", null, "Skill Feat", 2, "Skill Feat 2", "standardChoice", null],
            ["Chronoskimmer Dedication", null, "Class Feat", 2, "Wizard Feat 2", "standardChoice", null],
            ["Canny Acumen", "Will", "General Feat", 3, "General Feat 3", "standardChoice", null],
            ["Read Psychometric Resonance", null, "Skill Feat", 4, "Skill Feat 4", "standardChoice", null],
            ["Turn Back the Clock", null, "Class Feat", 4, "Wizard Feat 4", "standardChoice", null],
            ["Feathered Cloak", null, "Ancestry Feat", 5, "Strix Feat 5", "standardChoice", null],
            ["Student of the Canon", null, "Skill Feat", 6, "Skill Feat 6", "standardChoice", null],
            ["Guide the Timeline", null, "Class Feat", 6, "Wizard Feat 6", "standardChoice", null],
            ["Ancestral Paragon", null, "General Feat", 7, "General Feat 7", "parentChoice", null],
            ["Fledgling Flight", null, "Ancestry Feat", 7, "Ancestral Paragon FeatGeneral Feat 7", "childChoice", "General Feat 7"],
            ["Arcane Sense", null, "Skill Feat", 8, "Skill Feat 8", "standardChoice", null],
            ["Advanced School Spell", null, "Class Feat", 8, "Wizard Feat 8", "standardChoice", null],
            ["Otherworldly Acumen", null, "Ancestry Feat", 9, "Strix Feat 9", "standardChoice", null],
            ["Quick Identification", null, "Skill Feat", 10, "Skill Feat 10", "standardChoice", null],
            ["Scroll Adept", null, "Class Feat", 10, "Wizard Feat 10", "standardChoice", null],
            ["Axuma's Awakening", null, "General Feat", 11, "General Feat 11", "standardChoice", null]
        ],
        "specials": [
            "Arcane School: School of the Boundary",
            "Arcane Thesis: Improved Familiar Attunement",
            "Arcane Bond",
            "Drain Bonded Item",
            "Spellbook",
            "Wizard Spellcasting",
            "Low-Light Vision",
            "Wings (Strix)",
            "Low-Light Vision",
            "Reflex Expertise",
            "Expert Spellcaster",
            "Magical Fortitude",
            "Arcane",
            "Perception Expertise",
            "Weapon Expertise",
            "Aiuvarin"
        ],
        "lores": [["Undead", 6]],
        "equipmentContainers": {},
        "equipment": [],
        "specificProficiencies": {
            "trained": [],
            "expert": [],
            "master": [],
            "legendary": []
        },
        "weapons": [],
        "money": {
            "cp": 0,
            "sp": 0,
            "gp": 15,
            "pp": 0
        },
        "armor": [],
        "spellCasters": [
            {
                "name": "Wizard",
                "magicTradition": "arcane",
                "spellcastingType": "prepared",
                "ability": "int",
                "proficiency": 4,
                "focusPoints": 0,
                "innate": false,
                "perDay": [6, 4, 5, 4, 4, 5, 4, 0, 0, 0, 0],
                "spells": [],
                "prepared": [
                    {"spellLevel": 0, "list": ["Detect Magic", "Shield", "Detect Metal", "Glass Shield", "Root Reading", "Telekinetic Hand"]},
                    {"spellLevel": 1, "list": ["Charm", "Weaken Earth", "Mage Armor", "Phantasmal Minion"]},
                    {"spellLevel": 2, "list": ["Brine Dragon Bile", "Hidebound", "Web", "See the Unseen", "Spirit Sense"]},
                    {"spellLevel": 3, "list": ["Time Jump", "Shared Invisibility", "Blindness", "Ghostly Weapon"]},
                    {"spellLevel": 4, "list": ["Magic Mailbox", "Mountain Resilience", "Zephyr Slip", "Flicker"]},
                    {"spellLevel": 5, "list": ["Summon Dragon", "God Caller's Defense", "Stagnate Time", "Banishment", "Toxic Cloud"]},
                    {"spellLevel": 6, "list": ["Chain Lightning", "Cast into Time", "Mislead", "Teleport"]}
                ],
                "blendedSpells": []
            },
            {
                "name": "Wildborn Magic",
                "magicTradition": "primal",
                "spellcastingType": "prepared",
                "ability": "cha",
                "proficiency": 2,
                "focusPoints": 0,
                "innate": true,
                "perDay": [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                "spells": [{"spellLevel": 0, "list": ["Gouging Claw"]}],
                "prepared": [],
                "blendedSpells": []
            },
            {
                "name": "Caster Arcane Sense",
                "magicTradition": "arcane",
                "spellcastingType": "prepared",
                "ability": "cha",
                "proficiency": 4,
                "focusPoints": 0,
                "innate": true,
                "perDay": [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                "spells": [{"spellLevel": 0, "list": ["Detect Magic"]}],
                "prepared": [],
                "blendedSpells": []
            },
            {
                "name": "Otherworldly Acumen",
                "magicTradition": "arcane",
                "spellcastingType": "prepared",
                "ability": "cha",
                "proficiency": 4,
                "focusPoints": 0,
                "innate": true,
                "perDay": [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                "spells": [
                    {"spellLevel": 0, "list": []},
                    {"spellLevel": 1, "list": []},
                    {"spellLevel": 2, "list": ["Buzzing Servants"]}
                ],
                "prepared": [],
                "blendedSpells": []
            },
            {
                "name": "Well Awakening",
                "magicTradition": "arcane",
                "spellcastingType": "prepared",
                "ability": "cha",
                "proficiency": 4,
                "focusPoints": 0,
                "innate": true,
                "perDay": [2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                "spells": [
                    {"spellLevel": 0, "list": ["Mage Hand", "Telekinetic Projectile"]},
                    {"spellLevel": 1, "list": ["Alarm"]},
                    {"spellLevel": 2, "list": ["Brine Dragon Bile"]}
                ],
                "prepared": [],
                "blendedSpells": []
            }
        ],
        "focusPoints": 2,
        "focus": {
            "arcane": {
                "int": {
                    "abilityBonus": 4,
                    "proficiency": 4,
                    "itemBonus": 0,
                    "focusCantrips": [],
                    "focusSpells": ["Fortify Summoning", "Spiral of Horrors"]
                }
            }
        },
        "formula": [],
        "acTotal": {
            "acProfBonus": 14,
            "acAbilityBonus": 1,
            "acItemBonus": 0,
            "acTotal": 25,
            "shieldBonus": null
        },
        "pets": [],
        "familiars": [
            {
                "type": "Familiar",
                "name": "Familiar",
                "equipment": [],
                "specific": null,
                "abilities": []
            }
        ]
    }
};

// Utility functions
function getAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
}

function formatModifier(modifier) {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

function calculateHP(level, conMod, ancestryHP, classHP) {
    return ancestryHP + (classHP * level) + (conMod * level);
}

function calculateSave(level, prof, abilityMod) {
    return level + prof + abilityMod;
}

function calculateSkill(level, prof, abilityMod) {
    return level + prof + abilityMod;
}

// Initialize the character sheet
function initializeCharacterSheet() {
    const build = characterData.build;
    
    // Update basic info
    document.getElementById('characterName').textContent = build.name;
    document.getElementById('characterLevel').textContent = `Level ${build.level}`;
    document.getElementById('characterClass').textContent = build.class;
    document.getElementById('characterAncestry').textContent = `${build.ancestry} (${build.heritage})`;
    
    // Calculate and update ability scores
    const abilities = build.abilities;
    const abilityNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    abilityNames.forEach(ability => {
        const score = abilities[ability];
        const modifier = getAbilityModifier(score);
        
        document.getElementById(`${ability}Value`).textContent = score;
        document.getElementById(`${ability}Mod`).textContent = formatModifier(modifier);
    });
    
    // Calculate and update core stats
    const conMod = getAbilityModifier(abilities.con);
    const dexMod = getAbilityModifier(abilities.dex);
    const level = build.level;
    
    // HP calculation
    const hp = calculateHP(level, conMod, build.attributes.ancestryhp, build.attributes.classhp);
    document.getElementById('hpValue').textContent = hp;
    
    // AC calculation
    const ac = build.acTotal.acTotal;
    document.getElementById('acValue').textContent = ac;
    
    // Speed
    document.getElementById('speedValue').textContent = build.attributes.speed;
    
    // Calculate and update saves
    const prof = build.proficiencies;
    const fortSave = calculateSave(level, prof.fortitude, conMod);
    const refSave = calculateSave(level, prof.reflex, dexMod);
    const willSave = calculateSave(level, prof.will, getAbilityModifier(abilities.wis));
    
    document.getElementById('fortValue').textContent = formatModifier(fortSave);
    document.getElementById('refValue').textContent = formatModifier(refSave);
    document.getElementById('willValue').textContent = formatModifier(willSave);
    
    // Update skills
    updateSkills();
    
    // Update spells
    updateSpells();
    
    // Update equipment and money
    updateEquipment();
    
    // Update feats
    updateFeats();
}

// Update skills section
function updateSkills() {
    const build = characterData.build;
    const skillsList = document.getElementById('skillsList');
    const skills = [
        { name: 'Acrobatics', prof: build.proficiencies.acrobatics, ability: 'dex' },
        { name: 'Arcana', prof: build.proficiencies.arcana, ability: 'int' },
        { name: 'Athletics', prof: build.proficiencies.athletics, ability: 'str' },
        { name: 'Crafting', prof: build.proficiencies.crafting, ability: 'int' },
        { name: 'Deception', prof: build.proficiencies.deception, ability: 'cha' },
        { name: 'Diplomacy', prof: build.proficiencies.diplomacy, ability: 'cha' },
        { name: 'Intimidation', prof: build.proficiencies.intimidation, ability: 'cha' },
        { name: 'Medicine', prof: build.proficiencies.medicine, ability: 'wis' },
        { name: 'Nature', prof: build.proficiencies.nature, ability: 'wis' },
        { name: 'Occultism', prof: build.proficiencies.occultism, ability: 'int' },
        { name: 'Performance', prof: build.proficiencies.performance, ability: 'cha' },
        { name: 'Religion', prof: build.proficiencies.religion, ability: 'wis' },
        { name: 'Society', prof: build.proficiencies.society, ability: 'int' },
        { name: 'Stealth', prof: build.proficiencies.stealth, ability: 'dex' },
        { name: 'Survival', prof: build.proficiencies.survival, ability: 'wis' },
        { name: 'Thievery', prof: build.proficiencies.thievery, ability: 'dex' }
    ];
    
    skillsList.innerHTML = '';
    
    skills.forEach(skill => {
        if (skill.prof > 0) {
            const abilityMod = getAbilityModifier(build.abilities[skill.ability]);
            const total = calculateSkill(build.level, skill.prof, abilityMod);
            
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            skillItem.innerHTML = `
                <span class="skill-name">${skill.name}</span>
                <span class="skill-value">${formatModifier(total)}</span>
            `;
            skillsList.appendChild(skillItem);
        }
    });
}

// Update spells section
function updateSpells() {
    const build = characterData.build;
    const spellSlots = document.getElementById('spellSlots');
    const spellsByLevel = document.getElementById('spellsByLevel');
    
    // Update spell slots
    spellSlots.innerHTML = '';
    const mainCaster = build.spellCasters[0]; // Wizard
    
    for (let level = 0; level < mainCaster.perDay.length; level++) {
        const slots = mainCaster.perDay[level];
        if (slots > 0) {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'spell-slot';
            slotDiv.innerHTML = `
                <div class="spell-level">Level ${level}</div>
                <div class="spell-count">${slots}</div>
            `;
            spellSlots.appendChild(slotDiv);
        }
    }
    
    // Update spells by level
    spellsByLevel.innerHTML = '';
    
    mainCaster.prepared.forEach(levelData => {
        if (levelData.list.length > 0) {
            const levelSection = document.createElement('div');
            levelSection.className = 'spell-level-section';
            
            const title = document.createElement('div');
            title.className = 'spell-level-title';
            title.textContent = `Level ${levelData.spellLevel} Spells`;
            levelSection.appendChild(title);
            
            const spellList = document.createElement('div');
            spellList.className = 'spell-list';
            
            levelData.list.forEach(spell => {
                const spellItem = document.createElement('div');
                spellItem.className = 'spell-item';
                spellItem.textContent = spell;
                spellList.appendChild(spellItem);
            });
            
            levelSection.appendChild(spellList);
            spellsByLevel.appendChild(levelSection);
        }
    });
}

// Update equipment section
function updateEquipment() {
    const build = characterData.build;
    const moneyDisplay = document.getElementById('moneyDisplay');
    const equipmentList = document.getElementById('equipmentList');
    
    // Update money
    const money = build.money;
    const totalGP = money.pp * 10 + money.gp + money.sp / 10 + money.cp / 100;
    moneyDisplay.innerHTML = `
        <div>💰 ${totalGP.toFixed(2)} GP</div>
        <div style="font-size: 0.8rem; margin-top: 5px;">
            ${money.pp} PP • ${money.gp} GP • ${money.sp} SP • ${money.cp} CP
        </div>
    `;
    
    // Update equipment (empty for now)
    equipmentList.innerHTML = '<div class="equipment-item">No equipment recorded</div>';
}

// Update feats section
function updateFeats() {
    const build = characterData.build;
    const featsList = document.getElementById('featsList');
    
    featsList.innerHTML = '';
    
    build.feats.forEach(feat => {
        const featItem = document.createElement('div');
        featItem.className = 'feat-item';
        
        const featName = document.createElement('div');
        featName.className = 'feat-name';
        featName.textContent = feat[0];
        
        const featType = document.createElement('div');
        featType.className = 'feat-type';
        featType.textContent = `${feat[2]} (Level ${feat[3]})`;
        
        const featDescription = document.createElement('div');
        featDescription.className = 'feat-description';
        featDescription.textContent = getFeatDescription(feat[0]);
        
        featItem.appendChild(featName);
        featItem.appendChild(featType);
        featItem.appendChild(featDescription);
        featsList.appendChild(featItem);
    });
}

// Get feat description (simplified)
function getFeatDescription(featName) {
    const descriptions = {
        'Familiar': 'You gain a familiar, a mystical pet that enhances your magical abilities.',
        'Aiuvarin': 'Your connection to the spirit world grants you unique magical abilities.',
        'Wildborn Magic': 'You can cast primal magic through your natural connection to nature.',
        'Tattoo Artist': 'You can create magical tattoos that provide various benefits.',
        'Chronoskimmer Dedication': 'You gain abilities related to time manipulation and temporal magic.',
        'Canny Acumen': 'You gain expertise in Will saves, making you more resistant to mental effects.',
        'Read Psychometric Resonance': 'You can read the psychic impressions left on objects.',
        'Turn Back the Clock': 'You can reverse time for a brief moment to undo recent events.',
        'Feathered Cloak': 'You can transform your wings into a cloak for better mobility.',
        'Student of the Canon': 'You gain deeper knowledge of religious texts and divine magic.',
        'Guide the Timeline': 'You can help allies navigate through time-based effects.',
        'Ancestral Paragon': 'You gain additional ancestry feats as you advance.',
        'Fledgling Flight': 'You gain the ability to fly for short distances.',
        'Arcane Sense': 'You can detect magical auras and identify magical items.',
        'Advanced School Spell': 'You gain access to more powerful school-specific spells.',
        'Otherworldly Acumen': 'Your connection to other planes grants you unique magical abilities.',
        'Quick Identification': 'You can identify magical items and effects more quickly.',
        'Scroll Adept': 'You are particularly skilled at using scrolls and other consumable magic items.',
        'Axuma\'s Awakening': 'You gain powerful awakening abilities that enhance your magical potential.'
    };
    
    return descriptions[featName] || 'A powerful ability that enhances your character.';
}

// Tab switching functionality
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Dice rolling functions
function rollD20() {
    const result = Math.floor(Math.random() * 20) + 1;
    displayDiceResult(`d20: ${result}`);
}

function rollDice(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    displayDiceResult(`d${sides}: ${result}`);
}

function displayDiceResult(result) {
    const diceResult = document.getElementById('diceResult');
    diceResult.textContent = result;
    diceResult.style.animation = 'none';
    setTimeout(() => {
        diceResult.style.animation = 'fadeIn 0.5s ease-in-out';
    }, 10);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize character sheet
    initializeCharacterSheet();
    
    // Add tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Add ability score click handlers for rolling
    document.querySelectorAll('.ability-card').forEach(card => {
        card.addEventListener('click', function() {
            const ability = this.getAttribute('data-ability');
            const abilityMod = getAbilityModifier(characterData.build.abilities[ability]);
            rollD20();
            setTimeout(() => {
                const diceResult = document.getElementById('diceResult');
                const currentResult = diceResult.textContent;
                const roll = parseInt(currentResult.split(': ')[1]);
                const total = roll + abilityMod;
                diceResult.textContent = `${currentResult} + ${formatModifier(abilityMod)} = ${total}`;
            }, 100);
        });
    });
});

// Add CSS animation for dice results
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
    }
`;
document.head.appendChild(style);
