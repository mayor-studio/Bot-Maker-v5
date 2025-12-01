const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show the bot\'s command categories'),
    
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTitle('📖 Bot Command List')
                .setDescription('**Please choose a category to view its commands**')
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor('DarkButNotBlack');

            const menu = new StringSelectMenuBuilder()
                .setCustomId('help_menu')
                .setPlaceholder('Select a command category')
                .addOptions([
                    {
                        label: 'General',
                        value: 'help_general',
                        description: 'General commands available to all users.',
                        emoji: '🌐',
                    },
                    {
                        label: 'Owner',
                        value: 'help_owner',
                        description: 'Commands only for the bot owner.',
                        emoji: '👑',
                    },
                ]);

            const row = new ActionRowBuilder().addComponents(menu);

            await interaction.editReply({
                embeds: [embed],
                components: [row]
            });

        } catch (error) {
            console.log("🔴 | Error in help command:", error);
        }
    }
};
