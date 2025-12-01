const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const autolineDB = new Database("/Json-db/Bots/autolineDB.json");

module.exports = {
    ownersOnly: false,
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-autoline-channel')
        .setDescription('Remove an auto-line channel')
        .addChannelOption(option => 
            option
                .setName('room')
                .setDescription('The channel to remove')
                .setRequired(true)),

    async execute(interaction) {
        const room = interaction.options.getChannel('room');
        const key = `line_channels_${interaction.guild.id}`;

        if (!autolineDB.has(key)) {
            await autolineDB.set(key, []);
        }

        const db = autolineDB.get(key);
        const filtered = db.filter(ch => ch !== room.id);
        await autolineDB.set(key, filtered);

        return interaction.reply({ content: `✅ Channel <#${room.id}> was successfully removed.` });
    }
};
