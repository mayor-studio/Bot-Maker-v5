const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Database } = require("st.db");
const axios = require("axios");

const systemDB = new Database("/Json-db/Bots/systemDB.json");
const tokens = new Database("/tokens/tokens");

module.exports = {
  ownersOnly: false,
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("View your banner or someone else's")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user whose banner you want to view")
        .setRequired(false)
    ),

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();

    try {
      const user = interaction.options.getUser("user") || interaction.user;
      const member = interaction.guild.members.cache.get(user.id) || interaction.member;

      const tokensData = tokens.get("system") || [];
      const botData = tokensData.find(t => t.clientId === interaction.client.user.id);

      if (!botData) {
        return interaction.editReply({ content: "❌ An error occurred. Please contact the developers." });
      }

      const response = await axios.get(`https://discord.com/api/users/${user.id}`, {
        headers: {
          Authorization: `Bot ${botData.token}`,
        }
      });

      const { banner, accent_color } = response.data;

      if (banner) {
        const extension = banner.startsWith("a_") ? ".gif" : ".png";
        const bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${banner}${extension}?size=2048`;

        const embed = new EmbedBuilder()
          .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true, size: 1024 }) })
          .setTitle("🖼️ Banner Link")
          .setURL(bannerURL)
          .setImage(bannerURL)
          .setColor("Random")
          .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
          });

        const button = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Download")
            .setURL(bannerURL)
        );

        return interaction.editReply({ embeds: [embed], components: [button] });
      } else if (accent_color) {
        const accentImage = `https://serux.pro/rendercolour?hex=${accent_color}&height=200&width=512`;

        const embed = new EmbedBuilder()
          .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true, size: 1024 }) })
          .setTitle("🎨 Accent Color")
          .setURL(accentImage)
          .setImage(accentImage)
          .setColor(accent_color)
          .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
          });

        return interaction.editReply({ embeds: [embed] });
      } else {
        return interaction.editReply({ content: "⚠️ This user does not have a banner or accent color set." });
      }
    } catch (error) {
      console.error("🔴 | Error in banner command:", error);
      return interaction.editReply({ content: "❌ An unexpected error occurred. Please contact the developers." });
    }
  }
};
