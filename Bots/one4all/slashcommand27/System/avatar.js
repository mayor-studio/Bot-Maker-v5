const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  ownersOnly: false,
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('View an avatar (user, bot, or server)')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Choose the avatar type')
        .addChoices(
          { name: 'User Avatar', value: 'user' },
          { name: 'Bot Avatar', value: 'bot' },
          { name: 'Server Icon', value: 'server' }
        )
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Select a user')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const type = interaction.options.getString('type');
    const targetUser = interaction.options.getUser('user') || interaction.user;

    let imageUrl, titleText;

    if (type === 'user') {
      imageUrl = targetUser.displayAvatarURL({ dynamic: true, size: 4096 });
      titleText = `${targetUser.username}'s Avatar`;
    } else if (type === 'bot') {
      imageUrl = interaction.client.user.displayAvatarURL({ dynamic: true, size: 4096 });
      titleText = `Bot Avatar (${interaction.client.user.username})`;
    } else if (type === 'server') {
      if (!interaction.guild.icon) {
        return interaction.editReply('⚠️ This server has no icon.');
      }
      imageUrl = interaction.guild.iconURL({ dynamic: true, size: 4096 });
      titleText = `${interaction.guild.name}'s Server Icon`;
    }

    const embed = new EmbedBuilder()
      .setTitle(titleText)
      .setImage(imageUrl)
      .setColor('Random')
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download 4K')
        .setStyle(ButtonStyle.Link)
        .setURL(imageUrl.replace(/size=\d+/, 'size=4096')),

      new ButtonBuilder()
        .setLabel('Download 8K')
        .setStyle(ButtonStyle.Link)
        .setURL(imageUrl.replace(/size=\d+/, 'size=8192'))
    );

    return interaction.editReply({ embeds: [embed], components: [row] });
  }
};
