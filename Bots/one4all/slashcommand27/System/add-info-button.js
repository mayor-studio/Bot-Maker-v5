const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { Database } = require('st.db');
const { v4: uuidv4 } = require('uuid');
const buttonsDB = new Database("/Json-db/Bots/systemDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('add-info-button')
        .setDescription('Add a button to a specific message')
        .addStringOption(option =>
            option.setName('message-id')
                .setDescription('ID of the message to attach the button to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Button color')
                .setRequired(true)
                .addChoices(
                    { name: 'Blue', value: 'Primary' },
                    { name: 'Red', value: 'Danger' },
                    { name: 'Green', value: 'Success' },
                    { name: 'Gray', value: 'Secondary' },
                ))
        .addStringOption(option =>
            option.setName('label')
                .setDescription('Text on the button')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji for the button')
                .setRequired(false)),

    async execute(interaction) {
        const label = interaction.options.getString('label') || null;
        const messageId = interaction.options.getString('message-id');
        const color = interaction.options.getString('color');
        const emoji = interaction.options.getString('emoji') || null;
        const guildId = interaction.guild.id;
        const buttonId = uuidv4();

        if (!label && !emoji) {
            return await interaction.reply({
                content: 'You must provide either a label or an emoji for the button.',
                ephemeral: true,
            });
        }

        const button = new ButtonBuilder()
            .setCustomId(`info_${buttonId}`)
            .setStyle(ButtonStyle[color]);

        if (label) button.setLabel(label);
        if (emoji) button.setEmoji(emoji);

        try {
            const targetMessage = await interaction.channel.messages.fetch(messageId);
            if (!targetMessage) {
                return await interaction.reply({
                    content: 'You must run this command in the same channel as the target message.',
                    ephemeral: true,
                });
            }

            const newRow = new ActionRowBuilder();

            if (targetMessage.components.length > 0) {
                const existingRow = targetMessage.components[0];
                existingRow.components.forEach(existingButton => {
                    newRow.addComponents(existingButton);
                });
            }

            newRow.addComponents(button);

            await targetMessage.edit({ components: [newRow] });

            await interaction.reply({
                content: 'Please send the message you want to link to the button.',
                ephemeral: true,
            });

            const filter = (msg) => msg.author.id === interaction.user.id && !msg.author.bot;
            const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });

            const messageContent = collected.first().content;

            await buttonsDB.set(`${guildId}_${buttonId}`, messageContent);

            await interaction.followUp({
                content: 'Message has been saved and linked to the button successfully!',
                ephemeral: true,
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'An error occurred while processing your request.',
                ephemeral: true,
            });
        }
    }
};
