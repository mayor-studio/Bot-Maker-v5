const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const warnsDB = new Database("/Json-db/Bots/warnsDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Remove a specific warning from a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to remove the warning from')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('warn-number')
                .setDescription('The warning number to remove')
                .setRequired(true)),
    adminsOnly: true,

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const warnNumber = interaction.options.getNumber('warn-number');
        const guildId = interaction.guild.id;
        const userId = user.id;

        // Fetch user warnings or default to empty array
        let userWarns = await warnsDB.get(`warns_${guildId}_${userId}`) || [];
        
        if (userWarns.length === 0) {
            return interaction.reply({
                content: "❌ This user has no warnings.",
                ephemeral: true
            });
        }

        // Validate warnNumber input
        if (warnNumber < 1 || warnNumber > userWarns.length) {
            return interaction.reply({
                content: "❌ Invalid warning number.",
                ephemeral: true
            });
        }

        // Remove the specified warning (adjust for zero-based index)
        const removedWarn = userWarns.splice(warnNumber - 1, 1)[0];
        await warnsDB.set(`warns_${guildId}_${userId}`, userWarns);

        // Build success embed message
        const embed = new EmbedBuilder()
            .setTitle('Warning Removed')
            .setDescription(`Removed warning number ${warnNumber} from ${user.tag}`)
            .addFields(
                { name: 'Warning Reason', value: removedWarn.reason || 'No reason provided.' },
                { name: 'Remaining Warnings', value: `${userWarns.length}` }
            )
            .setColor('Green')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
