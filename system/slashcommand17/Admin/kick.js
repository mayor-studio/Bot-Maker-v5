const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option => 
            option.setName('member')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)),
    
    async execute(interaction) {
        try {
            // Check if user has permission to kick
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return interaction.reply({
                    content: '**You do not have permission to do this.**',
                    ephemeral: true
                });
            }

            const member = interaction.options.getMember('member');
            const reasonInput = interaction.options.getString('reason');
            const reason = reasonInput ? `${reasonInput} | By: ${interaction.user.tag}` : `By: ${interaction.user.tag}`;

            // Check if member is kickable
            if (!member.kickable) {
                return interaction.reply({
                    content: '**I cannot kick this member. Please check my permissions or role hierarchy.**',
                    ephemeral: true
                });
            }

            await member.kick(reason);
            return interaction.reply({
                content: `✅ **${member.user.tag} has been kicked successfully.**`
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: '❌ An error occurred. Please contact the developers.',
                ephemeral: true
            });
        }
    }
};
