const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('hide')
        .setDescription('Hide the current channel from everyone'),
    
    async execute(interaction) {
        // Check permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({
                content: '**You do not have permission to do this.**',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: false });

        try {
            // Hide the channel from @everyone
            await interaction.channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone,
                { ViewChannel: false }
            );

            await interaction.editReply({
                content: `🔒 **${interaction.channel} has been hidden from @everyone.**`
            });
        } catch (error) {
            console.error(error);
            return interaction.editReply({
                content: '❌ An error occurred while trying to hide the channel.'
            });
        }
    }
};
