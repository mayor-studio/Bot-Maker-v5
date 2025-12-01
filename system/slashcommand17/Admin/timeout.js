const {
    Client,
    Collection,
    PermissionsBitField,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const { Database } = require("st.db");
const systemDB = new Database("/Json-db/Bots/systemDB.json");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Give a timeout to a user')
        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('time')
                .setDescription('Time in minutes')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({
                content: `❌ You don't have permission to use this command.`,
                ephemeral: true
            });
        }

        const member = interaction.options.getMember('member');
        let time = interaction.options.getInteger('time');
        const reason = interaction.options.getString('reason') ?? "No reason provided";

        if (!member.moderatable || !member.timeout) {
            return interaction.reply({
                content: `❌ I can't timeout this user. Please check my permissions and role position.`,
                ephemeral: true
            });
        }

        try {
            await member.timeout(time * 60 * 1000, reason);
            return interaction.reply({
                content: `✅ Successfully timed out **${member.user.tag}** for **${time} minutes**.\n📝 Reason: \`${reason}\``
            });
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: `❌ Failed to timeout the user. Make sure I have the proper permissions.`,
                ephemeral: true
            });
        }
    }
};
