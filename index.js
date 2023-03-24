const {Client, Intents} = require('discord.js-selfbot-v13');
const {createLogger, format, transports} = require('winston');
const {combine, timestamp, printf} = format;
const pg = require('pg');
const pgFormat = require('pg-format');
const {createServerTables} = require('./src/server_log_grouping');
const config = require('./config.json');

// Initialize PostgreSQL database connection pool
const pool = new pg.Pool(config.database);

// Create a logger with Winston
const logger = createLogger({
    format: combine(
        timestamp(),
        printf(({level, message, timestamp}) => {
            return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename: 'logs/server.log'})
    ]
});

// Create a new Discord client
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

// When the client is ready, log a message and set the status
client.once('ready', () => {
    console.log('Logged in as', client.user.tag);
    client.user.setActivity(null);
});

// Listen for new messages and log them to the database
client.on('messageCreate', async (message) => {
    // Only log messages from specified servers
    if (message.guild && config.serverIds.includes(message.guild.id)) {
        try {
            // Insert the log into the database
            const serverName = message.guild.name.replace(/\W+/g, '_').toLowerCase();
            await createServerTables(pool, serverName); // check if table exists, if not create it
            const query = pgFormat(
                'INSERT INTO %I (server_name, server_id, channel_name, username, user_id, channel_id, message_content, message_link, message_id, embed_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                serverName.replace(/\W+/g, '_').toLowerCase()
            );
            const values = [
                message.guild.name,
                message.guild.id,
                message.channel.name,
                message.author.username,
                message.author.id,
                message.channel.id,
                message.content,
                message.url,
                message.id,
                message.attachments.size > 0 ? message.attachments.first().url : null,
            ];
            await pool.query(query, values);

            logger.info(
                `[${message.guild.name}][${message.channel.name}] ${message.author.username}: ${message.content}`
            );
        } catch (err) {
            console.error('Error inserting log into database:', err);
        }
    }
});

client.on('messageDelete', async (message) => {
    // Only update messages from specified servers
    if (message.guild && config.serverIds.includes(message.guild.id)) {
        try {
            // Update the log in the database
            const serverName = message.guild.name.replace(/\W+/g, '_').toLowerCase();
            const query = pgFormat(
                'UPDATE %I SET message_deleted = true WHERE message_id = $1',
                serverName.replace(/\W+/g, '_').toLowerCase()
            );
            const values = [message.id];
            await pool.query(query, values);

            logger.info(
                `[${message.guild.name}][${message.channel.name}] ${message.author.username}'s message has been deleted: ${message.content}`
            );
        } catch (err) {
            console.error('Error updating log in database:', err);
        }
    }
});

// Log in to Discord with your client's token
client.login(config.discordToken);
