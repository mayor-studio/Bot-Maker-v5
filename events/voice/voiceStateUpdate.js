const { ChannelType } = require('discord.js');
const { Database } = require("st.db");
const tempVoiceDB = new Database("/Json-db/Bots/tempvoiceDB.json");
const tempChannelsDB = new Database("/Json-db/Bots/tempChannels.json");

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        try {
            // Get temp voice config
            const config = tempVoiceDB.get(`tempvoice_${newState.guild.id}`);
            if (!config) return;

            // Handle user joining the creation channel
            if (newState.channelId === config.joinChannelId) {
                const newChannel = await newState.guild.channels.create({
                    name: `${newState.member.user.username}'s Channel`,
                    type: ChannelType.GuildVoice,
                    parent: config.categoryId,
                    permissionOverwrites: [
                        {
                            id: newState.member.id,
                            allow: ['Connect', 'Speak', 'ManageChannels', 'MuteMembers', 'DeafenMembers']
                        },
                        {
                            id: newState.guild.id,
                            allow: ['Connect', 'Speak']
                        }
                    ]
                });

                // Store channel ownership
                tempChannelsDB.set(`channel_${newChannel.id}`, {
                    owner: newState.member.id,
                    locked: false
                });

                // Move member to new channel
                await newState.member.voice.setChannel(newChannel).catch(console.error);
            }

            // Clean up empty temporary channels
            if (oldState.channel && 
                oldState.channel.parentId === config.categoryId && 
                oldState.channel.id !== config.joinChannelId && 
                oldState.channel.members.size === 0) {
                tempChannelsDB.delete(`channel_${oldState.channel.id}`);
                await oldState.channel.delete().catch(console.error);
            }

        } catch (error) {
            console.error('Error in voice state update:', error);
        }
    }
};
