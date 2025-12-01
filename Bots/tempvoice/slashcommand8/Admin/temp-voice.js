const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const { Database } = require("st.db");
const tempVoiceDB = new Database("/Json-db/Bots/tempvoiceDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempvoice')
        .setDescription('Setup temporary voice channel system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup the temporary voice system')
                .addChannelOption(option =>
                    option.setName('join-channel')
                        .setDescription('The voice channel users will join to create their channel')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildVoice))
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription('The category where temporary channels will be created')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildCategory))
                .addChannelOption(option =>
                    option.setName('control-panel')
                        .setDescription('The text channel where the control panel will be sent')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable the temporary voice system'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('panel')
                .setDescription('Resend the control panel'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'setup': {
                    const joinChannel = interaction.options.getChannel('join-channel');
                    const category = interaction.options.getChannel('category');
                    const controlPanel = interaction.options.getChannel('control-panel');

                    // Save configuration to database
                    tempVoiceDB.set(`tempvoice_${interaction.guild.id}`, {
                        joinChannelId: joinChannel.id,
                        categoryId: category.id,
                        controlPanelId: controlPanel.id
                    });

                    // Create and send control panel
                    await sendControlPanel(controlPanel);

                    await interaction.reply({
                        content: '✅ Temporary voice system has been set up successfully!',
                        ephemeral: true
                    });
                    break;
                }

                case 'disable': {
                    tempVoiceDB.delete(`tempvoice_${interaction.guild.id}`);
                    await interaction.reply({
                        content: '✅ Temporary voice system has been disabled.',
                        ephemeral: true
                    });
                    break;
                }

                case 'panel': {
                    const config = tempVoiceDB.get(`tempvoice_${interaction.guild.id}`);
                    if (!config) {
                        return interaction.reply({
                            content: '❌ Temporary voice system is not set up!',
                            ephemeral: true
                        });
                    }

                    const controlPanel = interaction.guild.channels.cache.get(config.controlPanelId);
                    if (!controlPanel) {
                        return interaction.reply({
                            content: '❌ Control panel channel not found!',
                            ephemeral: true
                        });
                    }

                    await sendControlPanel(controlPanel);
                    await interaction.reply({
                        content: '✅ Control panel has been resent!',
                        ephemeral: true
                    });
                    break;
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ An error occurred while setting up the temporary voice system.',
                ephemeral: true
            });
        }
    },
};

async function sendControlPanel(channel) {
    const embed = new EmbedBuilder()
        .setTitle('🎙️ Temporary Voice Channel Controls')
        .setDescription('Click the buttons below to modify your voice channel:')
        .setColor('Blue')
        .addFields(
            { name: '🔒 Lock', value: 'Prevent users from joining' },
            { name: '🔓 Unlock', value: 'Allow users to join' },
            { name: '👥 User Limit', value: 'Set the maximum number of users' },
            { name: '✏️ Rename', value: 'Change your channel name' },
            { name: '🚫 Block', value: 'Block specific users' },
            { name: '✅ Unblock', value: 'Unblock specific users' },
            { name: '📨 Invite', value: 'Invite a user (sends DM)' },
            { name: '👑 Transfer', value: 'Transfer ownership by ID' },
            { name: '🚪 Kick', value: 'Kick a user from channel' },
            { name: '❌ Delete', value: 'Delete your temporary channel' }
        )
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('temp_lock')
                .setLabel('Lock')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒'),
            new ButtonBuilder()
                .setCustomId('temp_unlock')
                .setLabel('Unlock')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🔓'),
            new ButtonBuilder()
                .setCustomId('temp_limit')
                .setLabel('User Limit')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👥'),
            new ButtonBuilder()
                .setCustomId('temp_rename')
                .setLabel('Rename')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✏️'),
            new ButtonBuilder()
                .setCustomId('temp_invite')
                .setLabel('Invite')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📨')
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('temp_block')
                .setLabel('Block')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🚫'),
            new ButtonBuilder()
                .setCustomId('temp_unblock')
                .setLabel('Unblock')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId('temp_transfer')
                .setLabel('Transfer')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👑'),
            new ButtonBuilder()
                .setCustomId('temp_kick')
                .setLabel('Kick')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🚪')
        );

    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('temp_delete')
                .setLabel('Delete')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
        );

    await channel.send({ embeds: [embed], components: [row, row2, row3] });
}