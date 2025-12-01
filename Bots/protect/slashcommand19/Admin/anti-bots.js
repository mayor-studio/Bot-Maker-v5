const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/protectDB.json");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('anti-bots')
        .setDescription('Configure the anti-bot protection system')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Enable or disable the protection')
                .setRequired(true)
                .addChoices(
                    { name: 'On', value: 'on' },
                    { name: 'Off', value: 'of' }
                )
        ),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        try {
            const status = interaction.options.getString('status');
            await db.set(`antibots_status_${interaction.guild.id}`, status);
            return interaction.editReply({
                content: `✅ **Anti-bot protection has been set to \`${status.toUpperCase()}\`.\nMake sure the bot's role is at the top of the role list.**`
            });
        } catch (err) {
            console.error(err);
            return interaction.editReply({
                content: '❌ **An error occurred while setting the anti-bot protection status.**'
            });
        }
    }
};
