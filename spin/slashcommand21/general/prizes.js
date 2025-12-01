const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const spinDB = new Database("/Json-db/Bots/spinDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prizes')
        .setDescription('Display the list of normal and VIP spin prizes'),

    async execute(interaction) {
        const normalPrizes = await spinDB.get(`normal_prizes_${interaction.guild.id}`) || [];
        const vipPrizes = await spinDB.get(`vip_prizes_${interaction.guild.id}`) || [];
        const normalRequired = await spinDB.get(`spin_invites_${interaction.guild.id}`) ?? 5;
        const vipRequired = await spinDB.get(`vip_spin_invites_${interaction.guild.id}`) ?? 10;

        const embed = new EmbedBuilder()
            .setTitle('🎁 Spin Prizes List')
            .addFields(
                { 
                    name: '🎲 Normal Spin Prizes', 
                    value: normalPrizes.length ? normalPrizes.map((p, i) => `${i + 1}. ${p}`).join('\n') : 'No prizes set',
                    inline: true 
                },
                { name: '⭐ Required Invites', value: `${normalRequired} invites`, inline: true },
                { name: '\u200B', value: '\u200B', inline: true }, // Spacer
                { 
                    name: '🎯 VIP Spin Prizes', 
                    value: vipPrizes.length ? vipPrizes.map((p, i) => `${i + 1}. ${p}`).join('\n') : 'No prizes set',
                    inline: true 
                },
                { name: '👑 Required Invites', value: `${vipRequired} invites`, inline: true },
                { name: '\u200B', value: '\u200B', inline: true }  // Spacer
            )
            .setColor('Gold')
            .setTimestamp()
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        await interaction.reply({ embeds: [embed] });
    }
};
