const { SlashCommandBuilder } = require('@discordjs/builders');
const { Database } = require('st.db');
const autolineDB = new Database("/Json-db/Bots/autolineDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('line-mode')
        .setDescription('Choose between sending an image or a link')
        .addStringOption(option => 
            option.setName('mode')
            .setDescription('Select either image or link')
            .setRequired(true)
            .addChoices(
                { name: 'Image', value: 'image' },
                { name: 'Link', value: 'link' },
            )),
    async execute(interaction) {
        const mode = interaction.options.getString('mode');
        await autolineDB.set(`line_mode_${interaction.guild.id}`, mode);
        await interaction.reply({ content: `Send mode has been set to **${mode}**`, ephemeral: true });
    },
};
