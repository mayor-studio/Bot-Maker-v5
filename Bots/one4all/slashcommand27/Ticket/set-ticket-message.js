const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js'); 
const { Database } = require('st.db');
const db = new Database('/Json-db/Bots/ticketDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-ticket-message')
        .setDescription('Set the ticket message')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message shown when a ticket is opened')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('The category where tickets will be created')
                .addChannelTypes(4) // category type
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of the message')
                .setRequired(true)
                .addChoices(
                    { name: 'Embed', value: 'embed' },
                    { name: 'Message', value: 'message' }
                )
        ),

    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ You must be an administrator to use this command.', ephemeral: true });
        }

        const message = interaction.options.getString('message');
        const category = interaction.options.getChannel('category');
        const type = interaction.options.getString('type');

        try {
            await db.set(`TicketMessage_${interaction.guild.id}`, {
                message: message,
                category: category.id,
                type: type
            });

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('✅ Ticket message set successfully')
                .addFields(
                    { name: 'Message', value: message },
                    { name: 'Category', value: `<#${category.id}>` },
                    { name: 'Type', value: type === 'embed' ? 'Embed' : 'Message' }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: '❌ An error occurred while setting the ticket message.', 
                ephemeral: true 
            });
        }
    }
};
