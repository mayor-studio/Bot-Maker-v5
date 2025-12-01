const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('change-name')
        .setDescription('Change the bot\'s username')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The new username for the bot')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(32)),
    
    async execute(interaction) {
        try {
            const newName = interaction.options.getString('name');

            await interaction.client.user.setUsername(newName);

            await interaction.reply({
                content: `✅ Bot username has been changed to: ${newName}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error changing username:', error);
            await interaction.reply({
                content: '❌ An error occurred while changing the username. Please try again.',
                ephemeral: true
            });
        }
    }
};
