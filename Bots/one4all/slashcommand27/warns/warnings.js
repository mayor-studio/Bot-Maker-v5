const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const warnsDB = new Database("/Json-db/Bots/warnsDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View a member’s warnings')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('The member whose warnings you want to see')
            .setRequired(true)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const guildId = interaction.guild.id;
        const userId = user.id;

        const warns = await warnsDB.get(`warns_${guildId}_${userId}`) || [];
        
        const embed = new EmbedBuilder()
            .setTitle(`Warnings for ${user.tag}`)
            .setColor('Blue');

        if (warns.length === 0) {
            embed.setDescription('No warnings found');
        } else {
            const warningsText = warns.map((warn, index) => {
                return `**#${index + 1}** by <@${warn.moderator}>\n**Reason:** ${warn.reason}\n**Date:** <t:${Math.floor(warn.timestamp / 1000)}:R>`;
            }).join('\n\n');
            embed.setDescription(warningsText);
        }

        await interaction.reply({ embeds: [embed] });
    }
};
