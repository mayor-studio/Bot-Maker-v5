const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const feedbackDB = new Database("/Json-db/Bots/feedbackDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('feedback-room')
        .setDescription('Set the feedback channel')
        .addChannelOption(option =>
            option
                .setName('room')
                .setDescription('The channel to receive feedback')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const room = interaction.options.getChannel('room');
            await feedbackDB.set(`feedback_room_${interaction.guild.id}`, room.id);
            return interaction.reply({ content: `✅ Feedback channel has been set to <#${room.id}>`, ephemeral: true });
        } catch {
            return;
        }
    }
};
