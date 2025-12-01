const {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    PermissionsBitField
} = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Set or remove a nickname for a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to change nickname for')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('The new nickname (leave empty to remove)')
                .setRequired(false)),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            await interaction.deferReply({ fetchReply: true, ephemeral: false });

            const user = interaction.options.getUser('user');
            const member = interaction.options.getMember('user');
            const nickname = interaction.options.getString('nickname');

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
                return interaction.editReply({ content: '**You do not have permission to do this.**' });
            }

            if (!member) {
                return interaction.editReply({ content: '**Member not found.**' });
            }

            if (nickname) {
                await member.setNickname(nickname)
                    .then(() => {
                        interaction.editReply({
                            content: `✅ **Nickname for \`${user.username}\` has been set to \`${nickname}\`.**`
                        });
                    })
                    .catch(error => {
                        console.log(`🔴 | Error in nickname command`, error);
                        interaction.editReply({ content: '**Failed to set nickname. Check permissions.**' });
                    });
            } else {
                await member.setNickname(null)
                    .then(() => {
                        interaction.editReply({
                            content: `✅ **Nickname for \`${user.username}\` has been reset.**`
                        });
                    })
                    .catch(error => {
                        console.log(`🔴 | Error in nickname command`, error);
                        interaction.editReply({ content: '**Failed to reset nickname. Check permissions.**' });
                    });
            }

        } catch (error) {
            console.log(`🔴 | Error in nickname command`, error);
            interaction.editReply({ content: '**An error occurred. Please contact the developers.**' });
        }
    }
};
