const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
  ownersOnly: false,
  adminsOnly: false,
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays the bot command menu"),

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
        .setTitle("Bot Commands Menu")
        .setDescription("**Please select a category to view its commands.**")
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setColor("DarkButNotBlack");

      const menu = new StringSelectMenuBuilder()
        .setCustomId("help_menu")
        .setPlaceholder("Select a command category")
        .addOptions([
          {
            label: "General",
            value: "general",
            description: "General commands",
            emoji: "🌐",
          },
          {
            label: "Owner",
            value: "owner",
            description: "Owner-only commands",
            emoji: "👑",
          },
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch (error) {
      console.log("🔴 | Error in help command", error);
    }
  },
};
