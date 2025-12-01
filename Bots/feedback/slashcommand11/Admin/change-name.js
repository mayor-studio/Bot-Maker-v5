const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('change-name')
        .setDescription('Change the bot\'s name')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The new name for the bot')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(32)),

    async execute(interaction) {
        try {
            const newName = interaction.options.getString('name');

            await interaction.client.user.setUsername(newName);
            
            await interaction.reply({
                content: `✅ Bot name has been changed to: ${newName}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error changing name:', error);
            await interaction.reply({
                content: '❌ An error occurred while changing the name. Please try again.',
                ephemeral: true
            });
        }
    }
};
