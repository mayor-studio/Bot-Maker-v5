const { ChatInputCommandInteraction, Client, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const offersDB = new Database("/Json-db/Bots/offersDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-line')
        .setDescription('Set the offer line image URL')
        .addStringOption(option => 
            option
                .setName('line')
                .setDescription('Image URL for the line')
                .setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const line = interaction.options.getString('line');

            await offersDB.set(`line_${interaction.guild.id}`, line);

            const embed = new EmbedBuilder()
                .setDescription('✅ Line image has been set.')
                .setColor('Green')
                .setImage(line)
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log("⛔ | Error in /set-line command:", error);
            return interaction.editReply({ content: "❌ An error occurred while setting the line." });
        }
    }
};
