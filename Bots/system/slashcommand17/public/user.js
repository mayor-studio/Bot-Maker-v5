const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Displays information about a user.")
    .addUserOption(option =>
      option.setName("target")
        .setDescription("The user to view")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("target") || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:F>\n<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;
    const joinedAt = member?.joinedTimestamp
      ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
      : "N/A";

    const roles = member?.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString())
      .slice(0, 10)
      .join(" ") || "None";

    const embed = new EmbedBuilder()
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor("Blurple")
      .addFields(
        { name: "🆔 User ID", value: user.id, inline: true },
        { name: "🤖 Bot Account", value: user.bot ? "Yes" : "No", inline: true },
        { name: "🎂 Account Created", value: createdAt, inline: false },
        { name: "📥 Joined Server", value: joinedAt, inline: false },
        { name: "⭐ Boosting Server", value: member?.premiumSince ? "Yes" : "No", inline: true },
        { name: "🔰 Roles", value: roles, inline: false }
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    await interaction.reply({ embeds: [embed] });
  },
};
