const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock the current channel (disable sending messages for @everyone)'),
    
    async execute(interaction) {
        try {
            // Check permission
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply({ 
                    content: '**You do not have permission to do this.**', 
                    ephemeral: true 
                });
            }

            await interaction.deferReply({ ephemeral: false });

            await interaction.channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone,
                { SendMessages: false }
            );

            return interaction.editReply({ 
                content: `🔒 **${interaction.channel} has been locked.**` 
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
