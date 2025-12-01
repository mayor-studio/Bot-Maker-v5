const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { Database } = require('st.db');
const db = new Database('/Json-db/Bots/ticketDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-ticket-message')
        .setDescription('حذف رسالة التذاكر من كاتيجوري معين')
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('الكاتيجوري المراد حذف الرسالة منه')
                .addChannelTypes(4)
                .setRequired(true)
        ),

    async execute(interaction) {
        // Check for admin permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ يجب ان تكون اداري', ephemeral: true });
        }

        const category = interaction.options.getChannel('category');

        try {
            const ticketSettings = await db.get(`TicketMessage_${interaction.guild.id}`);
            
            if (!ticketSettings) {
                return interaction.reply({ 
                    content: '❌ لا توجد رسالة تذاكر مضبوطة لهذا السيرفر', 
                    ephemeral: true 
                });
            }

            if (ticketSettings.category !== category.id) {
                return interaction.reply({ 
                    content: '❌ لا توجد رسالة تذاكر مضبوطة لهذا الكاتيجوري', 
                    ephemeral: true 
                });
            }

            await db.delete(`TicketMessage_${interaction.guild.id}`);

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('✅ تم حذف رسالة التذاكر')
                .setDescription(`تم حذف رسالة التذاكر من الكاتيجوري ${category}`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Delete ticket message error:', error);
            await interaction.reply({ 
                content: '❌ حدث خطأ اثناء حذف رسالة التذاكر', 
                ephemeral: true 
            });
        }
    }
};
