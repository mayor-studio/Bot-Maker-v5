const { ChatInputCommandInteraction, Client, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const feedbackDB = new Database("/Json-db/Bots/feedbackDB.json");
const isImage = require('is-image-header');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-feedback-line')
        .setDescription('Set the line image URL')
        .addStringOption(option =>
            option
                .setName('line')
                .setDescription('The line image URL')
                .setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const line = interaction.options.getString('line');

            // Optional: Validate if the input is a valid image URL (you can also keep your isImage check here)
            if (!isImage(line)) {
                return interaction.editReply({ content: 'Please provide a valid image URL.' });
            }

            await feedbackDB.set(`line_${interaction.guild.id}`, line);

            const embed = new EmbedBuilder()
                .setDescription('**Line image has been set successfully!**')
                .setColor('Green')
                .setImage(line)
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("⛔ | Error in set-feedback-line command:", error);
            return interaction.editReply({ content: 'An error occurred while setting the line image.' });
        }
    }
};
