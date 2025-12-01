const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/BroadcastDB");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-token')
        .setDescription('Remove a broadcast bot token')
        .addStringOption(option =>
            option
                .setName('token')
                .setDescription('The token to remove')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const token = interaction.options.getString('token');
            const tokens = db.get(`tokens_${interaction.guild.id}`) || [];

            if (!tokens.includes(token)) {
                return interaction.reply({ content: '**This token does not exist on this server.**', ephemeral: true });
            }

            await db.set(`tokens_${interaction.guild.id}`, tokens.filter(t => t !== token));
            return interaction.reply({ content: '**Token removed successfully!**', ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '**An error occurred while removing the token.**', ephemeral: true });
        }
    }
};
