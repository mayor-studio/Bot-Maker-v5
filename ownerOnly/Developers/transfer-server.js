const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");

const db = new Database("/database/settings");
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");
const tier2subscriptions = new Database("/database/makers/tier2/subscriptions");
const tier3subscriptions = new Database("/database/makers/tier3/subscriptions");
const tokens = new Database("/database/tokens");
const { clientId, owner } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer-server')
        .setDescription('Transfer a subscription to a new server ID')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Subscription type')
                .setRequired(true)
                .addChoices(
                    { name: 'Prime', value: 'tier1' },
                    { name: 'Premium', value: 'tier2' },
                    { name: 'Ultimate', value: 'tier3' }
                ))
        .addStringOption(option =>
            option
                .setName('oldserverid')
                .setDescription('Old server ID')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('newserverid')
                .setDescription('New server ID')
                .setRequired(true)),

    async execute(interaction) {
        if (!owner.includes(interaction.user.id)) return;

        const type = interaction.options.getString('type');
        const oldServerId = interaction.options.getString('oldserverid');
        const newServerId = interaction.options.getString('newserverid');

        let subsearch = [];
        if (type === 'tier1') {
            subsearch = tier1subscriptions.get(`${type}_subs`);
        } else if (type === 'tier2') {
            subsearch = tier2subscriptions.get(`${type}_subs`);
        } else if (type === 'tier3') {
            subsearch = tier3subscriptions.get(`${type}_subs`);
        }

        const serverEntry = subsearch.find(s => s.guildid === oldServerId);
        if (!serverEntry) {
            return interaction.reply({ content: `<:Warning:1401460074937057422> No subscription found for this server ID.` });
        }

        serverEntry.guildid = newServerId;

        if (type === 'tier1') {
            await tier1subscriptions.set(`${type}_subs`, subsearch);
        } else if (type === 'tier2') {
            await tier2subscriptions.set(`${type}_subs`, subsearch);
        } else if (type === 'tier3') {
            await tier3subscriptions.set(`${type}_subs`, subsearch);
        }

        const doneEmbed = new EmbedBuilder()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp(Date.now())
            .setColor('#A6D3CF')
            .setTitle('<:Verified:1401460125612507156> Server ID transferred successfully');

        return interaction.reply({ embeds: [doneEmbed] });
    }
};
