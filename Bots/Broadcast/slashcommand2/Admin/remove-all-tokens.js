const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/BroadcastDB");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-all-tokens')
        .setDescription('Remove all broadcast bot tokens'),

    async execute(interaction) {
        try {
            await db.delete(`tokens_${interaction.guild.id}`);
            return interaction.reply({ content: '**All broadcast bot tokens have been successfully removed from the server!**', ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '**An error occurred while removing tokens.**', ephemeral: true });
        }
    }
};
