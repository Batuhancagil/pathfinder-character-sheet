// Main application script
let socket;
let currentSession = null;
let currentPlayer = null;
let characterCardManager;
let currentTab = 'characters';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pathfinder Character Sheet App Initialized');
    
    // Initialize character card manager
    characterCardManager = new CharacterCardManager();
    
    // Initialize socket connection
    initializeSocket();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show character management by default
    showTab('characters');
});

function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
    
    socket.on('sessionState', (data) => {
        console.log('Session state received:', data);
        currentSession = data;
        updateSessionUI();
    });
    
    socket.on('playerJoined', (data) => {
        console.log('Player joined:', data);
        updatePlayerList();
    });
    
    socket.on('characterUpdated', (data) => {
        console.log('Character updated:', data);
        // Handle character updates
    });
    
    socket.on('diceRolled', (data) => {
        console.log('Dice rolled:', data);
        displayDiceRoll(data);
    });
    
    socket.on('chatMessage', (data) => {
        console.log('Chat message:', data);
        displayChatMessage(data);
    });
}

function setupEventListeners() {
    // Main navigation tabs
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-tab')) {
            const tab = e.target.dataset.tab;
            showTab(tab);
        }
    });

    // Character management
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'exportCharacterBtn') {
            e.preventDefault();
            exportCurrentCharacter();
        }
    });

    // Session management
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'createSessionBtn') {
            showSessionCreation();
        }
        if (e.target && e.target.id === 'joinSessionBtn') {
            showSessionJoin();
        }
        if (e.target && e.target.id === 'confirmCreateSessionBtn') {
            createSession();
        }
        if (e.target && e.target.id === 'cancelCreateSessionBtn') {
            hideSessionForms();
        }
        if (e.target && e.target.id === 'confirmJoinSessionBtn') {
            joinSession();
        }
        if (e.target && e.target.id === 'cancelJoinSessionBtn') {
            hideSessionForms();
        }
        if (e.target && e.target.id === 'leaveSessionBtn') {
            leaveSession();
        }
    });

    // Chat
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'sendMessageBtn') {
            sendChatMessage();
        }
    });

    document.addEventListener('keypress', (e) => {
        if (e.target && e.target.id === 'chatInput' && e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // Dice rolling
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'rollDiceBtn') {
            rollCustomDice();
        }
    });

    document.addEventListener('keypress', (e) => {
        if (e.target && e.target.id === 'diceExpression' && e.key === 'Enter') {
            rollCustomDice();
        }
    });
}

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to selected nav tab
    const selectedNavTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedNavTab) {
        selectedNavTab.classList.add('active');
    }
    
    currentTab = tabName;
    
    // Update character selects in session forms
    if (tabName === 'sessions') {
        updateCharacterSelects();
    }
}

// Character Management Functions
function exportCurrentCharacter() {
    const currentChar = characterCardManager.getCurrentCharacter();
    if (currentChar) {
        const exportData = characterCardManager.importer.exportCharacter(currentChar.id);
        if (exportData) {
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentChar.name}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } else {
        alert('No character selected to export');
    }
}

// Session Management Functions
function showSessionCreation() {
    document.getElementById('sessionCreation').style.display = 'block';
    document.getElementById('sessionJoin').style.display = 'none';
    updateCharacterSelects();
}

function showSessionJoin() {
    document.getElementById('sessionJoin').style.display = 'block';
    document.getElementById('sessionCreation').style.display = 'none';
    updateCharacterSelects();
}

function hideSessionForms() {
    document.getElementById('sessionCreation').style.display = 'none';
    document.getElementById('sessionJoin').style.display = 'none';
}

function updateCharacterSelects() {
    const characters = characterCardManager.importer.getAllCharacters();
    const createSelect = document.getElementById('characterSelect');
    const joinSelect = document.getElementById('joinCharacterSelect');
    
    // Clear existing options
    if (createSelect) {
        createSelect.innerHTML = '<option value="">Choose a character...</option>';
    }
    if (joinSelect) {
        joinSelect.innerHTML = '<option value="">Choose a character...</option>';
    }
    
    // Add character options
    characters.forEach(char => {
        const option = document.createElement('option');
        option.value = char.id;
        option.textContent = `${char.name} - ${char.class} ${char.level}`;
        
        if (createSelect) {
            createSelect.appendChild(option.cloneNode(true));
        }
        if (joinSelect) {
            joinSelect.appendChild(option.cloneNode(true));
        }
    });
}

async function createSession() {
    const sessionName = document.getElementById('sessionNameInput').value;
    const gmName = document.getElementById('gmNameInput').value;
    const characterId = document.getElementById('characterSelect').value;
    
    if (!sessionName || !gmName || !characterId) {
        alert('Please fill in all fields');
        return;
    }
    
    const character = characterCardManager.importer.getCharacterById(characterId);
    if (!character) {
        alert('Character not found');
        return;
    }
    
    try {
        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: sessionName,
                gmName: gmName,
                characterData: character
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentSession = { id: data.sessionId, name: sessionName };
            currentPlayer = { id: data.playerId, name: gmName, isGM: true, character: character };
            
            // Join the session via socket
            socket.emit('joinSession', data.sessionId);
            
            showActiveSession();
            updateSessionUI();
        } else {
            alert('Error creating session: ' + data.error);
        }
    } catch (error) {
        console.error('Error creating session:', error);
        alert('Failed to create session');
    }
}

async function joinSession() {
    const sessionId = document.getElementById('sessionIdInput').value;
    const playerName = document.getElementById('playerNameInput').value;
    const characterId = document.getElementById('joinCharacterSelect').value;
    
    if (!sessionId || !playerName || !characterId) {
        alert('Please fill in all fields');
        return;
    }
    
    const character = characterCardManager.importer.getCharacterById(characterId);
    if (!character) {
        alert('Character not found');
        return;
    }
    
    try {
        const response = await fetch(`/api/sessions/${sessionId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playerName: playerName,
                characterData: character
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentSession = { id: sessionId };
            currentPlayer = { id: data.playerId, name: playerName, isGM: false, character: character };
            
            // Join the session via socket
            socket.emit('joinSession', sessionId);
            
            showActiveSession();
            updateSessionUI();
        } else {
            alert('Error joining session: ' + data.error);
        }
    } catch (error) {
        console.error('Error joining session:', error);
        alert('Failed to join session');
    }
}

function showActiveSession() {
    document.getElementById('sessionCreation').style.display = 'none';
    document.getElementById('sessionJoin').style.display = 'none';
    document.getElementById('activeSession').style.display = 'block';
    
    // Show character sheet in session
    if (currentPlayer && currentPlayer.character) {
        showSessionCharacterSheet(currentPlayer.character);
    }
}

function showSessionCharacterSheet(character) {
    const sessionCharacterSheet = document.getElementById('sessionCharacterSheet');
    if (sessionCharacterSheet) {
        sessionCharacterSheet.innerHTML = characterCardManager.renderCharacterSheet(character);
        sessionCharacterSheet.style.display = 'block';
    }
}

function leaveSession() {
    currentSession = null;
    currentPlayer = null;
    document.getElementById('activeSession').style.display = 'none';
    hideSessionForms();
}

function updateSessionUI() {
    if (currentSession) {
        const sessionNameEl = document.getElementById('currentSessionName');
        if (sessionNameEl) {
            sessionNameEl.textContent = currentSession.name || 'Session';
        }
    }
}

function updatePlayerList() {
    // This would be implemented to show current players
    console.log('Updating player list...');
}

// Chat Functions
function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (message && currentSession && currentPlayer) {
        socket.emit('chatMessage', {
            sessionId: currentSession.id,
            playerId: currentPlayer.id,
            message: message,
            playerName: currentPlayer.name
        });
        
        chatInput.value = '';
    }
}

function displayChatMessage(data) {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message';
        messageEl.innerHTML = `
            <span class="chat-sender">${data.playerName}:</span>
            <span class="chat-text">${data.message}</span>
            <span class="chat-time">${new Date(data.timestamp).toLocaleTimeString()}</span>
        `;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Dice Rolling Functions
function rollDice(expression) {
    const result = evaluateDiceExpression(expression);
    displayDiceResult(expression, result);
    
    if (currentSession && currentPlayer) {
        socket.emit('diceRoll', {
            sessionId: currentSession.id,
            playerId: currentPlayer.id,
            rollType: 'custom',
            diceExpression: expression,
            result: result.total,
            dice: expression,
            modifier: 0
        });
    }
}

function rollCustomDice() {
    const expression = document.getElementById('diceExpression').value.trim();
    if (expression) {
        rollDice(expression);
    }
}

function evaluateDiceExpression(expression) {
    // Simple dice expression evaluator
    // Supports formats like: 1d20, 2d6+3, 1d20+2d4+5, etc.
    
    const parts = expression.split(/([+\-])/);
    let total = 0;
    let rolls = [];
    let currentModifier = 1;
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        
        if (part === '+' || part === '-') {
            currentModifier = part === '+' ? 1 : -1;
            continue;
        }
        
        if (part.includes('d')) {
            // This is a dice roll
            const [count, sides] = part.split('d').map(Number);
            const diceRolls = [];
            
            for (let j = 0; j < count; j++) {
                const roll = Math.floor(Math.random() * sides) + 1;
                diceRolls.push(roll);
                total += roll * currentModifier;
            }
            
            rolls.push({
                expression: part,
                rolls: diceRolls,
                modifier: currentModifier
            });
        } else if (!isNaN(part)) {
            // This is a modifier
            total += parseInt(part) * currentModifier;
            rolls.push({
                expression: part,
                modifier: currentModifier
            });
        }
    }
    
    return {
        total: total,
        rolls: rolls,
        expression: expression
    };
}

function displayDiceResult(expression, result) {
    const diceResult = document.getElementById('diceResult');
    if (diceResult) {
        diceResult.innerHTML = `
            <div class="dice-result-header">
                <strong>${expression}</strong> = <strong>${result.total}</strong>
            </div>
            <div class="dice-rolls">
                ${result.rolls.map(roll => {
                    if (roll.rolls) {
                        return `<span class="dice-roll">${roll.expression}: [${roll.rolls.join(', ')}]</span>`;
                    } else {
                        return `<span class="dice-modifier">${roll.expression}</span>`;
                    }
                }).join(' ')}
            </div>
        `;
    }
}

function displayDiceRoll(data) {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message dice-roll-message';
        messageEl.innerHTML = `
            <span class="chat-sender">${data.playerName || 'Player'}:</span>
            <span class="chat-text">Rolled ${data.diceExpression || data.dice}: <strong>${data.result}</strong></span>
            <span class="chat-time">${new Date(data.timestamp).toLocaleTimeString()}</span>
        `;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Legacy functions for backward compatibility
function rollD20() {
    rollDice('1d20');
}

function rollDice(sides) {
    if (typeof sides === 'string') {
        rollDice(sides);
    } else {
        rollDice(`1d${sides}`);
    }
}
