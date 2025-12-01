const { SlashCommandBuilder, EmbedBuilder, hyperlink } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Get detailed information about a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Select the user to view info')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const userFetch = await interaction.client.users.fetch(user.id, { force: true }); // fetch full user with banner

    const flags = user.flags?.toArray() || [];
    const roles = member?.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .map(role => `<@&${role.id}>`)
      .join(' ') || 'None';

    const bannerURL = userFetch.bannerURL({ dynamic: true, size: 1024 });

    const embed = new EmbedBuilder()
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setColor('Random')
      .addFields(
        { name: '🆔 User ID', value: user.id, inline: true },
        {
          name: '🖼 Avatar',
          value: hyperlink('Click here', user.displayAvatarURL({ dynamic: true, size: 1024 })),
          inline: true
        },
        { name: '📛 Username', value: user.username, inline: true },
        {
          name: '📅 Account Created',
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
          inline: false
        },
        {
          name: '📥 Joined Server',
          value: member?.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'N/A',
          inline: true
        },
        {
          name: '🚀 Boosting Server',
          value: member?.premiumSince ? `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:F>` : 'No',
          inline: true
        },
        {
          name: '🎖 Badges',
          value: flags.length ? flags.map(f => `\`${f}\``).join(', ') : 'None',
          inline: false
        },
        {
          name: `🎭 Roles [${member?.roles.cache.size - 1 || 0}]`,
          value: roles,
          inline: false
        }
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    if (bannerURL) {
      embed.setImage(bannerURL);
    }

    await interaction.reply({ embeds: [embed] });
  }
};
