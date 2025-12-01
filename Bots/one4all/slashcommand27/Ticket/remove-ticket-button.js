const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder } = require('discord.js');
const { Database } = require('st.db');
const db = new Database('/Json-db/Bots/ticketDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-ticket-button')
        .setDescription('Remove a button from the ticket panel')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('The ID of the message')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('button_label')
                .setDescription('The label of the button to remove')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ You must be an Administrator to use this command.', ephemeral: true });
        }

        try {
            const messageId = interaction.options.getString('message_id');
            const buttonLabel = interaction.options.getString('button_label');

            const message = await interaction.channel.messages.fetch(messageId);
            if (!message) {
                return interaction.reply({ content: '❌ Message not found.', ephemeral: true });
            }

            if (!message.components || message.components.length === 0) {
                return interaction.reply({ content: '❌ There are no buttons in this message.', ephemeral: true });
            }

            // Get existing buttons, excluding the one with the specified label
            const row = message.components[0];
            const remainingButtons = row.components.filter(btn => btn.label !== buttonLabel);

            if (remainingButtons.length === row.components.length) {
                return interaction.reply({ content: '❌ Specified button not found.', ephemeral: true });
            }

            // Update the message with the remaining buttons
            const newRow = new ActionRowBuilder().addComponents(remainingButtons);
            await message.edit({ components: [newRow] });

            // Delete ticket data linked to the removed button
            const allKeys = await db.all();
            for (const { key, value } of allKeys) {
                if (key.startsWith(`Ticket_${interaction.channel.id}_`) && value?.label === buttonLabel) {
                    await db.delete(key);
                }
            }

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully removed the button \`${buttonLabel}\`.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Remove button error:', error);
            await interaction.reply({
                content: '❌ An error occurred while removing the button.',
                ephemeral: true
            });
        }
    }
};
