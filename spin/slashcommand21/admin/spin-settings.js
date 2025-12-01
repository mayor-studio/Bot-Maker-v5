const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const spinDB = new Database("/Json-db/Bots/spinDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('spin-settings')
        .setDescription('View current spin settings'),

    async execute(interaction) {
        const resultsChannel = await spinDB.get(`spin_results_${interaction.guild.id}`);
        const invitesLog = await spinDB.get(`invites_log_${interaction.guild.id}`);
        const vipPrizes = await spinDB.get(`vip_prizes_${interaction.guild.id}`) || [];
        const normalPrizes = await spinDB.get(`normal_prizes_${interaction.guild.id}`) || [];
        const category = await spinDB.get(`spin_category_${interaction.guild.id}`);

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Spin Settings')
            .setColor('Blue')
            .addFields(
                { name: 'Results Channel', value: resultsChannel ? `<#${resultsChannel}>` : 'Not set' },
                { name: 'Invites Log Channel', value: invitesLog ? `<#${invitesLog}>` : 'Not set' },
                { name: 'VIP Prizes', value: vipPrizes.length ? vipPrizes.join('\n') : 'Not set' },
                { name: 'Normal Prizes', value: normalPrizes.length ? normalPrizes.join('\n') : 'Not set' },
                { name: 'Spin Category', value: category ? `<#${category}>` : 'Not set' }
            );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
