const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('change-name')
        .setDescription('تغيير اسم البوت')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('الاسم الجديد للبوت')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(32)),

    async execute(interaction) {
        try {
            const newName = interaction.options.getString('name');

            await interaction.client.user.setUsername(newName);
            
            await interaction.reply({
                content: `✅ تم تغيير اسم البوت الى: ${newName}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error changing name:', error);
            await interaction.reply({
                content: '❌ حدث خطأ أثناء تغيير الاسم. حاول مرة اخرى',
                ephemeral: true
            });
        }
    }
};
