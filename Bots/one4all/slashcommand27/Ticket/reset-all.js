const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const managers = require("../../../../database/managers");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('reset-all')
        .setDescription('Reset points for everyone'),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false });

        let embed = new EmbedBuilder()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()
            .setColor('#000000');

        let profiles = await managers.find({ guildid: interaction.guild.id });

        if (!profiles || profiles.length === 0) {
            embed.setTitle(`**There are no points to reset for anyone.**`);
            return interaction.editReply({ embeds: [embed] });
        }

        // Reset points for all profiles
        await Promise.all(profiles.map(profile => {
            profile.points = 0;
            return profile.save();
        }));

        embed.setTitle(`**Successfully reset points for everyone!**`);
        return interaction.editReply({ embeds: [embed] });
    }
};
