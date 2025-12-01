const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Get detailed information about this server"),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild)
      return interaction.reply({
        content: "❌ This command can only be used inside a server.",
        ephemeral: true,
      });

    try {
      // Fetch fresh owner data
      const owner = await guild.fetchOwner();

      // Verification levels with emojis for clarity
      const verificationLevels = {
        None: "None 🟢",
        Low: "Low 🟡",
        Medium: "Medium 🟠",
        High: "High 🔴",
        VeryHigh: "Very High ⛔",
      };

      // Vanity URL (if exists)
      const vanityURL = guild.vanityURLCode
        ? `[discord.gg/${guild.vanityURLCode}](https://discord.gg/${guild.vanityURLCode})`
        : "None";

      // Channels count by type (including news & stage)
      const channelCounts = {
        text: 0,
        voice: 0,
        category: 0,
        news: 0,
        stage: 0,
      };
      guild.channels.cache.forEach((ch) => {
        switch (ch.type) {
          case 0: // GUILD_TEXT
            channelCounts.text++;
            break;
          case 2: // GUILD_VOICE
            channelCounts.voice++;
            break;
          case 4: // GUILD_CATEGORY
            channelCounts.category++;
            break;
          case 5: // GUILD_NEWS
            channelCounts.news++;
            break;
          case 13: // GUILD_STAGE_VOICE
            channelCounts.stage++;
            break;
        }
      });

      // Roles (top 15, sorted)
      const roles = guild.roles.cache
        .filter((r) => r.id !== guild.id)
        .sort((a, b) => b.position - a.position)
        .map((r) => r.toString())
        .slice(0, 15)
        .join(", ");
      const rolesDisplay = roles.length ? roles : "None";

      // Boost info
      const boosts = guild.premiumSubscriptionCount || 0;
      const boostTier = guild.premiumTier
        ? `Tier ${guild.premiumTier}`
        : "None";

      // Member counts
      const members = guild.members.cache;
      const botsCount = members.filter((m) => m.user.bot).size;
      const humansCount = members.filter((m) => !m.user.bot).size;

      // Creation date formatted & relative
      const createdDate = `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`;
      const createdRelative = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

      // Embed build
      const embed = new EmbedBuilder()
        .setTitle(`🛡️ Server Information: ${guild.name}`)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }) || null)
        .setColor("#5865F2")
        .addFields(
          { name: "🆔 Server ID", value: guild.id, inline: true },
          { name: "👑 Owner", value: owner.user.tag, inline: true },
          { name: "🌐 Vanity URL", value: vanityURL, inline: true },

          { name: "\u200B", value: "\u200B" },

          {
            name: "👥 Members",
            value: `Total: **${guild.memberCount}**\nHumans: **${humansCount}**\nBots: **${botsCount}**`,
            inline: true,
          },
          {
            name: "📅 Created",
            value: `${createdDate}\n${createdRelative}`,
            inline: true,
          },
          {
            name: "🛡 Verification Level",
            value: verificationLevels[guild.verificationLevel] || "Unknown",
            inline: true,
          },

          { name: "\u200B", value: "\u200B" },

          {
            name: "💎 Boosts & Tier",
            value: `${boosts} boosts\n${boostTier}`,
            inline: true,
          },
          {
            name: "🧩 Channels",
            value: `Text: **${channelCounts.text}**\nVoice: **${channelCounts.voice}**\nCategories: **${channelCounts.category}**\nNews: **${channelCounts.news}**\nStage: **${channelCounts.stage}**`,
            inline: true,
          },
          {
            name: "🎭 Roles",
            value: rolesDisplay,
            inline: false,
          }
        )
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      // Add banner image + download buttons if banner exists
      if (guild.banner) {
        const banner4k = guild.bannerURL({ size: 4096, extension: "png" });
        const banner8k = guild.bannerURL({ size: 8192, extension: "png" });
        embed.setImage(banner4k);

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Download 4K")
            .setStyle(ButtonStyle.Link)
            .setURL(banner4k),
          new ButtonBuilder()
            .setLabel("Download 8K")
            .setStyle(ButtonStyle.Link)
            .setURL(banner8k)
        );

        return interaction.reply({ embeds: [embed], components: [buttons] });
      }

      // No banner found
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error executing /server command:", error);
      return interaction.reply({
        content: "❌ An error occurred while fetching the server information.",
        ephemeral: true,
      });
    }
  },
};
