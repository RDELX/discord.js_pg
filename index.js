const {Client} = require('discord.js-selfbot-v13');
const {Pool} = require('pg'); // Import the pg library
require('dotenv').config()
const client = new Client();
const token = 'YOUR TOKEN HERE'
const serverIds = ['']; // Replace with the IDs of the servers you want to log messages from

// Set up a connection to your PostgreSQL database
const pool = new Pool({
    user: 'YourDbUsername', // Database user name
    host: 'YourDbAddress, Use localhost for local db', // Database host
    database: 'DatabaseName', // Database name
    password: 'DatabasePassword', // Database password
    port: 'Your database port, default is 5432',
});

// When the client is ready, log a message to the console
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Listen for messages and log them to the database
client.on('messageCreate', async (message) => {
    if (serverIds.includes(message.guild?.id)) {
        console.log(`${message.author.tag} in #${message.channel.name} sent: ${message.content}`);
        // Save the log to the PostgreSQL database
        const query = {
            text: 'INSERT INTO message_logs(server_id, server_name, channel_name, username, user_id, channel_id, message_content) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [message.guild.id, message.guild.name, message.channel.name, message.author.username, message.author.id, message.channel.id, message.content],
        };
        try {
            const res = await pool.query(query);
            console.log(`Log saved to database with ID ${res.rows[0].id}`);
        } catch (err) {
            console.error('Log failed to save to database', err);
        }
    }
});
    ;

// Log in to the Discord client
    client.login(process.env.DISCORD_TOKEN);