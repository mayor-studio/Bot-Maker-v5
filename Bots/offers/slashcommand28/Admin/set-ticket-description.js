const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const offersDB = new Database("/Json-db/Bots/offersDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-ticket-description')
        .setDescription('Set the embed description for created ticket channels')
        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('The description to show in the ticket embed')
                .setRequired(true)),
                
    async execute(interaction) {
        try {
            const description = interaction.options.getString('description');
            const guildId = interaction.guild.id;

            await offersDB.set(`ticket_embed_description_${guildId}`, description);

            return interaction.reply({ content: `✅ The ticket embed description has been set successfully.` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `❌ An error occurred while saving the description.` });
        }
    }
};
