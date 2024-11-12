const { Client, GatewayIntentBits, Collection, ContextMenuCommandBuilder} = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { token, mongoDB} = require('./config.json');
const { default: mongoose } = require('mongoose'); 

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildVoiceStates,

	],
});

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
        if ('data' in command && command.data instanceof ContextMenuCommandBuilder) {
			client.commands.set(command.data.name, command);
          } else if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
          } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
          }
	}
}
const getAllFiles = (dir) => {
    const files = fs.readdirSync(dir);
    let allFiles = [];

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            const nestedFiles = getAllFiles(filePath);
            allFiles = allFiles.concat(nestedFiles);
        } else {
            if (file.endsWith('.js')) {
                allFiles.push(filePath);
            }
        }
    });

    return allFiles;
};

const eventsPath = path.join(__dirname, 'events');
const eventFiles = getAllFiles(eventsPath);

for (const file of eventFiles) {
    const event = require(file);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

(async() => {
	await mongoose.connect(mongoDB);
	console.log("Connected to main database...")

	client.login(token);
    
})();