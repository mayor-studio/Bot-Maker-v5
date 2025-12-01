const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Displays detailed information about this server."),

  async execute(interaction) {
    const { guild } = interaction;
    const owner = await guild.fetchOwner();

    const createdAt = Math.floor(guild.createdTimestamp / 1000);
    const boosts = guild.premiumSubscriptionCount || 0;
    const boostLevel = guild.premiumTier;
    const verificationLevel = {
      0: "None",
      1: "Low",
      2: "Medium",
      3: "High",
      4: "Very High"
    }[guild.verificationLevel];

    const embed = new EmbedBuilder()
      .setTitle(`🌐 Server Information: ${guild.name}`)
      .setColor("Blurple")
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "📛 Name", value: guild.name, inline: true },
        { name: "🆔 Server ID", value: guild.id, inline: true },
        { name: "👑 Owner", value: `${owner.user.tag}`, inline: true },

        { name: "👥 Member Count", value: `${guild.memberCount.toLocaleString()}`, inline: true },
        { name: "📄 Roles", value: `${guild.roles.cache.size.toLocaleString()}`, inline: true },
        { name: "💬 Channels", value: `${guild.channels.cache.size.toLocaleString()}`, inline: true },

        { name: "🚀 Boosts", value: `Level ${boostLevel} (${boosts} Boosts)`, inline: true },
        { name: "🛡️ Verification Level", value: verificationLevel, inline: true },
        { name: "📆 Created On", value: `<t:${createdAt}:F>`, inline: true }
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    await interaction.reply({ embeds: [embed] });
  },
};
