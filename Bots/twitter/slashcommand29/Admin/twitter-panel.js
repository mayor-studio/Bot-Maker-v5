const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('twitter-panel')
    .setDescription('Show the main panel with options'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Twitter Bot Panel')
      .setDescription('Choose an option below:')
      .setColor('Blue');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_account')
        .setLabel('Create Account')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('show_profile')
        .setLabel('Show Profile')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('how_to_use')
        .setLabel('How to Use')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('send_tweet')
        .setLabel('Send Tweet')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('📝')
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
  },
};