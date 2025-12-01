const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('create-colors')
        .setDescription('Create 15 colored roles'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        try {
            const colors = [
                '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff',
                '#00ffff', '#ff8000', '#8000ff', '#0080ff', '#ff0080',
                '#80ff00', '#00ff80', '#ff6666', '#6666ff', '#66ff66'
            ];

            for (let i = 0; i < colors.length; i++) {
                await interaction.guild.roles.create({
                    name: `Color #${i + 1}`,
                    color: colors[i],
                    reason: 'Color roles system'
                });
            }

            await interaction.editReply('✅ Successfully created color roles.');
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ An error occurred while creating the roles.');
        }
    }
};
