const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Bot commands list'),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTitle('Bot Commands List')
                .setDescription('**Please select the category to view its commands**')
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor('DarkButNotBlack');

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('help_select')
                .setPlaceholder('Select a category')
                .addOptions([
                    {
                        label: 'General',
                        description: 'General bot commands',
                        value: 'help_general',
                        emoji: '🌐',
                    },
                    {
                        label: 'Owner',
                        description: 'Owner-only commands',
                        value: 'help_owner',
                        emoji: '👑',
                    },
                    // Add more options here if needed
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.editReply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error("🔴 | Error in help command:", error);
        }
    }
};
