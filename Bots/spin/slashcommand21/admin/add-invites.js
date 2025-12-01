const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const invitesDB = new Database("/Json-db/Bots/invitesDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('add-invites')
        .setDescription('Add invites to a specific member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to give invites to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of invites to add')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        const member = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        const currentInvites = await invitesDB.get(`invites_${interaction.guild.id}_${member.id}`) || 0;
        await invitesDB.set(`invites_${interaction.guild.id}_${member.id}`, currentInvites + amount);

        const embed = new EmbedBuilder()
            .setTitle('✅ Invites Added')
            .setDescription(`${amount} invites have been added to ${member}`)
            .addFields(
                { name: 'Previous Count', value: `${currentInvites}` },
                { name: 'Current Count', value: `${currentInvites + amount}` }
            )
            .setColor('Green')
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
