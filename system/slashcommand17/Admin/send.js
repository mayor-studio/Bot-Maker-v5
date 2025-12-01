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
            option
                .setName('user')
                .setDescription('The user to send the message to')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message to send')
                .setRequired(true)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            await interaction.deferReply({ fetchReply: true, ephemeral: false });

            const user = interaction.options.getUser('user');
            const message = interaction.options.getString('message');

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.editReply({
                    content: `❌ You do not have permission to use this command.`
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('📩 New Message')
                .setDescription(`\`\`\`${message}\`\`\``)
                .setFooter({
                    text: `Sent by: ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('server-info')
                    .setLabel(`${interaction.guild.name}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );

            await user.send({
                embeds: [embed],
                components: [row]
            });

            await interaction.editReply({
                content: `✅ Message sent to ${user.tag}.`
            });
        } catch {
            return interaction.editReply({
                content: `❌ I couldn't send the message to the user. They may have DMs disabled.`
            });
        }
    }
};
