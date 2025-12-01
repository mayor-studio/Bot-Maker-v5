const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner-server')
    .setDescription("Display the server's banner"),

  async execute(interaction) {
    const bannerURL = interaction.guild.bannerURL({ dynamic: true, size: 4096 });

    if (!bannerURL) {
      return interaction.reply({
        content: "🚫 This server does not have a banner set.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🏞️ Server Banner")
      .setDescription(`[Click here to open in full size](${bannerURL})`)
      .setImage(bannerURL)
      .setColor("Random")
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    await interaction.reply({ embeds: [embed] });
  }
};
