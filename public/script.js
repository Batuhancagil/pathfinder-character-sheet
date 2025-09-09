// Main application script
let socket;
let currentSession = null;
let currentPlayer = null;
let characterCardManager;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pathfinder Character Sheet App Initialized');
    
    // Initialize character card manager
    characterCardManager = new CharacterCardManager();
    
    // Initialize socket connection
    initializeSocket();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show character selection by default
    showCharacterSelection();
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
    // Session management
    const createSessionBtn = document.getElementById('createSessionBtn');
    if (createSessionBtn) {
        createSessionBtn.addEventListener('click', createSession);
    }
    
    const joinSessionBtn = document.getElementById('joinSessionBtn');
    if (joinSessionBtn) {
        joinSessionBtn.addEventListener('click', joinSession);
    }
    
    const leaveSessionBtn = document.getElementById('leaveSessionBtn');
    if (leaveSessionBtn) {
        leaveSessionBtn.addEventListener('click', leaveSession);
    }
    
    // Chat
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendChatMessage);
    }
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // Dice rolling
    const rollDiceBtn = document.getElementById('rollDiceBtn');
    if (rollDiceBtn) {
        rollDiceBtn.addEventListener('click', rollCustomDice);
    }
    
    const diceExpression = document.getElementById('diceExpression');
    if (diceExpression) {
        diceExpression.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                rollCustomDice();
            }
        });
    }
    
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
}

function showCharacterSelection() {
    document.getElementById('characterSelectionPanel').style.display = 'block';
    document.getElementById('characterDisplay').style.display = 'none';
    document.getElementById('sessionPanel').style.display = 'none';
    document.getElementById('characterSheet').style.display = 'none';
}

function showCharacterDisplay() {
    document.getElementById('characterSelectionPanel').style.display = 'none';
    document.getElementById('characterDisplay').style.display = 'block';
    document.getElementById('sessionPanel').style.display = 'none';
    document.getElementById('characterSheet').style.display = 'none';
}

function showSessionPanel() {
    document.getElementById('characterSelectionPanel').style.display = 'none';
    document.getElementById('characterDisplay').style.display = 'none';
    document.getElementById('sessionPanel').style.display = 'block';
    document.getElementById('characterSheet').style.display = 'none';
}

function showCharacterSheet() {
    document.getElementById('characterSelectionPanel').style.display = 'none';
    document.getElementById('characterDisplay').style.display = 'none';
    document.getElementById('sessionPanel').style.display = 'none';
    document.getElementById('characterSheet').style.display = 'block';
}

// Session Management Functions
async function createSession() {
    const sessionName = document.getElementById('sessionNameInput')?.value || 'New Session';
    const gmName = prompt('Enter your name as GM:') || 'GM';
    
    try {
        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: sessionName,
                gmName: gmName
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentSession = { id: data.sessionId, name: sessionName };
            currentPlayer = { id: data.playerId, name: gmName, isGM: true };
            
            // Join the session via socket
            socket.emit('joinSession', data.sessionId);
            
            showCharacterSheet();
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
    const sessionId = document.getElementById('sessionIdInput')?.value;
    const playerName = document.getElementById('playerNameInput')?.value;
    
    if (!sessionId || !playerName) {
        alert('Please enter both Session ID and Player Name');
        return;
    }
    
    try {
        const response = await fetch(`/api/sessions/${sessionId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playerName: playerName
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentSession = { id: sessionId };
            currentPlayer = { id: data.playerId, name: playerName, isGM: false };
            
            // Join the session via socket
            socket.emit('joinSession', sessionId);
            
            showCharacterSheet();
            updateSessionUI();
        } else {
            alert('Error joining session: ' + data.error);
        }
    } catch (error) {
        console.error('Error joining session:', error);
        alert('Failed to join session');
    }
}

function leaveSession() {
    currentSession = null;
    currentPlayer = null;
    showCharacterSelection();
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

// Tab Navigation
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to selected tab button
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
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
