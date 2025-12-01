const fs = require('fs');
const ascii = require('ascii-table');
let table = new ascii(`commands`);
table.setHeading('Command', 'Commands Status💹');
const path = require('path');

module.exports = (client28) => { 
    const commandsDir = path.join(__dirname, '../../Bots/offers/commands28');
    if(!fs.existsSync(commandsDir)) return;
    fs.readdirSync(commandsDir).forEach(async(folder) => {
        const folderPath = path.join(commandsDir, folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        for(const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            let commands = require(filePath);
            if(commands.name) {
                client28.commands.set(commands.name, commands);
            } else {
                continue;
            }
        }
    });
};
