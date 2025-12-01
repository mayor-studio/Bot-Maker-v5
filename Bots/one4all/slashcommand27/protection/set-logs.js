const {
  SlashCommandBuilder,
  PermissionsBitField,
} = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/protectDB.json");

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName("set-protect-logs")
    .setDescription("Set the protection logs channel")
    .addChannelOption(option =>
      option
        .setName("room")
        .setDescription("The channel where protection logs will be sent")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    try {
      const room = interaction.options.getChannel("room");

      // Check if the selected channel is a text-based channel
      if (!room.isTextBased()) {
        return interaction.editReply({
          content: `❌ Please select a text-based channel.`,
        });
      }

      await db.set(`protectLog_room_${interaction.guild.id}`, room.id);

      return interaction.editReply({
        content: `✅ Successfully set ${room} as the protection logs channel.`,
      });
    } catch (error) {
      console.error(error);
      return interaction.editReply({
        content: `❌ An error occurred while setting the protection logs channel.`,
      });
    }
  },
};
