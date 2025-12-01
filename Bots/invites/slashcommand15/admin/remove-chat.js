const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require("st.db");
const inviterDB = new Database("/Json-db/Bots/inviterDB.json");

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName('remove-room')
    .setDescription('Remove the invites channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const welcomeChannelId = inviterDB.get(`welcomeChannel_${interaction.guild.id}`);

      if (!welcomeChannelId) {
        return interaction.reply({
          content: '❌ **No invite channel has been set yet.**',
          ephemeral: true
        });
      }

      inviterDB.delete(`welcomeChannel_${interaction.guild.id}`);

      await interaction.reply({
        content: '✅ **The invite channel has been successfully removed.**',
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ **An error occurred while executing the command.**',
        ephemeral: true
      });
    }
  },
};
