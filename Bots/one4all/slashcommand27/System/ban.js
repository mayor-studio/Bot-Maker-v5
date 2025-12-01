const {
    ChatInputCommandInteraction,
    Client,
    PermissionsBitField,
    SlashCommandBuilder
} = require("discord.js");
const { Database } = require("st.db");
const systemDB = new Database("/Json-db/Bots/systemDB.json");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('User to ban/unban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return interaction.reply({ content: `❌ You do not have permission to do this.`, ephemeral: true });
            }

            const user = interaction.options.getUser('member');
            const member = interaction.options.getMember('member');
            const reason = interaction.options.getString('reason') 
                ? `${interaction.options.getString('reason')} | Banned by: ${interaction.user.tag}` 
                : `Banned by: ${interaction.user.tag}`;

            const banList = await interaction.guild.bans.fetch();
            const bannedUser = banList.get(user.id);

            if (!bannedUser) {
                if (!member) return interaction.reply({ content: `⚠️ Member not found in the server.`, ephemeral: true });

                await member.ban({ reason }).catch(async () => {
                    return interaction.reply({ content: `❌ Failed to ban. Please check my permissions.`, ephemeral: true });
                });

                return interaction.reply({ content: `✅ Successfully banned ${user.tag}.` });
            } else {
                await interaction.guild.members.unban(user.id).catch(async () => {
                    return interaction.reply({ content: `❌ Failed to unban. Please check my permissions.`, ephemeral: true });
                });

                return interaction.reply({ content: `✅ Successfully unbanned ${user.tag}.` });
            }

        } catch (error) {
            console.log(error);
            return interaction.reply({
                content: `❌ An unexpected error occurred. Please contact the developers.`,
                ephemeral: true
            });
        }
    }
};
