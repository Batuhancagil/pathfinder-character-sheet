-- Pathfinder Character Sheet Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    picture_url VARCHAR(500),
    provider VARCHAR(50) DEFAULT 'email',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    gm_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'waiting',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_gm BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, name)
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    character_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Dice rolls table (for history)
CREATE TABLE IF NOT EXISTS dice_rolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    roll_type VARCHAR(50) NOT NULL,
    dice_expression VARCHAR(100) NOT NULL,
    result INTEGER NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add deleted_at column to existing characters table if it doesn't exist
ALTER TABLE characters ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_players_session ON players(session_id);
CREATE INDEX IF NOT EXISTS idx_characters_session ON characters(session_id);
CREATE INDEX IF NOT EXISTS idx_characters_player ON characters(player_id);
CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_deleted ON characters(deleted_at);
CREATE INDEX IF NOT EXISTS idx_dice_rolls_session ON dice_rolls(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sessions_updated_at') THEN
        CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_characters_updated_at') THEN
        CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
