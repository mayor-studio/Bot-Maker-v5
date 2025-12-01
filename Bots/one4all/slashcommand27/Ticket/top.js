const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const managers = require("../../../../database/managers");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('View points of all members'),

    async execute(interaction, client) {
        // Defer the reply to give the bot time to fetch data
        await interaction.deferReply({ fetchReply: true, ephemeral: false });

        // Create an embed to display the top members
        const embed = new EmbedBuilder()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()
            .setColor('#000000');

        // Fetch top 100 profiles sorted by points descending
        const profiles = await managers.find({ guildid: interaction.guild.id, points: { $gt: 0 } })
            .sort({ points: -1 })
            .limit(100);

        if (!profiles.length) {
            embed.setDescription('No members with points found.');
        } else {
            // Add a field per profile with their mention and points
            profiles.forEach(profile => {
                embed.addFields({ name: '\u200B', value: `- **<@${profile.id}> - \`${profile.points}\` points**`, inline: false });
            });
        }

        // Send the embed as a reply
        return interaction.editReply({ embeds: [embed] });
    }
};
