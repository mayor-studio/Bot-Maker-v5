const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { Database } = require('st.db');
const db = new Database('/Json-db/Bots/ticketDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-ticket-message')
        .setDescription('Delete the ticket message from a specific category')
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('The category to delete the ticket message from')
                .addChannelTypes(4) // category type
                .setRequired(true)
        ),

    async execute(interaction) {
        // Check for admin permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ You must be an administrator to use this command.', ephemeral: true });
        }

        const category = interaction.options.getChannel('category');

        try {
            const ticketSettings = await db.get(`TicketMessage_${interaction.guild.id}`);
            
            if (!ticketSettings) {
                return interaction.reply({ 
                    content: '❌ There is no ticket message set for this server.', 
                    ephemeral: true 
                });
            }

            if (ticketSettings.category !== category.id) {
                return interaction.reply({ 
                    content: '❌ There is no ticket message set for this category.', 
                    ephemeral: true 
                });
            }

            await db.delete(`TicketMessage_${interaction.guild.id}`);

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('✅ Ticket message deleted')
                .setDescription(`The ticket message has been deleted from the category ${category}.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Delete ticket message error:', error);
            await interaction.reply({ 
                content: '❌ An error occurred while deleting the ticket message.', 
                ephemeral: true 
            });
        }
    }
};
