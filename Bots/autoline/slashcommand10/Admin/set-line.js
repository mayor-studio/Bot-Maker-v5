const { ChatInputCommandInteraction, Client, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const autolineDB = new Database("/Json-db/Bots/autolineDB.json");
const isImage = require('is-image-header');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-line')
        .setDescription('Set the auto-line content')
        .addStringOption(option => 
            option
                .setName('line')
                .setDescription('The image URL or line text')
                .setRequired(true)),

    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        try {
            if (!interaction.member) {
                return await interaction.reply({ 
                    content: '⚠️ Could not fetch member information. Please try again.', 
                    ephemeral: true 
                });
            }

            await interaction.deferReply();
            const line = interaction.options.getString('line');
            await autolineDB.set(`line_${interaction.guild.id}`, line);
            
            const embed = new EmbedBuilder()
                .setDescription('✅ Line content has been set successfully.')
                .setColor('Green')
                .setImage(line)
                .setTimestamp()
                .setFooter({ 
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL() 
                });

            return await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("⛔ | Error in set-line command:", error);
            await interaction.editReply({ 
                content: '❌ An error occurred while executing the command.', 
                ephemeral: true 
            }).catch(() => {});
        }
    }
};
