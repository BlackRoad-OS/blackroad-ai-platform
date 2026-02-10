/**
 * BlackRoad AI Platform - Agent Memory System
 * Persistent storage for conversations, context, and agent state
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class AgentMemory {
    constructor(dbPath = null) {
        this.dbPath = dbPath || path.join(process.env.HOME || '/Users/alexa', '.blackroad', 'agent-memory.db');
        this.db = null;
        this.init();
    }

    init() {
        const dbDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        this.db = new sqlite3.Database(this.dbPath);

        // Create tables
        this.db.serialize(() => {
            // Conversations table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS conversations (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    model TEXT NOT NULL,
                    created_at INTEGER DEFAULT (strftime('%s', 'now')),
                    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
                    metadata TEXT
                )
            `);

            // Messages table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    conversation_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    model TEXT,
                    tokens INTEGER,
                    cost REAL,
                    created_at INTEGER DEFAULT (strftime('%s', 'now')),
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
                )
            `);

            // Agent state table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS agent_state (
                    agent_id TEXT PRIMARY KEY,
                    state TEXT NOT NULL,
                    context TEXT,
                    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
                )
            `);

            // Memory embeddings table (for future vector search)
            this.db.run(`
                CREATE TABLE IF NOT EXISTS memory_embeddings (
                    id TEXT PRIMARY KEY,
                    message_id TEXT NOT NULL,
                    embedding TEXT,
                    created_at INTEGER DEFAULT (strftime('%s', 'now')),
                    FOREIGN KEY (message_id) REFERENCES messages(id)
                )
            `);

            // Indexes
            this.db.run(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`);
            this.db.run(`CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC)`);
            this.db.run(`CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC)`);
        });
    }

    // Create new conversation
    createConversation(model, title = null, metadata = {}) {
        return new Promise((resolve, reject) => {
            const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const metadataStr = JSON.stringify(metadata);

            this.db.run(
                `INSERT INTO conversations (id, title, model, metadata) VALUES (?, ?, ?, ?)`,
                [id, title, model, metadataStr],
                (err) => {
                    if (err) reject(err);
                    else resolve({ id, title, model, metadata });
                }
            );
        });
    }

    // Add message to conversation
    addMessage(conversationId, role, content, model = null, tokens = null, cost = null) {
        return new Promise((resolve, reject) => {
            const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            this.db.run(
                `INSERT INTO messages (id, conversation_id, role, content, model, tokens, cost) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, conversationId, role, content, model, tokens, cost],
                (err) => {
                    if (err) reject(err);
                    else {
                        // Update conversation timestamp
                        this.db.run(
                            `UPDATE conversations SET updated_at = strftime('%s', 'now') WHERE id = ?`,
                            [conversationId]
                        );
                        resolve({ id, conversationId, role, content, model, tokens, cost });
                    }
                }
            );
        });
    }

    // Get conversation with messages
    getConversation(conversationId, limit = 50) {
        return new Promise((resolve, reject) => {
            // Get conversation details
            this.db.get(
                `SELECT * FROM conversations WHERE id = ?`,
                [conversationId],
                (err, conversation) => {
                    if (err) return reject(err);
                    if (!conversation) return resolve(null);

                    // Get messages
                    this.db.all(
                        `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?`,
                        [conversationId, limit],
                        (err, messages) => {
                            if (err) return reject(err);

                            resolve({
                                ...conversation,
                                metadata: JSON.parse(conversation.metadata || '{}'),
                                messages: messages || []
                            });
                        }
                    );
                }
            );
        });
    }

    // Get recent conversations
    getRecentConversations(limit = 10) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT c.*, COUNT(m.id) as message_count
                 FROM conversations c
                 LEFT JOIN messages m ON c.id = m.conversation_id
                 GROUP BY c.id
                 ORDER BY c.updated_at DESC
                 LIMIT ?`,
                [limit],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows.map(row => ({
                        ...row,
                        metadata: JSON.parse(row.metadata || '{}')
                    })));
                }
            );
        });
    }

    // Get context for conversation (last N messages)
    getContext(conversationId, messageCount = 10) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT role, content FROM messages 
                 WHERE conversation_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT ?`,
                [conversationId, messageCount],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows.reverse()); // Return in chronological order
                }
            );
        });
    }

    // Search messages
    searchMessages(query, limit = 20) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT m.*, c.title, c.model as conversation_model
                 FROM messages m
                 JOIN conversations c ON m.conversation_id = c.id
                 WHERE m.content LIKE ?
                 ORDER BY m.created_at DESC
                 LIMIT ?`,
                [`%${query}%`, limit],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                }
            );
        });
    }

    // Save agent state
    saveAgentState(agentId, state, context = {}) {
        return new Promise((resolve, reject) => {
            const stateStr = JSON.stringify(state);
            const contextStr = JSON.stringify(context);

            this.db.run(
                `INSERT OR REPLACE INTO agent_state (agent_id, state, context, updated_at) 
                 VALUES (?, ?, ?, strftime('%s', 'now'))`,
                [agentId, stateStr, contextStr],
                (err) => {
                    if (err) reject(err);
                    else resolve({ agentId, state, context });
                }
            );
        });
    }

    // Get agent state
    getAgentState(agentId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT * FROM agent_state WHERE agent_id = ?`,
                [agentId],
                (err, row) => {
                    if (err) return reject(err);
                    if (!row) return resolve(null);

                    resolve({
                        agentId: row.agent_id,
                        state: JSON.parse(row.state),
                        context: JSON.parse(row.context || '{}'),
                        updatedAt: row.updated_at
                    });
                }
            );
        });
    }

    // Get stats
    getStats() {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT 
                    (SELECT COUNT(*) FROM conversations) as total_conversations,
                    (SELECT COUNT(*) FROM messages) as total_messages,
                    (SELECT SUM(tokens) FROM messages WHERE tokens IS NOT NULL) as total_tokens,
                    (SELECT SUM(cost) FROM messages WHERE cost IS NOT NULL) as total_cost,
                    (SELECT COUNT(DISTINCT model) FROM conversations) as unique_models
                `,
                [],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                }
            );
        });
    }

    // Delete old conversations
    cleanup(daysOld = 30) {
        return new Promise((resolve, reject) => {
            const cutoff = Math.floor(Date.now() / 1000) - (daysOld * 24 * 60 * 60);

            this.db.serialize(() => {
                // Delete old messages first
                this.db.run(
                    `DELETE FROM messages WHERE conversation_id IN 
                     (SELECT id FROM conversations WHERE updated_at < ?)`,
                    [cutoff]
                );

                // Then delete old conversations
                this.db.run(
                    `DELETE FROM conversations WHERE updated_at < ?`,
                    [cutoff],
                    function(err) {
                        if (err) reject(err);
                        else resolve({ deleted: this.changes });
                    }
                );
            });
        });
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = AgentMemory;
