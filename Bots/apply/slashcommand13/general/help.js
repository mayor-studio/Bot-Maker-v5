const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

module.exports = {
  ownersOnly: false,
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Bot command list'),

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
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setTitle('Bot Command List')
        .setDescription(`**Please choose a category from the menu below to view its commands.**`)
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setColor('DarkButNotBlack');

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("help_menu")
        .setPlaceholder("Choose a command category")
        .addOptions([
          {
            label: "General",
            value: "general",
            description: "General bot commands",
            emoji: "🌐",
          },
          {
            label: "Owner",
            value: "owner",
            description: "Owner-only commands",
            emoji: "👑",
          },
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.editReply({ embeds: [embed], components: [row] });

    } catch (error) {
      console.log("🔴 | Error in help command", error);
    }
  }
}
