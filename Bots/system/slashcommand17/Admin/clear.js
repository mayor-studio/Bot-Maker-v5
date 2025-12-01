const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete a number of messages from the channel')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The number of messages to delete (max 100)')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            // Permission check
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({
                    content: '❌ You do not have permission to manage messages.',
                    ephemeral: true
                });
            }

            const number = interaction.options.getInteger('number');

            if (number < 1 || number > 100) {
                return interaction.reply({
                    content: '❌ Please provide a number between 1 and 100.',
                    ephemeral: true
                });
            }

            await interaction.reply({
                content: '⏳ Deleting messages...',
                ephemeral: true
            });

            const messages = await interaction.channel.bulkDelete(number, true);

            await interaction.editReply({
                content: `✅ Successfully deleted \`${messages.size}\` message(s).`
            });

            setTimeout(() => {
                interaction.deleteReply().catch(() => {}); // Fail silently if already deleted
            }, 2000);

        } catch (error) {
            console.error('❌ Error in /clear command:', error);
            return interaction.reply({
                content: '❌ An error occurred while deleting messages. Please try again or contact the developer.',
                ephemeral: true
            });
        }
    }
};
