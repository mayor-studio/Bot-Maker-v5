const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/protectDB.json");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-protect-logs')
        .setDescription('Set the protection logs channel')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Select the log channel')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        try {
            const channel = interaction.options.getChannel('channel');
            await db.set(`protectLog_room_${interaction.guild.id}`, channel.id);

            return interaction.editReply({ content: `✅ Protection logs channel set to ${channel}` });
        } catch (error) {
            console.error("Error setting protection logs channel:", error);
            return interaction.editReply({ content: '❌ Failed to set protection logs channel.', ephemeral: true });
        }
    }
};
