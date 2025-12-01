const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/shopDB.json");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Set up the main configuration')
        .addUserOption(option => option
            .setName('recipient')
            .setDescription('Earnings recipient')
            .setRequired(true))
        .addUserOption(option => option
            .setName('probot')
            .setDescription('Probot user')
            .setRequired(true))
        .addRoleOption(option => option
            .setName('clientrole')
            .setDescription('Client role')
            .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const recipient = interaction.options.getUser('recipient');
        const probot = interaction.options.getUser('probot');
        const clientrole = interaction.options.getRole('clientrole');

        if (!recipient && !probot && !clientrole) {
            return interaction.editReply({ content: '**Please specify at least one setting.**' });
        }

        if (recipient) {
            await db.set(`recipient_${interaction.guild.id}`, recipient.id);
        }

        if (probot) {
            await db.set(`probot_${interaction.guild.id}`, probot.id);
        }

        if (clientrole) {
            await db.set(`clientrole_${interaction.guild.id}`, clientrole.id);
        }

        return interaction.editReply({ content: '**Selected settings have been saved successfully.**' });
    }
};
