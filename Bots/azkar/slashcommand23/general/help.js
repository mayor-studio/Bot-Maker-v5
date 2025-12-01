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
    .setDescription('قائمة اوامر البوت'),
    
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction) {
    try {
      await interaction.deferReply();

      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTitle('قائمة اوامر البوت')
        .setDescription(`**يرجى اختيار القسم المراد معرفة اوامره**`)
        .setTimestamp()
        .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor('DarkButNotBlack');

      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("help_menu")
          .setPlaceholder("اختر فئة الأوامر")
          .addOptions([
            {
              label: "أوامر عامة",
              description: "لعرض الأوامر العامة",
              value: "general",
              emoji: "🌐",
            },
            {
              label: "أوامر الأونر",
              description: "لعرض أوامر الأونر والإعدادات",
              value: "owner",
              emoji: "👑",
            },
          ])
      );

      await interaction.editReply({ embeds: [embed], components: [menu] });
    } catch (error) {
      console.log("🔴 | Error in help command", error);
    }
  }
};
