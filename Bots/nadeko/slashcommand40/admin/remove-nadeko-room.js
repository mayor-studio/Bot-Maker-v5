const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/nadekoDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-nadeko-room')
        .setDescription('Remove a room where the Nadeko feature is enabled')
        .addChannelOption(option => 
            option.setName('room')
                .setDescription('The channel to remove')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const room = interaction.options.getChannel('room');
        let rooms = db.get(`rooms_${interaction.guild.id}`);

        if (!rooms) {
            db.set(`rooms_${interaction.guild.id}`, []);
            return interaction.editReply({
                content: `❌ This room was not added before so it cannot be removed.`
            });
        }

        rooms = db.get(`rooms_${interaction.guild.id}`);

        if (!rooms.includes(room.id)) {
            return interaction.editReply({
                content: `❌ This room is not in the list of enabled rooms.`
            });
        }

        const updatedRooms = rooms.filter(r => r !== room.id);
        db.set(`rooms_${interaction.guild.id}`, updatedRooms);

        return interaction.editReply({
            content: `✅ The room has been successfully removed.`
        });
    }
};
