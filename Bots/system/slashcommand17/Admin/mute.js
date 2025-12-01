const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Give or remove a mute role from a member')
        .addUserOption(option => 
            option.setName('member')
                .setDescription('The member to mute/unmute')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('give_or_remove')
                .setDescription('Mute or unmute the member')
                .setRequired(true)
                .addChoices(
                    { name: 'Give', value: 'Give' },
                    { name: 'Remove', value: 'Remove' }
                )),

    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return interaction.reply({ 
                    content: '**You do not have permission to do this.**', 
                    ephemeral: true 
                });
            }

            const member = interaction.options.getMember('member');
            let role = interaction.guild.roles.cache.find(r => r.name === 'Muted');

            // Create Muted role if it doesn't exist
            if (!role) {
                role = await interaction.guild.roles.create({
                    name: 'Muted',
                    permissions: []
                });

                // Deny sending messages in all text channels
                interaction.guild.channels.cache
                    .filter(c => c.isTextBased())
                    .forEach(channel => {
                        channel.permissionOverwrites.edit(role, {
                            SendMessages: false
                        });
                    });
            }

            const action = interaction.options.getString('give_or_remove');

            if (action === 'Give') {
                await member.roles.add(role).catch(() => {
                    return interaction.reply({
                        content: '**Please check my permissions and try again.**',
                        ephemeral: true
                    });
                });
                return interaction.reply({
                    content: `🔇 **${member.user.tag} has been muted successfully.**`
                });
            }

            if (action === 'Remove') {
                if (!member.roles.cache.has(role.id)) {
                    return interaction.reply({
                        content: '**This member is not muted.**',
                        ephemeral: true
                    });
                }

                await member.roles.remove(role).catch(() => {
                    return interaction.reply({
                        content: '**Please check my permissions and try again.**',
                        ephemeral: true
                    });
                });
                return interaction.reply({
                    content: `🔊 **${member.user.tag} has been unmuted successfully.**`
                });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: '❌ An error occurred. Please contact the developers.',
                ephemeral: true
            });
        }
    }
};
