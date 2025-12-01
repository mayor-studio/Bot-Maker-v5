const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { Database } = require('st.db');
const db = new Database('/Json-db/Bots/ticketDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-ticket-message')
        .setDescription('تعيين رسالة التذاكر')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('الرسالة التي ستظهر عند فتح التذكرة')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('الكاتيجوري الذي سيتم انشاء التذاكر فيه')
                .addChannelTypes(4)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('نوع الرسالة')
                .setRequired(true)
                .addChoices(
                    { name: 'Embed', value: 'embed' },
                    { name: 'Message', value: 'message' }
                )
        ),

    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ يجب ان تكون اداري', ephemeral: true });
        }

        const message = interaction.options.getString('message');
        const category = interaction.options.getChannel('category');
        const type = interaction.options.getString('type');

        try {
            await db.set(`TicketMessage_${interaction.guild.id}`, {
                message: message,
                category: category.id,
                type: type
            });

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('✅ تم تعيين رسالة التذاكر')
                .addFields(
                    { name: 'الرسالة', value: message },
                    { name: 'الكاتيجوري', value: `<#${category.id}>` },
                    { name: 'النوع', value: type === 'embed' ? 'Embed' : 'Message' }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: '❌ حدث خطأ اثناء تعيين رسالة التذاكر', 
                ephemeral: true 
            });
        }
    }
};
