const { ChatInputCommandInteraction, Client, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const feedbackDB = new Database("/Json-db/Bots/feedbackDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('feedback-line')
        .setDescription('Set the feedback line image')
        .addStringOption(option => 
            option
                .setName('line')
                .setDescription('The image URL of the line')
                .setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const line = interaction.options.getString('line');
            await feedbackDB.set(`line_${interaction.guild.id}`, line);
            
            const embed = new EmbedBuilder()
                .setDescription('✅ Feedback line image has been set.')
                .setColor('Green')
                .setImage(line)
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("⛔ Error in feedback-line command:", error);
            return interaction.editReply({
                content: '❌ An error occurred while setting the feedback line image.',
                ephemeral: true
            });
        }
    }
};
