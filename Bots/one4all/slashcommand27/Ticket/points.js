const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const managers = require("../../../../database/managers");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('points')
        .setDescription('Check your points or someone else’s points')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to check points for')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        const sent = await interaction.deferReply({ fetchReply: true, ephemeral: false });
        
        const embed = new EmbedBuilder()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp(Date.now())
            .setColor('#000000');

        const user = interaction.options.getUser('user') || interaction.user;

        let userProfile = await managers.findOne({ guildid: interaction.guild.id, id: user.id });
        
        if (!userProfile) {
            // Create a new profile if none exists
            await new managers({
                guildid: interaction.guild.id,
                id: user.id,
                points: 0
            }).save();

            embed.setTitle(`**${user.id === interaction.user.id ? 'Your' : `${user.username}'s`} points: \`0\`**`);
            return interaction.editReply({ embeds: [embed] });
        }

        embed.setTitle(`**${user.id === interaction.user.id ? 'Your' : `${user.username}'s`} points: \`${userProfile.points}\`**`);
        return interaction.editReply({ embeds: [embed] });
    }
};
