const {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  ownersOnly: false,
  data: new SlashCommandBuilder()
    .setName('come')
    .setDescription('Summon a user to the current channel via DM')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to summon')
        .setRequired(true)
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });

      const user = interaction.options.getUser('user');

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.editReply({
          content: '❌ You do not have permission to use this command.',
        });
      }

      await user.send({
        content: `📬 You have been summoned by ${interaction.user.tag} in ${interaction.channel.toString()}`
      });

      return interaction.editReply({
        content: `✅ Successfully sent a summon to **${user.tag}**.`
      });

    } catch (error) {
      console.error('Error sending DM:', error);
      return interaction.editReply({
        content: '❌ Unable to send the summon. The user may have DMs disabled.'
      });
    }
  }
};
