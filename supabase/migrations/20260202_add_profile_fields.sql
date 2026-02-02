-- Add new profile fields for Brand vs Creator split
-- Run this in Supabase SQL Editor

-- Add user_type to distinguish between creators and brands
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('creator', 'brand'));

-- Add onboarding tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Creator-specific fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS niches TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tiktok_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS base_rate DECIMAL(10,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS engagement_rate DECIMAL(5,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Brand-specific fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Create conversations table for messaging
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(participant1_id, participant2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    attachment_url TEXT,
    attachment_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_niches ON profiles USING GIN(niches);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Add fields to bounties table for campaign features
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS niches TEXT[] DEFAULT '{}';
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS max_submissions INTEGER DEFAULT 10;
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 0;
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}';
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS deliverables TEXT[] DEFAULT '{}';

-- Enable RLS on new tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (
        auth.uid() = participant1_id OR auth.uid() = participant2_id
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid() = participant1_id OR auth.uid() = participant2_id
    );

CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE USING (
        auth.uid() = participant1_id OR auth.uid() = participant2_id
    );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
        )
    );

-- Function to update conversation last_message on new message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message = NEW.content,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating conversation on new message
DROP TRIGGER IF EXISTS on_message_insert ON messages;
CREATE TRIGGER on_message_insert
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Function to get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
    conv_id UUID;
BEGIN
    -- Check if conversation exists (in either direction)
    SELECT id INTO conv_id FROM conversations
    WHERE (participant1_id = user1_id AND participant2_id = user2_id)
       OR (participant1_id = user2_id AND participant2_id = user1_id)
    LIMIT 1;
    
    -- If not, create it
    IF conv_id IS NULL THEN
        INSERT INTO conversations (participant1_id, participant2_id)
        VALUES (user1_id, user2_id)
        RETURNING id INTO conv_id;
    END IF;
    
    RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
