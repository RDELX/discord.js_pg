const pgFormat = require('pg-format');

async function createServerTables(pool, serverName) {
    try {
        // Check if the server table exists
        const query = pgFormat(
            'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = %L)',
            serverName.replace(/\W+/g, '_').toLowerCase()
        );
        const { rows } = await pool.query(query);

        if (!rows[0].exists) {
            // Create the server table if it doesn't exist
            const createQuery = pgFormat(
                'CREATE TABLE IF NOT EXISTS %I (id SERIAL PRIMARY KEY, server_name TEXT NOT NULL, server_id TEXT NOT NULL, channel_name TEXT NOT NULL, username TEXT NOT NULL, user_id TEXT NOT NULL, channel_id TEXT NOT NULL, message_content TEXT NOT NULL, message_link TEXT NOT NULL, embed_link TEXT, created_at TIMESTAMP NOT NULL DEFAULT NOW())',
                serverName.replace(/\W+/g, '_').toLowerCase()
            );
            await pool.query(createQuery);

            console.log(`Created table for server "${serverName}"`);
        }
    } catch (err) {
        console.error('Error creating server tables:', err);
    }
}


module.exports = { createServerTables };
