const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const feedbackDB = new Database("/Json-db/Bots/feedbackDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-feedback-room')
        .setDescription('Remove the configured feedback channel'),

    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({
                    content: '❌ You must have Administrator permissions to use this command.',
                    ephemeral: true
                });
            }

            const key = `feedback_room_${interaction.guild.id}`;
            const existing = feedbackDB.get(key);

            if (!existing) {
                return interaction.reply({
                    content: '⚠️ No feedback channel is currently set.',
                    ephemeral: true
                });
            }

            feedbackDB.delete(key);

            return interaction.reply({
                content: '✅ Feedback channel has been removed successfully.',
                ephemeral: true
            });
        } catch (error) {
            console.error('Error removing feedback room:', error);
            return interaction.reply({
                content: '❌ An error occurred while removing the feedback channel.',
                ephemeral: true
            });
        }
    }
};
