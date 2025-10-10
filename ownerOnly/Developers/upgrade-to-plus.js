const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");

const tier3subscriptions = new Database("/database/makers/tier3/subscriptions");
const tier3subscriptionsplus = new Database("/database/makers/tier3/plus");
const { owner } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upgrade-to-plus')
        .setDescription('Upgrade a server to Ultimate Plus')
        .addStringOption(option =>
            option.setName('serverid')
                .setDescription('The server ID')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('days')
                .setDescription('Number of days to add')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!owner.includes(interaction.user.id)) return;

        const serverid = interaction.options.getString('serverid');
        const days = interaction.options.getInteger('days');
        const secondsToAdd = days * 24 * 60 * 60;

        let subs = tier3subscriptions.get('tier3_subs');
        const serverSub = subs.find(s => s.guildid === serverid);
        if (!serverSub) {
            return interaction.reply({
                content: `<:Warning:1401460074937057422> No subscription found for server ID \`${serverid}\`.`
            });
        }

        let plusSubs = tier3subscriptionsplus.get('plus') || [];

        let serverPlus = plusSubs.find(p => p.guildid === serverid);
        if (!serverPlus) {
            plusSubs.push({ guildid: serverid, timeleft: secondsToAdd });
        } else {
            serverPlus.timeleft += secondsToAdd;
        }

        await tier3subscriptionsplus.set('plus', plusSubs);

        const updatedPlus = tier3subscriptionsplus.get('plus');
        const updatedServer = updatedPlus.find(p => p.guildid === serverid);
        const remainingDays = (updatedServer.timeleft / 60 / 60 / 24).toFixed(1);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setFooter({
                text: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp()
            .setColor('#A6D3CF')
            .setTitle('<:Verified:1401460125612507156> Upgrade to Ultimate Plus Successful')
            .setDescription(`🕒 Remaining time: \`${remainingDays}\` days`);

        return interaction.reply({ embeds: [embed] });
    }
};
