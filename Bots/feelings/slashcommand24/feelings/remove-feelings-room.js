const { SlashCommandBuilder } = require('discord.js');
const { Database } = require("st.db");
const feelingsDB = new Database("/Json-db/Bots/feelingsDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-feelings-room')
        .setDescription('Remove the configured feelings channel'),
    adminsOnly: true,

    async execute(interaction) {
        const guildId = interaction.guild.id;

        const existingChannel = await feelingsDB.get(`feelings_room_${guildId}`);
        const existingReactions = await feelingsDB.get(`feelings_reactions_${guildId}`);

        if (!existingChannel && !existingReactions) {
            return interaction.reply({
                content: '⚠️ No feelings channel is currently set for this server.',
                ephemeral: true
            });
        }

        await feelingsDB.delete(`feelings_room_${guildId}`);
        await feelingsDB.delete(`feelings_reactions_${guildId}`);

        return interaction.reply({
            content: '✅ Feelings channel and reactions have been removed successfully.',
            ephemeral: true
        });
    }
};
