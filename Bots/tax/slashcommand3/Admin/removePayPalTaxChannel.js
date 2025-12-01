const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require('st.db');

const payDB = new Database("/Json-db/Bots/payDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-paypal-tax-channel')
        .setDescription('Remove the PayPal auto-tax channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Remove the channel ID from the database
        const removed = payDB.delete(`${interaction.guild.id}_paypal_tax_channel`);

        if (!removed) {
            return interaction.reply({
                content: '❌ No PayPal auto-tax channel is currently set.',
                ephemeral: true,
            });
        }

        return interaction.reply({
            content: '✅ The PayPal auto-tax channel has been removed.',
            ephemeral: true,
        });
    },
};