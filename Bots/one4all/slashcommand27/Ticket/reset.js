const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const managers = require("../../../../database/managers");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset points of a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to reset points for')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false });

        const embed = new EmbedBuilder()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()
            .setColor('#000000');

        const user = interaction.options.getUser('user');
        let userProfile = await managers.findOne({ guildid: interaction.guild.id, id: user.id });

        if (!userProfile) {
            await new managers({
                guildid: interaction.guild.id,
                id: user.id,
                points: 0,
            }).save();

            embed.setDescription(`**Successfully reset points for ${user.tag}**`);
            return interaction.editReply({ embeds: [embed] });
        }

        userProfile.points = 0;
        await userProfile.save();

        embed.setDescription(`**Successfully reset points for ${user.tag}**`);
        return interaction.editReply({ embeds: [embed] });
    }
};
