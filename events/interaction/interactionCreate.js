const { Events } = require('discord.js');
const { Database } = require("st.db");
const tempChannelsDB = new Database("/Json-db/Bots/tempChannels.json");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        // Handle temp voice buttons
        if (interaction.customId.startsWith('temp_')) {
            const member = interaction.member;
            if (!member.voice.channel) {
                return interaction.reply({ content: '❌ You must be in a voice channel!', ephemeral: true });
            }

            const channelData = tempChannelsDB.get(`channel_${member.voice.channel.id}`);
            if (!channelData || channelData.owner !== member.id) {
                return interaction.reply({ content: '❌ You do not own this voice channel!', ephemeral: true });
            }

            // Handle button interactions here
            // Add your button logic for lock, limit, rename, claim, delete
        }
    }
};
