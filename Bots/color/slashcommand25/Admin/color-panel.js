const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('color-panel')
        .setDescription('Send the color selection panel')
        .addStringOption(option => 
            option
                .setName('image_url')
                .setDescription('Image URL for the color panel')
                .setRequired(true)),

    async execute(interaction) {
        const imageUrl = interaction.options.getString('image_url');
        const colorRoles = interaction.guild.roles.cache
            .filter(role => role.name.startsWith('Color #'))
            .sort((a, b) => {
                const numA = parseInt(a.name.split('#')[1]);
                const numB = parseInt(b.name.split('#')[1]);
                return numA - numB;
            });

        if (colorRoles.size === 0) {
            return interaction.reply({ content: '❌ No color roles found! Please create them first.', ephemeral: true });
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId('color_select')
            .setPlaceholder('Choose your favorite color')
            .addOptions(
                colorRoles.map(role => ({
                    label: `Color #${role.name.split('#')[1]}`,
                    value: role.id,
                    description: `Choose the color ${role.name}`,
                    emoji: '🎨'
                }))
            );

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.channel.send({
            content: null,
            files: [imageUrl],
            components: [row]
        });

        await interaction.reply({ content: '✅ Color panel has been sent.', ephemeral: true });
    }
};
