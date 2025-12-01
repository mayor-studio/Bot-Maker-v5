const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/taxDB");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-tax-room')
        .setDescription('Remove the configured automatic tax channel'),

    async execute(interaction) {
        const key = `tax_room_${interaction.guild.id}`;
        const exists = await db.get(key);

        if (!exists) {
            return interaction.reply({
                content: `⚠️ **No tax channel is currently set.**`,
                ephemeral: true
            });
        }

        await db.delete(key);

        return interaction.reply({
            content: `✅ **The tax channel has been removed successfully.**`
        });
    }
};
