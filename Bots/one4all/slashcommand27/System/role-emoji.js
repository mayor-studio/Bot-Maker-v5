const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-role-icon')
    .setDescription('Add an emoji to a role')
    .addRoleOption(option => 
      option.setName('role')
        .setDescription('Select the role')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('emoji')
        .setDescription('Please choose a non-animated emoji')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    if (interaction.guild.premiumTier < 2) {
      return interaction.reply({ content: 'The server must be at level 2 boosts.', ephemeral: true });
    }

    const role = interaction.options.getRole('role');
    const emojiInput = interaction.options.getString('emoji');

    // Check the type of emoji
    const customEmojiMatch = emojiInput.match(/<:\w+:(\d+)>/);
    let emojiURL;

    if (customEmojiMatch) {
      // If it's a custom emoji, use its CDN URL
      const emojiID = customEmojiMatch[1];
      emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
    } else if (/^\p{Emoji}$/u.test(emojiInput)) {
      // Validate if it's a normal Unicode emoji
      emojiURL = emojiInput;
    } else {
      return interaction.reply({ content: 'Please provide a valid emoji or custom emoji.', ephemeral: true });
    }

    try {
      await role.setIcon(emojiURL);
      interaction.reply(`Role icon updated for ${role.name} to ${emojiInput}.`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'There was an error setting the role icon. Please ensure the emoji is valid.', ephemeral: true });
    }
  },
};
