const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { Database } = require('st.db');
const db = new Database('/Json-db/Bots/ticketDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-ticket-button')
        .setDescription('حذف زر من لوحة التذاكر')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('ايدي الرسالة')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('button_label')
                .setDescription('اسم الزر المراد حذفه')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ يجب ان تكون اداري', ephemeral: true });
        }

        try {
            const messageId = interaction.options.getString('message_id');
            const buttonLabel = interaction.options.getString('button_label');

            const message = await interaction.channel.messages.fetch(messageId);
            if (!message) {
                return interaction.reply({ content: '❌ لم يتم العثور على الرسالة', ephemeral: true });
            }

            if (!message.components || message.components.length === 0) {
                return interaction.reply({ content: '❌ لا يوجد ازرار في هذه الرسالة', ephemeral: true });
            }

            // Get existing components
            const row = message.components[0];
            const buttons = row.components.filter(btn => btn.label !== buttonLabel);

            if (buttons.length === row.components.length) {
                return interaction.reply({ content: '❌ لم يتم العثور على الزر المحدد', ephemeral: true });
            }

            // Update message with new components
            await message.edit({ components: [{ type: 1, components: buttons }] });

            // Delete ticket data for this button
            const buttonIds = await db.get(`Ticket_${interaction.channel.id}`) || {};
            for (const [id, data] of Object.entries(buttonIds)) {
                if (data && data.label === buttonLabel) {
                    await db.delete(`Ticket_${interaction.channel.id}_${id}`);
                }
            }

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ تم حذف الزر \`${buttonLabel}\` بنجاح`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Remove button error:', error);
            await interaction.reply({ 
                content: '❌ حدث خطأ اثناء حذف الزر', 
                ephemeral: true 
            });
        }
    }
};
