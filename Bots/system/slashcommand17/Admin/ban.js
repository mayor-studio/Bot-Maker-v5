const {
  ChatInputCommandInteraction,
  Client,
  PermissionsBitField,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  ownersOnly: false,
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The user to ban or unban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false)),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      // Permission check
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({
          content: `❌ You do not have permission to use this command.`,
          ephemeral: true
        });
      }

      const user = interaction.options.getUser('member');
      const member = interaction.options.getMember('member');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const fullReason = `${reason} | Banned by: ${interaction.user.tag}`;

      const banList = await interaction.guild.bans.fetch();
      const isBanned = banList.get(user.id);

      // Ban user if not already banned
      if (!isBanned) {
        if (!member) {
          return interaction.reply({
            content: `⚠️ I couldn’t find that member in this server.`,
            ephemeral: true
          });
        }

        await member.ban({ reason: fullReason }).catch(() => {
          return interaction.reply({
            content: `🚫 I don't have permission to ban this user.`,
            ephemeral: true
          });
        });

        return interaction.reply({
          content: `✅ Successfully banned <@${user.id}>.`,
          ephemeral: false
        });

      } else {
        // Unban if already banned
        await interaction.guild.members.unban(user.id).catch(() => {
          return interaction.reply({
            content: `🚫 I don't have permission to unban this user.`,
            ephemeral: true
          });
        });

        return interaction.reply({
          content: `✅ Successfully unbanned <@${user.id}>.`,
          ephemeral: false
        });
      }

    } catch (error) {
      console.error("🔴 | Error in /ban command:", error);
      return interaction.reply({
        content: `❗ An error occurred. Please contact the developers.`,
        ephemeral: true
      });
    }
  }
};
