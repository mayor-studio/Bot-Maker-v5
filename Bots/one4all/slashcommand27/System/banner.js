const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  ownersOnly: false,
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("View the banner of a user, bot, or server")
    .addStringOption(option =>
      option
        .setName("type")
        .setDescription("Choose banner type")
        .setRequired(true)
        .addChoices(
          { name: "User", value: "user" },
          { name: "Bot", value: "bot" },
          { name: "Server", value: "server" }
        )
    )
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Mention a user (for type: user only)")
        .setRequired(false)
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();

    const type = interaction.options.getString("type");
    const mentionUser = interaction.options.getUser("user");

    try {
      // SERVER BANNER
      if (type === "server") {
        const guild = interaction.guild;

        if (!guild.banner) {
          return interaction.editReply({ content: "❌ This server has no banner." });
        }

        const bannerURL4k = `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=4096`;
        const bannerURL8k = `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=8192`;

        const embed = new EmbedBuilder()
          .setTitle(`Server Banner for ${guild.name}`)
          .setImage(bannerURL4k)
          .setColor("Random")
          .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          });

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("Download 4K").setStyle(ButtonStyle.Link).setURL(bannerURL4k),
          new ButtonBuilder().setLabel("Download 8K").setStyle(ButtonStyle.Link).setURL(bannerURL8k)
        );

        return interaction.editReply({ embeds: [embed], components: [buttons] });
      }

      // USER OR BOT BANNER
      const user =
        type === "bot"
          ? interaction.client.user
          : mentionUser || interaction.user;

      const fetchedUser = await interaction.client.users.fetch(user.id, {
        force: true,
      });

      const banner = fetchedUser.banner;
      const accent = fetchedUser.accentColor;

      if (banner) {
        const ext = banner.startsWith("a_") ? ".gif" : ".png";
        const base = `https://cdn.discordapp.com/banners/${user.id}/${banner}${ext}`;
        const url4k = `${base}?size=4096`;
        const url8k = `${base}?size=8192`;

        const embed = new EmbedBuilder()
          .setAuthor({
            name: user.username,
            iconURL: user.displayAvatarURL({ dynamic: true }),
          })
          .setTitle("Banner Link")
          .setURL(url4k)
          .setImage(url4k)
          .setColor("Random")
          .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("Download 4K").setStyle(ButtonStyle.Link).setURL(url4k),
          new ButtonBuilder().setLabel("Download 8K").setStyle(ButtonStyle.Link).setURL(url8k)
        );

        return interaction.editReply({ embeds: [embed], components: [row] });
      } else if (accent) {
        const colorImage = `https://serux.pro/rendercolour?hex=${accent}&height=200&width=512`;

        const embed = new EmbedBuilder()
          .setTitle("No banner found, showing accent color")
          .setImage(colorImage)
          .setColor(accent)
          .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          });

        return interaction.editReply({ embeds: [embed] });
      } else {
        return interaction.editReply({
          content: "❌ This user has no banner or accent color.",
        });
      }
    } catch (err) {
      console.error("🔴 Error in /banner:", err);
      return interaction.editReply({
        content: "❌ An error occurred while fetching the banner.",
      });
    }
  },
};
