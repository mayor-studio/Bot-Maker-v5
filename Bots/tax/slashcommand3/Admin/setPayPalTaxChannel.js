const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require('st.db');

const payDB = new Database("/Json-db/Bots/payDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-paypal-tax-channel')
        .setDescription('Set a channel for PayPal auto-tax calculations.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set for PayPal auto-tax.')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        // Save the channel ID to the database
        payDB.set(`${interaction.guild.id}_paypal_tax_channel`, channel.id);

        return interaction.reply({
            content: `✅ The PayPal auto-tax channel has been set to ${channel}.`,
            ephemeral: true,
        });
    },
};