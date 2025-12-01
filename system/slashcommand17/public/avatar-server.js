const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar-server')
    .setDescription('Display the server\'s avatar'),

  async execute(interaction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);

    if (!member.permissions.has(PermissionFlagsBits.SendMessages)) {
      return interaction.reply({
        content: "❌ I don't have permission to send messages in this server.",
        ephemeral: true,
      });
    }

    const serverAvatarURL = interaction.guild.iconURL({ dynamic: true, size: 4096 });

    const embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle("🖼️ Server Avatar")
      .setDescription(`[Click here to open in full size](${serverAvatarURL})`)
      .setImage(serverAvatarURL)
      .setColor("Random")
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
