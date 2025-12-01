const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('change-avatar')
        .setDescription('تغيير صورة البوت')
        .addAttachmentOption(option =>
            option.setName('avatar')
                .setDescription('الصورة الجديدة')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const attachment = interaction.options.getAttachment('avatar');

            if (!attachment.contentType.startsWith('image/')) {
                return interaction.reply({
                    content: '❌ الرجاء إرفاق صورة صالحة',
                    ephemeral: true
                });
            }

            await interaction.client.user.setAvatar(attachment.url);
            
            await interaction.reply({
                content: '✅ تم تغيير صورة البوت بنجاح',
                ephemeral: true
            });
        } catch (error) {
            console.error('Error changing avatar:', error);
            await interaction.reply({
                content: '❌ حدث خطأ أثناء تغيير الصورة. تأكد من صحة الرابط',
                ephemeral: true
            });
        }
    }
};
