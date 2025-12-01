const { SlashCommandBuilder } = require('discord.js');
const { Database } = require("st.db");
const shortcutDB = new Database("/Json-db/Others/shortcutDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-alias')
        .setDescription('Set a shortcut for commands')
        .addStringOption(option => 
            option.setName('command')
                .setDescription('The main command')
                .setRequired(true)
                .addChoices(
                    { name: 'prison', value: 'prison_cmd' },
                    { name: 'unprison', value: 'unprison_cmd' }
                ))
        .addStringOption(option =>
            option.setName('alias')
                .setDescription('The new alias')
                .setRequired(true)),

    async execute(interaction) {
        const command = interaction.options.getString('command');
        const alias = interaction.options.getString('alias');

        await shortcutDB.set(`${command}_${interaction.guild.id}`, alias);
        
        await interaction.reply({
            content: `✅ **\`${alias}\` has been set as a shortcut for the command.**`,
            ephemeral: true
        });
    }
};
