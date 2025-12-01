const { ChatInputCommandInteraction , Client, PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Send a message in an embed')
        .addStringOption((option) =>
            option.setName('title')
                .setDescription('The title of the embed')
                .setRequired(true))
        .addAttachmentOption((option) =>
            option.setName('image')
                .setDescription('Optional image')
                .setRequired(false))
        .addChannelOption((option) =>
            option.setName('channel')
                .setDescription('Mention the channel to send to')
                .setRequired(false))
        .addStringOption((option) =>
            option.setName('color')
                .setDescription('Choose a color for the embed')
                .addChoices(
                    { name: 'Red', value: 'Red' },
                    { name: 'Blue', value: 'Blue' },
                    { name: 'Aqua', value: 'Aqua' },
                    { name: 'Green', value: 'Green' },
                    { name: 'Yellow', value: 'Yellow' },
                    { name: 'Black', value: 'Black' },
                    { name: 'Gold', value: 'Gold' },
                    { name: 'White', value: 'White' },
                    { name: 'Orange', value: 'Orange' },
                    { name: 'Grey', value: 'Grey' },
                    { name: 'No Color', value: 'DarkButNotBlack' },
                    { name: 'Random', value: 'Random' },
                )
                .setRequired(false)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
                return interaction.reply({ content: '**You do not have permission to do this.**', ephemeral: true });

            const title = interaction.options.getString('title');
            const imageOption = interaction.options.getAttachment('image');
            const color = interaction.options.getString('color') || 'Random';
            const image = imageOption ? imageOption.proxyURL : null;
            const channel = interaction.options.getChannel('channel') || interaction.channel;

            const embed = new EmbedBuilder().setColor(color);

            if (title) embed.setTitle(title);
            if (image) embed.setImage(image);

            await interaction.reply({ content: 'Please type the message you want to include in the embed.', ephemeral: true });

            const filter = (msg) => msg.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

            collector.on('collect', async (msg) => {
                embed.setDescription(msg.content);

                await msg.delete();
                await channel.send({ embeds: [embed] });

                return interaction.followUp({ content: '**Embed sent successfully.**', ephemeral: true });
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    interaction.followUp({ content: 'No message received. Operation cancelled.', ephemeral: true });
                }
            });
        } catch (error) {
            console.log(error);
            return interaction.reply({ content: 'An error occurred. Please contact the developers.', ephemeral: true });
        }
    }
};
