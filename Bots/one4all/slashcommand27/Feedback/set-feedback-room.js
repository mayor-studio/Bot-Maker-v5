const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const feedbackDB = new Database("/Json-db/Bots/feedbackDB.json");

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName('set-feedback-room')
    .setDescription('Set the feedback channel')
    .addChannelOption(option =>
      option.setName('room')
        .setDescription('The channel')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const room = interaction.options.getChannel('room');
      await feedbackDB.set(`feedback_room_${interaction.guild.id}`, room.id);
      return interaction.reply({ content: '**Feedback channel set successfully!**', ephemeral: true });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'An error occurred while setting the feedback channel.', ephemeral: true });
    }
  }
};
