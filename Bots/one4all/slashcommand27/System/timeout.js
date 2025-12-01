const {
    Client,
    PermissionsBitField,
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { Database } = require("st.db");
const systemDB = new Database("/Json-db/Bots/systemDB.json");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member for a certain amount of time (in minutes)')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member to timeout')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Timeout duration (in minutes)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({
                content: `**You don't have permission to do that.**`,
                ephemeral: true
            });
        }

        const member = interaction.options.getMember('member');
        const time = interaction.options.getInteger('time');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        if (!member.moderatable || !member.timeout) {
            return interaction.reply({
                content: `**I can't timeout this member. Please check my permissions and role hierarchy.**`,
                ephemeral: true
            });
        }

        try {
            await member.timeout(time * 60 * 1000, reason);
            return interaction.reply({
                content: `✅ **${member.user.tag} has been timed out for ${time} minute(s).**\n**Reason:** ${reason}`
            });
        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: `❌ **Failed to timeout the member. Please check my permissions.**`,
                ephemeral: true
            });
        }
    }
};
