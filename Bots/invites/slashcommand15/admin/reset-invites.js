const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require("st.db");
const inviterDB = new Database("/Json-db/Bots/inviterDB.json");

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName('reset-invites')
    .setDescription('Reset a specific user\'s invites')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to reset invites for')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('user');

      const invitePoints = inviterDB.get(`invitePoints_${targetUser.id}`) || 0;
      const leftUsers = inviterDB.get(`leftUsers_${targetUser.id}`) || [];
      const joinedUsers = inviterDB.get(`joinedUsers_${targetUser.id}`) || [];
      const leftUsersData = inviterDB.get(`leftUsersData_${targetUser.id}`) || {};

      const userInviteData = {
        invitePoints,
        leftUsers,
        joinedUsers,
        leftUsersData
      };

      // Delete only if data exists
      if (inviterDB.has(`invitePoints_${targetUser.id}`)) inviterDB.delete(`invitePoints_${targetUser.id}`);
      if (inviterDB.has(`leftUsers_${targetUser.id}`)) inviterDB.delete(`leftUsers_${targetUser.id}`);
      if (inviterDB.has(`joinedUsers_${targetUser.id}`)) inviterDB.delete(`joinedUsers_${targetUser.id}`);
      if (inviterDB.has(`leftUsersData_${targetUser.id}`)) inviterDB.delete(`leftUsersData_${targetUser.id}`);

      await interaction.reply({
        content: `✅ **All invites for ${targetUser.username} have been successfully reset.**`,
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
