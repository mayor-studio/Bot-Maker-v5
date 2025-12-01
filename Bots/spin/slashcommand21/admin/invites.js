const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const invitesDB = new Database("/Json-db/Bots/invitesDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Show your invite count')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The member whose invites you want to check')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const invites = await invitesDB.get(`invites_${interaction.guild.id}_${targetUser.id}`) || 0;

        const embed = new EmbedBuilder()
            .setTitle('📊 Invite Info')
            .setDescription(`**User:** ${targetUser}\n**Invites:** ${invites}`)
            .setColor('Blue')
            .setTimestamp()
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        await interaction.reply({ embeds: [embed] });
    }
};
