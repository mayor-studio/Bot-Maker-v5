const { ChatInputCommandInteraction, Client, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const autolineDB = new Database("/Json-db/Bots/autolineDB.json");
const isImage = require('is-image-header');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-autoline-line')
        .setDescription('Set the line (image URL)')
        .addStringOption(option => 
            option
                .setName('line')
                .setDescription('The line (image URL)')
                .setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const line = interaction.options.getString('line');

            // Validate if line is a valid image URL
            const isValidImage = await isImage(line);

            if (!isValidImage) {
                return interaction.editReply({ content: 'Please provide a valid image URL.' });
            }

            await autolineDB.set(`line_${interaction.guild.id}`, line);

            const embed = new EmbedBuilder()
                .setDescription('**Line has been set successfully**')
                .setColor('Green')
                .setImage(line)
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log("⛔ | Error in set-autoline-line command:", error);
            return interaction.editReply({ content: 'An error occurred while setting the line.' });
        }
    }
};
