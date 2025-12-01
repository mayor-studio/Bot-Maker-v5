const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/BroadcastDB");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('send-panel')
        .setDescription('Send broadcast control panel'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        try {
            const broadcastMsg = db.get(`broadcast_msg_${interaction.guild.id}`) ?? "No broadcast message set";
            const msgId = db.get(`msgid_${interaction.guild.id}`);
            const tokens = db.get(`tokens_${interaction.guild.id}`) ?? [];

            // Delete previous panel message if exists
            if (msgId) {
                try {
                    const channels = interaction.guild.channels.cache;
                    for (const channel of channels.values()) {
                        try {
                            const msg = await channel.messages.fetch(msgId);
                            if (msg) await msg.delete();
                        } catch {
                            // Message not found in this channel, continue
                            continue;
                        }
                    }
                } catch {
                    // ignore errors here
                }
            }

            const embed = new EmbedBuilder()
                .setTitle("**Broadcast Control Panel**")
                .addFields(
                    {
                        name: "**Number of Registered Bots**",
                        value: `\`\`\`${tokens.length} bots\`\`\``,
                        inline: false
                    },
                    {
                        name: "**Current Broadcast Message**",
                        value: `\`\`\`${broadcastMsg}\`\`\``,
                        inline: false
                    },
                )
                .setDescription("**You can control the bot using the buttons below**")
                .setColor('Aqua')
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            const addTokenButton = new ButtonBuilder()
                .setCustomId('add_token_button')
                .setLabel('Add Broadcast Token')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🤖');

            const setBroadcastMessageButton = new ButtonBuilder()
                .setCustomId('broadcast_message_button')
                .setLabel('Set Broadcast Message')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📡');

            const startBroadcastButton = new ButtonBuilder()
                .setCustomId('run_broadcast_button')
                .setLabel('Start Broadcast')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅');

            const row = new ActionRowBuilder()
                .addComponents(addTokenButton, setBroadcastMessageButton, startBroadcastButton);

            const newMsg = await interaction.editReply({ embeds: [embed], components: [row] });

            await db.set(`msgid_${interaction.guild.id}`, newMsg.id);

        } catch (error) {
            console.error("Error sending broadcast panel:", error);
            interaction.editReply({ content: "An error occurred while sending the broadcast panel.", ephemeral: true });
        }
    }
};
