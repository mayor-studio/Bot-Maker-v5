const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-emoji')
    .setDescription('Add an emoji icon to a role (server must be level 2 or higher)')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Select the role')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('Enter a custom emoji (static only, no animated)')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '🚫 You do not have permission to use this command.', ephemeral: true });
    }

    if (interaction.guild.premiumTier < 2) {
      return interaction.reply({ content: '🚫 Your server must be **Boost Level 2** to use role icons.', ephemeral: true });
    }

    const role = interaction.options.getRole('role');
    const emojiInput = interaction.options.getString('emoji');

    // Match custom emoji like <:emoji:123456789012345678>
    const customEmojiMatch = emojiInput.match(/<:.*?:(\d+)>/);
    let emojiURL;

    if (customEmojiMatch) {
      const emojiID = customEmojiMatch[1];
      emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
    } else if (/^[\u0023-\u0039\u00A9\u00AE\u2000-\u3300\u1F000-\u1F9FF\u1FA70-\u1FAFF\u1F300-\u1F5FF\u1F600-\u1F64F\u1F680-\u1F6FF]+$/u.test(emojiInput)) {
      // Native Unicode emojis are not supported in role icons, only custom emoji URLs are allowed
      return interaction.reply({ content: '⚠️ Native emojis cannot be used as role icons. Please use a static custom emoji (not animated).', ephemeral: true });
    } else {
      return interaction.reply({ content: '❌ Invalid emoji format. Please provide a valid static custom emoji.', ephemeral: true });
    }

    try {
      await role.setIcon(emojiURL);
      interaction.reply(`✅ Role icon updated for **${role.name}** to ${emojiInput}`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: '❌ Failed to set role icon. Make sure the emoji is valid and the role is editable.', ephemeral: true });
    }
  },
};
