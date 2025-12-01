const { Database } = require("st.db");
const db = new Database('/Json-db/Bots/ticketDB');
const { 
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    SlashCommandBuilder,
    Events,
    ActivityType,
    ModalBuilder,
    TextInputStyle,
    EmbedBuilder,
    PermissionsBitField,
    ButtonStyle,
    TextInputBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    MessageComponentCollector,
    Embed
} = require("discord.js");

module.exports = (client7) => {
    client7.on(Events.InteractionCreate, async (interaction) => {
        if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.startsWith('ticket')) {
            const customId = interaction.isStringSelectMenu() ? interaction.values[0] : interaction.customId;
        if (customId === 'reset') {
            return; 
        }
            const data = db.get(`Ticket_${interaction.channel.id}_${customId}`);
            if (!data) return interaction.reply({ content: `Please Setup Again`, ephemeral: true });

            if (data.Ask === 'on') {
                const modal = new ModalBuilder()
                    .setCustomId(customId + '_modal')
                    .setTitle('سبب فتح التذكرة')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('ticket_reason')
                                .setLabel('ما هو سبب فتح التكت')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );
                await interaction.showModal(modal);
            } else {
                createTicketChannel(interaction, data);
            }
        }

        if (interaction.isModalSubmit() && interaction.customId.endsWith('_modal')) {
            const buttonCustomId = interaction.customId.replace('_modal', '');
            const data = db.get(`Ticket_${interaction.channel.id}_${buttonCustomId}`);
            if (!data) return interaction.reply({ content: `Please Setup Again`, ephemeral: true });
            
            const ticketReason = interaction.fields.getTextInputValue('ticket_reason');
            createTicketChannel(interaction, data, ticketReason);
        }

    });

    client7.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'notify') return;

        const ticketData = db.get(`TICKET-PANEL_${interaction.channel.id}`);
        if (!ticketData) return interaction.reply({ content: 'Ticket data not found', ephemeral: true });

        // Check if user has support role
        if (!interaction.member.roles.cache.has(ticketData.Support)) {
            return interaction.reply({ content: 'You need support role to notify members', ephemeral: true });
        }

        try {
            const ticketUser = await interaction.guild.members.fetch(ticketData.author);
            await ticketUser.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blue')
                        .setTitle('🔔 إشعار تذكرة')
                        .setDescription(`فريق الدعم في انتظار ردك في التذكرة`)
                        .setTimestamp()
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel('الذهاب للتذكرة')
                                .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`)
                                .setStyle(ButtonStyle.Link)
                                .setEmoji('🎫')
                        )
                ]
            });

            await interaction.reply({ content: '✅ تم ارسال الإشعار للعضو', ephemeral: true });
        } catch (error) {
            await interaction.reply({ 
                content: '❌ لم استطع ارسال رسالة خاصة للعضو. قد تكون الرسائل الخاصة معطلة',
                ephemeral: true 
            });
        }
    });
};

async function createTicketChannel(interaction, data, ticketReason = null) {
    // Get and increment ticket counter
    const ticketCount = (db.get(`ticketCounter_${interaction.guild.id}`) || 0) + 1;
    db.set(`ticketCounter_${interaction.guild.id}`, ticketCount);
    
    const channel = await interaction.guild.channels.create({
        name: `ticket-${ticketCount}`,
        type: 0,
        parent: data.Category,
        permissionOverwrites: [
            {
                id: interaction.guild.roles.everyone.id,
                deny: ['ViewChannel'],
            },
            {
                id: data.Support,
                allow: ['ViewChannel', 'SendMessages'],
            },
            {
                id: interaction.user.id,
                allow: ['ViewChannel', 'SendMessages'],
            },
        ],
    });

    db.set(`TICKET-PANEL_${channel.id}`, { author: interaction.user.id, Support: data.Support });
    interaction.reply({ content: `${channel} has been created :white_check_mark:`, ephemeral: true });

    const embed = new EmbedBuilder()
        .setColor('Random')
        .setDescription(`${data.Internal}${ticketReason ? `\n\n**سبب فتح التكت:**\n\`\`\`${ticketReason}\`\`\`` : ''}`)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    const select = new StringSelectMenuBuilder()
        .setCustomId('supportPanel')
        .setPlaceholder('لوحة تحكم السبورت')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('تغيير اسم التكت')
                .setValue('renameTicket')
                .setEmoji('✍🏼'),
            new StringSelectMenuOptionBuilder()
                .setLabel('اضافة عضو للتذكرة')
                .setValue('addMemberToTicket')
                .setEmoji('✅'),
            new StringSelectMenuOptionBuilder()
                .setLabel('حذف عضو من التذكرة')
                .setValue('removeMemberFromTicket')
                .setEmoji('⛔'),
            new StringSelectMenuOptionBuilder()
                .setLabel('اعادة تحميل')
                .setValue('refreshSupportPanel')
                .setEmoji('🔄'),
        );

    const row2 = new ActionRowBuilder().addComponents(select);
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('claim').setLabel('Claim').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('notify').setLabel('DM Notify').setStyle(ButtonStyle.Primary)
        );

    if (data.Type === 'embed') {
        await channel.send({ 
            content: `${interaction.user},<@&${data.Support}>`, 
            embeds: [embed], 
            components: [row, row2] 
        });
    } else {
        await channel.send({ 
            content: `${interaction.user},<@&${data.Support}>\n${data.Internal}${ticketReason ? `\n\n**سبب فتح التكت:**\n\`\`\`${ticketReason}\`\`\`` : ''}`, 
            components: [row, row2] 
        });
    }
}
