const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  ownersOnly: false,
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('View the bot\'s command list'),
  
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction) {
    try {
      await interaction.deferReply();

      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTitle('📖 Bot Command Menu')
        .setDescription('Please choose a category to view its commands.')
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setColor('DarkButNotBlack');

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_general')
          .setLabel('General')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🌐'),
        new ButtonBuilder()
          .setCustomId('help_admin')
          .setLabel('Admin')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🛠️'),
        new ButtonBuilder()
          .setCustomId('help_owner')
          .setLabel('Owner')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('👑')
      );

      await interaction.editReply({
        embeds: [embed],
        components: [buttons]
      });

    } catch (error) {
      console.log("🔴 | Error in help command:", error);
      await interaction.editReply({ content: "An error occurred while loading the help menu." });
    }
  }
};
