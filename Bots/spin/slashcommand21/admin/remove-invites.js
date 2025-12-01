const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const invitesDB = new Database("/Json-db/Bots/invitesDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-invites')
        .setDescription('Remove invites from a specific member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to remove invites from')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of invites to remove')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        const member = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const currentInvites = await invitesDB.get(`invites_${interaction.guild.id}_${member.id}`) || 0;

        if (currentInvites < amount) {
            return interaction.reply({ 
                content: `❌ The member only has ${currentInvites} invites, cannot remove ${amount}`, 
                ephemeral: true 
            });
        }

        await invitesDB.set(`invites_${interaction.guild.id}_${member.id}`, currentInvites - amount);

        const embed = new EmbedBuilder()
            .setTitle('✅ Invites Removed')
            .setDescription(`${amount} invites have been removed from ${member}`)
            .addFields(
                { name: 'Previous Count', value: `${currentInvites}`, inline: true },
                { name: 'Current Count', value: `${currentInvites - amount}`, inline: true }
            )
            .setColor('Red')
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
