const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('عرض قائمة المساعدة'),
    
    async execute(interaction) {
        // Get the server prefix - replace this with your actual prefix fetching logic
        const prefix = interaction.client.prefix || '!'; // Default to ! if not set

        // Create the main help embed
        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('قائمة المساعدة')
            .setDescription('انقر على الأزرار أدناه لعرض فئات الأوامر المختلفة')
            .setTimestamp()
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ 
                text: 'Requested by: ' + interaction.user.tag, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            });

        // Create category buttons
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tiicket_help')
                    .setLabel('Ticket')
                    .setStyle(ButtonStyle.Secondary)
            );

        const response = await interaction.reply({
            embeds: [helpEmbed],
            components: [row1],
            fetchReply: true
        });

        const collector = response.createMessageComponentCollector();

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'لا يمكنك استخدام هذه الأزرار!', ephemeral: true });
            }

            try {
                let newEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTimestamp()
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ 
                        text: 'Requested by: ' + interaction.user.tag,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                    });

                if (i.customId === 'tiicket_help') {
                    newEmbed
                        .setTitle('أوامر التذاكر')
                        .setDescription('هنا جميع أوامر التذاكر:')
                        .addFields(
                            { name: `/setup-ticket`, value: 'إعداد نظام التذاكر' },
                            { name: `/add-ticket-button`, value: 'إضافة زر لقائمة التذاكر' },
                            { name: `/remove-ticket-button`, value: 'إزالة زر من التذاكر' },
                            { name: `/set-ticket-message`, value: 'تعيين رسالة ترسل في التذكرة' },
                            { name: `/delete-ticket-message`, value: 'حذف رسالة التذكرة' },
                            { name: `/points`, value: 'لرؤية النقاط المطالب بها' },
                            { name: `/set-ticket-log`, value: 'لتعيين سجل التذاكر' },
                            { name: `/reset-all`, value: 'إعادة تعيين جميع النقاط' },
                            { name: `/reset`, value: 'إعادة تعيين نقاط عضو' },
                            { name: `/to-select`, value: 'تغيير التذكرة إلى قائمة اختيار' },
                            { name: `/top`, value: 'لعرض أفضل 10 أعضاء' },
                            { name: `${prefix}delete`, value: 'لحذف تذكرة' },
                            { name: `${prefix}rename`, value: 'لإعادة تسمية تذكرة' },
                            { name: `${prefix}add`, value: 'to add a member to ticket' }
                        );
                }

                await i.update({ embeds: [newEmbed], components: [row1] });
            } catch (error) {
                console.error('Error updating interaction:', error);
                try {
                    await i.followUp({ 
                        content: 'حدث خطأ. الرجاء المحاولة مرة أخرى.',
                        ephemeral: true 
                    });
                } catch {}
            }
        });
    }
};