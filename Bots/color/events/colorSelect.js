const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isStringSelectMenu() || interaction.customId !== 'color_select') return;

        try {
            const selectedRole = await interaction.guild.roles.fetch(interaction.values[0]);
            if (!selectedRole) {
                return interaction.reply({ content: '❌ The selected color role was not found.', ephemeral: true });
            }

            const member = interaction.member;

            // Remove all existing color roles
            const currentColorRoles = member.roles.cache.filter(role => role.name.startsWith('Color #'));
            if (currentColorRoles.size > 0) {
                await member.roles.remove(currentColorRoles);
            }

            // Add new color role
            await member.roles.add(selectedRole);
            await interaction.reply({ content: `✅ Your color has been changed to ${selectedRole.name}.`, ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ An error occurred while changing your color.', ephemeral: true });
        }
    },
};
