const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('delete-colors')
        .setDescription('Delete all color roles'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const colorRoles = interaction.guild.roles.cache.filter(role => role.name.startsWith('Color #'));
            
            for (const [id, role] of colorRoles) {
                await role.delete('Color roles system cleanup');
            }

            await interaction.editReply('✅ Successfully deleted all color roles.');
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ An error occurred while deleting the roles.');
        }
    }
};
