const { ChatInputCommandInteraction, Client, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/taxDB");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-tax-line')
        .setDescription('Set the tax line image URL')
        .addStringOption(option =>
            option
                .setName('line')
                .setDescription('The image URL to use for the tax line')
                .setRequired(true)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const line = interaction.options.getString('line');
            await db.set(`tax_line_${interaction.guild.id}`, line);

            const embed = new EmbedBuilder()
                .setDescription(`✅ **Tax line has been set successfully.**`)
                .setColor('Green')
                .setImage(line)
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true })
                });

            return interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            return interaction.editReply({
                content: '❌ An error occurred while setting the tax line.',
                ephemeral: true
            });
        }
    }
};
