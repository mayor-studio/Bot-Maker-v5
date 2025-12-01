const {
    SlashCommandBuilder,
    PermissionsBitField
} = require("discord.js");

const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/taxDB");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-tax-room')
        .setDescription('Set the automatic tax channel')
        .addChannelOption(option =>
            option
                .setName('room')
                .setDescription('The channel to set for tax commands')
                .setRequired(true)
        ),

    async execute(interaction) {
        const room = interaction.options.getChannel('room');
        await db.set(`tax_room_${interaction.guild.id}`, room.id);

        return interaction.reply({
            content: `✅ **The tax channel has been set to ${room}.**`
        });
    }
};
