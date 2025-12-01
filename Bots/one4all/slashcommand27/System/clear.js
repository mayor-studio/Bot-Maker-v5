const {
    Client,
    SlashCommandBuilder,
    PermissionsBitField
} = require("discord.js");
const { Database } = require("st.db");
const systemDB = new Database("/Json-db/Bots/systemDB.json");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete a number of messages')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('Number of messages to delete (max 100)')
                .setRequired(true)),
                
    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({
                    content: `❌ You do not have permission to do this.`,
                    ephemeral: true
                });
            }

            const number = interaction.options.getInteger('number');
            if (number > 100) {
                return interaction.reply({
                    content: `⚠️ You can't delete more than 100 messages at once.`,
                    ephemeral: true
                });
            }

            await interaction.reply({ content: `Deleting messages...`, ephemeral: true });

            await interaction.channel.messages.fetch({ limit: 100 }); // ensures cache is populated
            const deletedMessages = await interaction.channel.bulkDelete(number, true);

            await interaction.editReply({
                content: `✅ \`\`\`${deletedMessages.size} message(s) deleted.\`\`\``
            });

            setTimeout(() => {
                interaction.deleteReply();
            }, 1500);

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: `❌ An error occurred. Please contact the developers.`,
                ephemeral: true
            });
        }
    }
};
