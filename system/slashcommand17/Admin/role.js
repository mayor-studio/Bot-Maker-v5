const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Give or remove a role from a member')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Select the member')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Select the role')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('give_or_remove')
                .setDescription('Choose whether to give or remove the role')
                .setRequired(true)
                .addChoices(
                    { name: 'Give', value: 'Give' },
                    { name: 'Remove', value: 'Remove' }
                )),
    
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: '**❌ You do not have permission to do this.**', ephemeral: true });
        }

        const member = interaction.options.getMember('member');
        const role = interaction.options.getRole('role');
        const action = interaction.options.getString('give_or_remove');

        if (!member || !role) {
            return interaction.reply({ content: '❌ Error retrieving the member or role.', ephemeral: true });
        }

        // Prevent bot from managing roles higher or equal to its own
        const botMember = interaction.guild.members.me;
        if (role.position >= botMember.roles.highest.position) {
            return interaction.reply({ content: '❌ I cannot manage that role because it is higher than or equal to my highest role.', ephemeral: true });
        }

        // Prevent users from managing roles higher or equal to their own
        if (role.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({ content: '❌ You cannot manage a role that is higher than your own.', ephemeral: true });
        }

        try {
            if (action === 'Give') {
                await member.roles.add(role);
                return interaction.reply({ content: `✅ Successfully **gave** the role **${role.name}** to **${member.user.tag}**.` });
            } else if (action === 'Remove') {
                if (!member.roles.cache.has(role.id)) {
                    return interaction.reply({ content: '⚠️ This member does not have that role.', ephemeral: true });
                }

                await member.roles.remove(role);
                return interaction.reply({ content: `✅ Successfully **removed** the role **${role.name}** from **${member.user.tag}**.` });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ An error occurred while modifying roles. Please check permissions and try again.', ephemeral: true });
        }
    }
};
