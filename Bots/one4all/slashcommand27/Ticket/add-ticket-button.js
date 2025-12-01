const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { Database } = require('st.db');
const db = new Database('/Json-db/Bots/ticketDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-ticket-button')
        .setDescription('Add a ticket button')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('Message ID')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('button_name')
                .setDescription('Button label')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('button_color')
                .setDescription('Button color')
                .setRequired(true)
                .addChoices(
                    { name: 'Red', value: 'red' },
                    { name: 'Green', value: 'green' },
                    { name: 'Blue', value: 'blue' },
                    { name: 'Gray', value: 'secondary' }
                )
        )
        .addRoleOption(option =>
            option.setName('support_role')
                .setDescription('Support role')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('Category')
                .addChannelTypes(4)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('welcome-type')
                .setDescription('Welcome message type')
                .setRequired(true)
                .addChoices(
                    { name: 'Embed', value: 'embed' },
                    { name: 'Message', value: 'message' }
                )
        )
        .addStringOption(option =>
            option.setName('button_emoji')
                .setDescription('Button emoji')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('ask')
                .setDescription('Enable or disable the question')
                .setRequired(false)
                .addChoices(
                    { name: 'On', value: 'on' },
                    { name: 'Off', value: 'off' }
                )
        ),

    /**
     * @param {import('discord.js').ChatInputCommandInteraction} interaction 
     * @param {import('discord.js').Client} client 
     */
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ You need Administrator permission to use this command.', ephemeral: true });
        }

        const messageId = interaction.options.getString('message_id');
        const buttonName = interaction.options.getString('button_name');
        const buttonEmoji = interaction.options.getString('button_emoji') || null;
        const buttonColor = interaction.options.getString('button_color');
        const supportRole = interaction.options.getRole('support_role');
        const category = interaction.options.getChannel('category');
        const messageType = interaction.options.getString('welcome-type');
        const askOption = interaction.options.getString('ask'); // new option

        try {
            const message = await interaction.channel.messages.fetch(messageId);
            if (!message) {
                return interaction.reply({ content: 'Please run the command in the same channel as the message.', ephemeral: true });
            }

            const currentComponents = message.components || [];

            const randomId = `ticket_${Math.random().toString(36).substr(2, 9)}`;

            const newButton = new ButtonBuilder()
                .setCustomId(randomId)
                .setLabel(buttonName);

            if (buttonEmoji) newButton.setEmoji(buttonEmoji); 

            switch (buttonColor) {
                case 'red':
                    newButton.setStyle(ButtonStyle.Danger);
                    break;
                case 'green':
                    newButton.setStyle(ButtonStyle.Success);
                    break;
                case 'blue':
                    newButton.setStyle(ButtonStyle.Primary);
                    break;
                default:
                    newButton.setStyle(ButtonStyle.Secondary);
            }

            const newRow = new ActionRowBuilder().addComponents([
                ...(currentComponents[0]?.components || []),
                newButton,
            ]);

            await message.edit({ components: [newRow] });

            const ticketData = {
                Support: supportRole.id,
                Category: category.id,
                Type: messageType,
                Ask: askOption // add 'ask' value to ticket data
            };

            await db.set(`Ticket_${interaction.channel.id}_${randomId}`, ticketData);

            await interaction.reply({ content: 'Please send the welcome message for the ticket:', ephemeral: true });
            const internalTicketCollector = interaction.channel.createMessageCollector({
                filter: m => m.author.id === interaction.user.id,
                max: 1,
                time: 60000
            });

            internalTicketCollector.on('collect', async internalTicket => {
                ticketData.Internal = internalTicket.content;
                await db.set(`Ticket_${interaction.channel.id}_${randomId}`, ticketData);

                interaction.followUp({ content: '✅ Button added successfully.', ephemeral: true });
            });

            internalTicketCollector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.followUp({ content: '❌ Time expired, please try again.', ephemeral: true });
                }
            });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: '❌ An error occurred while trying to add the button.', ephemeral: true });
        }
    },
};
