const { SlashCommandBuilder } = require('discord.js');
const { Database } = require("st.db");
const spinDB = new Database("/Json-db/Bots/spinDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-invites-log')
        .setDescription('Set the invite log channel')
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('The channel to log invites')
                .setRequired(true)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        await spinDB.set(`invites_log_${interaction.guild.id}`, channel.id);
        await interaction.reply({ content: `✅ Invite log channel has been set to ${channel}`, ephemeral: true });
    }
};
