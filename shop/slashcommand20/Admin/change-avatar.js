const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('change-avatar')
        .setDescription('Change the bot\'s avatar')
        .addAttachmentOption(option =>
            option.setName('avatar')
                .setDescription('New avatar image')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const attachment = interaction.options.getAttachment('avatar');

            if (!attachment.contentType.startsWith('image/')) {
                return interaction.reply({
                    content: '❌ Please provide a valid image file.',
                    ephemeral: true
                });
            }

            await interaction.client.user.setAvatar(attachment.url);

            await interaction.reply({
                content: '✅ Bot avatar has been changed successfully.',
                ephemeral: true
            });
        } catch (error) {
            console.error('Error changing avatar:', error);
            await interaction.reply({
                content: '❌ An error occurred while changing the avatar. Please make sure the image URL is valid.',
                ephemeral: true
            });
        }
    }
};
