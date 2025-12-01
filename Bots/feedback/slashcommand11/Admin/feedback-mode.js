const { SlashCommandBuilder } = require('@discordjs/builders');
const { Database } = require('st.db');
const feedbackDB = new Database("/Json-db/Bots/feedbackDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('feedback-mode')
        .setDescription('Choose between embed or auto-reaction feedback mode')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Select between embed or auto reaction')
                .setRequired(true)
                .addChoices(
                    { name: 'Embed', value: 'embed' },
                    { name: 'Auto Reaction Only', value: 'reactions' },
                ))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji to use for auto reactions (optional)')
                .setRequired(false)),
                
    async execute(interaction) {
        const mode = interaction.options.getString('mode');
        const emoji = interaction.options.getString('emoji') || '❤'; 

        await feedbackDB.set(`feedback_mode_${interaction.guild.id}`, mode);
        await feedbackDB.set(`feedback_emoji_${interaction.guild.id}`, emoji);

        await interaction.reply({ content: `✅ Feedback mode has been set to **${mode}**.`, ephemeral: true });
    },
};
