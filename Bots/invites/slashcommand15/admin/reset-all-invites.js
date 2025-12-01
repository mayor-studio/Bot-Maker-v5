const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require("st.db");
const inviterDB = new Database("/Json-db/Bots/inviterDB.json");

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName('reset-all-invites')
    .setDescription('Reset all users\' invites')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const members = await interaction.guild.members.fetch();

      members.forEach(member => {
        const invitePoints = inviterDB.get(`invitePoints_${member.id}`);
        const leftUsers = inviterDB.get(`leftUsers_${member.id}`);
        const joinedUsers = inviterDB.get(`joinedUsers_${member.id}`);
        const leftUsersData = inviterDB.get(`leftUsersData_${member.id}`);

        if (invitePoints) inviterDB.delete(`invitePoints_${member.id}`);
        if (leftUsers) inviterDB.delete(`leftUsers_${member.id}`);
        if (joinedUsers) inviterDB.delete(`joinedUsers_${member.id}`);
        if (leftUsersData) inviterDB.delete(`leftUsersData_${member.id}`);
      });

      await interaction.reply({
        content: '✅ **All invites have been successfully reset in the server.**',
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
