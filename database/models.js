const { query } = require('./connection');

// Session Model
class Session {
    static async create(name, gmId, settings = {}) {
        const result = await query(
            'INSERT INTO sessions (name, gm_id, settings) VALUES ($1, $2, $3) RETURNING *',
            [name, gmId, JSON.stringify(settings)]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await query('SELECT * FROM sessions WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findAll() {
        const result = await query(`
            SELECT s.*, 
                   COUNT(p.id) as player_count,
                   s.settings->>'maxPlayers' as max_players
            FROM sessions s 
            LEFT JOIN players p ON s.id = p.session_id 
            GROUP BY s.id 
            ORDER BY s.created_at DESC
        `);
        return result.rows;
    }

    static async updateStatus(id, status) {
        const result = await query(
            'UPDATE sessions SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await query('DELETE FROM sessions WHERE id = $1', [id]);
    }
}

// Player Model
class Player {
    static async create(sessionId, name, isGm = false) {
        const result = await query(
            'INSERT INTO players (session_id, name, is_gm) VALUES ($1, $2, $3) RETURNING *',
            [sessionId, name, isGm]
        );
        return result.rows[0];
    }

    static async findBySession(sessionId) {
        const result = await query(
            'SELECT * FROM players WHERE session_id = $1 ORDER BY joined_at ASC',
            [sessionId]
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await query('SELECT * FROM players WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async updateName(id, name) {
        const result = await query(
            'UPDATE players SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await query('DELETE FROM players WHERE id = $1', [id]);
    }
}

// Character Model
class Character {
    static async create(playerId, sessionId, characterData) {
        const result = await query(
            'INSERT INTO characters (player_id, session_id, character_data) VALUES ($1, $2, $3) RETURNING *',
            [playerId, sessionId, JSON.stringify(characterData)]
        );
        return result.rows[0];
    }

    static async findByPlayer(playerId) {
        const result = await query(
            'SELECT * FROM characters WHERE player_id = $1 ORDER BY created_at DESC',
            [playerId]
        );
        return result.rows;
    }

    static async findBySession(sessionId) {
        const result = await query(`
            SELECT c.*, p.name as player_name 
            FROM characters c 
            JOIN players p ON c.player_id = p.id 
            WHERE c.session_id = $1 
            ORDER BY c.created_at ASC
        `, [sessionId]);
        return result.rows;
    }

    static async update(playerId, characterData) {
        const result = await query(
            'UPDATE characters SET character_data = $1 WHERE player_id = $2 RETURNING *',
            [JSON.stringify(characterData), playerId]
        );
        return result.rows[0];
    }

    static async delete(playerId) {
        await query('DELETE FROM characters WHERE player_id = $1', [playerId]);
    }
}

// Dice Roll Model
class DiceRoll {
    static async create(sessionId, playerId, rollType, diceExpression, rollResult, details = {}) {
        const result = await query(
            'INSERT INTO dice_rolls (session_id, player_id, roll_type, dice_expression, result, details) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [sessionId, playerId, rollType, diceExpression, rollResult, JSON.stringify(details)]
        );
        return result.rows[0];
    }

    static async findBySession(sessionId, limit = 50) {
        const result = await query(`
            SELECT dr.*, p.name as player_name 
            FROM dice_rolls dr 
            JOIN players p ON dr.player_id = p.id 
            WHERE dr.session_id = $1 
            ORDER BY dr.created_at DESC 
            LIMIT $2
        `, [sessionId, limit]);
        return result.rows;
    }
}

// Chat Message Model
class ChatMessage {
    static async create(sessionId, playerId, message) {
        const result = await query(
            'INSERT INTO chat_messages (session_id, player_id, message) VALUES ($1, $2, $3) RETURNING *',
            [sessionId, playerId, message]
        );
        return result.rows[0];
    }

    static async findBySession(sessionId, limit = 100) {
        const result = await query(`
            SELECT cm.*, p.name as player_name 
            FROM chat_messages cm 
            JOIN players p ON cm.player_id = p.id 
            WHERE cm.session_id = $1 
            ORDER BY cm.created_at ASC 
            LIMIT $2
        `, [sessionId, limit]);
        return result.rows;
    }
}

module.exports = {
    Session,
    Player,
    Character,
    DiceRoll,
    ChatMessage
};
