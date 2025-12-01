const {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const DB = require("../../../../database/settings");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send a direct message to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to send the message to')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message content')
                .setRequired(true)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            await interaction.deferReply({ ephemeral: false });

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.editReply({ content: `**You don't have permission to do that.**` });
            }

            const user = interaction.options.getUser('user');
            const message = interaction.options.getString('message');

            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('📩 New Message')
                        .setDescription(`\`\`\`${message}\`\`\``)
                        .setFooter({
                            text: `Sent by: ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                        })
                ],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('disabled_info')
                            .setLabel(`${interaction.guild.name}`)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    )
                ]
            });

            await interaction.editReply({ content: `**Message has been sent to the user.**` });
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: `**Unable to send the message to the user.**` });
        }
    }
};
