const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const offersDB = new Database("/Json-db/Bots/offersDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-offers-room')
        .setDescription('Remove a channel from the offers list')
        .addChannelOption(option => 
            option
                .setName('room')
                .setDescription('The room to remove')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const room = interaction.options.getChannel('room');
            const guildId = interaction.guild.id;

            // Get the current list of offer rooms or initialize as empty array
            let offerRooms = await offersDB.get(`offers_room_${guildId}`);
            if (!Array.isArray(offerRooms)) {
                offerRooms = [];
            }

            if (offerRooms.includes(room.id)) {
                offerRooms = offerRooms.filter(id => id !== room.id);
                await offersDB.set(`offers_room_${guildId}`, offerRooms);
                return interaction.reply({ content: `✅ The room has been successfully removed.` });
            } else {
                return interaction.reply({ content: `❌ This room is not in the list.` });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `❌ An error occurred. Please try again later.` });
        }
    }
};
