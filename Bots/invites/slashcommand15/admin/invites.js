const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const inviterDB = new Database("/Json-db/Bots/inviterDB.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('View the number of invites for a user')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user whose invites you want to view')
        .setRequired(false)),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user') || interaction.user;

      const invitePoints = inviterDB.get(`invitePoints_${user.id}`) || 0;
      const leftUsers = inviterDB.get(`leftUsers_${user.id}`) || 0;
      const joinedUsersData = inviterDB.get(`joinedUsers_${user.id}`) || [];
      const leftUsersData = inviterDB.get(`leftUsersData_${user.id}`) || [];

      const currentInvites = Math.max(0, invitePoints - leftUsers);
      const recentJoins = joinedUsersData.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt)).slice(0, 3);

      const embed = new EmbedBuilder()
        .setAuthor({ name: `Invite Stats for ${user.username}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setColor('#2F3136')
        .setDescription(
          `✅ **Total Invites:** ${invitePoints}\n` +
          `❌ **Left Users:** ${leftUsers}\n` +
          `📊 **Current Invites:** ${currentInvites}\n\n` +
          `📋 **Recently Invited:**`
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      let joinedList = recentJoins.length > 0
        ? recentJoins.map(j => {
            const timestamp = Math.floor(new Date(j.joinedAt).getTime() / 1000);
            return `• <@${j.id}> - joined <t:${timestamp}:R>`;
          }).join('\n')
        : 'No join data available.';

      embed.setDescription(embed.data.description + '\n' + joinedList);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Invite command error:', error);
      await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
    }
  },
};
