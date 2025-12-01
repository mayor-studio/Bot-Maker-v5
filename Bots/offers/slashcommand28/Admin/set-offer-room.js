const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const offersDB = new Database("/Json-db/Bots/offersDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-offers-room')
        .setDescription('Set the offers room')
        .addChannelOption(option => 
            option
                .setName('room')
                .setDescription('The room to set as offers room')
                .setRequired(true)),
                
    async execute(interaction) {
        try {
            const room = interaction.options.getChannel('room');
            const guildId = interaction.guild.id;

            // Get existing offer rooms or initialize
            let offerRooms = await offersDB.get(`offers_room_${guildId}`);
            if (!Array.isArray(offerRooms)) {
                offerRooms = [];
            }

            // Check if already added
            if (!offerRooms.includes(room.id)) {
                offerRooms.push(room.id);
                await offersDB.set(`offers_room_${guildId}`, offerRooms);
                return interaction.reply({ content: `✅ The room has been added successfully.` });
            } else {
                return interaction.reply({ content: `⚠️ This room is already in the list.` });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `❌ An error occurred. Please try again later.` });
        }
    }
};
