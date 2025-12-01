const { Events } = require('discord.js');
const { Database } = require("st.db");
const tempVoiceDB = new Database("/Json-db/Bots/tempvoiceDB.json");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('temp_')) return;

        const channel = interaction.member.voice.channel;
        if (!channel) {
            return interaction.reply({ content: "You must be in a temporary voice channel!", ephemeral: true });
        }

        const channelData = await tempVoiceDB.get(`temp_channel_${channel.id}`);
        if (!channelData) {
            return interaction.reply({ content: "This is not a temporary voice channel!", ephemeral: true });
        }

        if (channelData.owner !== interaction.member.id) {
            return interaction.reply({ content: "You don't own this voice channel!", ephemeral: true });
        }

        switch (interaction.customId) {
            case 'temp_lock':
                channelData.locked = !channelData.locked;
                await channel.permissionOverwrites.edit(interaction.guild.id, {
                    Connect: channelData.locked ? false : null
                });
                await tempVoiceDB.set(`temp_channel_${channel.id}`, channelData);
                await interaction.reply({ content: `Channel ${channelData.locked ? 'locked' : 'unlocked'}!`, ephemeral: true });
                break;

            case 'temp_limit':
                const modal = {
                    title: "Set User Limit",
                    custom_id: "temp_limit_modal",
                    components: [{
                        type: 1,
                        components: [{
                            type: 4,
                            custom_id: "limit",
                            label: "User Limit (0-99)",
                            style: 1,
                            min_length: 1,
                            max_length: 2,
                            required: true,
                            placeholder: "Enter a number"
                        }]
                    }]
                };
                await interaction.showModal(modal);
                break;

            case 'temp_rename':
                // Add rename logic
                break;

            case 'temp_claim':
                // Add claim logic
                break;

            case 'temp_delete':
                await channel.delete();
                await tempVoiceDB.delete(`temp_channel_${channel.id}`);
                await interaction.reply({ content: "Channel deleted!", ephemeral: true });
                break;
        }
    }
};
