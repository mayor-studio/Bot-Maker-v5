const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const spinDB = new Database("/Json-db/Bots/spinDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-spin-results')
        .setDescription('Set the channel where spin results will be posted')
        .addChannelOption(opt => 
            opt.setName('channel')
                .setDescription('The designated spin results channel')
                .setRequired(true)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        await spinDB.set(`spin_results_${interaction.guild.id}`, channel.id);
        await interaction.reply({ content: `✅ Spin results channel has been set to ${channel}`, ephemeral: true });
    }
};
