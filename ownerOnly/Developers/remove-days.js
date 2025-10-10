const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const { Database } = require("st.db");

const db = new Database("/database/settings");
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");
const tier2subscriptions = new Database("/database/makers/tier2/subscriptions");
const tier3subscriptions = new Database("/database/makers/tier3/subscriptions");
const tokens = new Database("/database/tokens");

const { clientId, owner } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-days')
    .setDescription('Remove days from a subscription')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Subscription type')
        .setRequired(true)
        .addChoices(
          { name: 'Prime', value: 'tier1' },
          { name: 'Premium', value: 'tier2' },
          { name: 'Ultimate', value: 'tier3' }
        )
    )
    .addStringOption(option =>
      option
        .setName('serverid')
        .setDescription('Server ID')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('days')
        .setDescription('Number of days to remove')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!owner.includes(interaction.user.id)) return;

    const type = interaction.options.getString('type');
    const serverid = interaction.options.getString('serverid');
    const days = interaction.options.getInteger('days');

    let subsearch = 0;

    if (type === 'tier1') {
      subsearch = tier1subscriptions.get(`${type}_subs`);
    } else if (type === 'tier2') {
      subsearch = tier2subscriptions.get(`${type}_subs`);
    } else if (type === 'tier3') {
      subsearch = tier3subscriptions.get(`${type}_subs`);
    }

    const serversearch = subsearch.find(su => su.guildid === serverid);

    if (!serversearch) {
      return interaction.reply({
        content: `**<:Warning:1401460074937057422> No subscription found with this server ID.**`,
        ephemeral: true
      });
    }

    const daysInSeconds = days * 24 * 60 * 60;
    serversearch.timeleft -= daysInSeconds;

    if (type === 'tier1') {
      await tier1subscriptions.set(`${type}_subs`, subsearch);
    } else if (type === 'tier2') {
      await tier2subscriptions.set(`${type}_subs`, subsearch);
    } else if (type === 'tier3') {
      await tier3subscriptions.set(`${type}_subs`, subsearch);
    }

    const remainingDays = Math.floor(serversearch.timeleft / 60 / 60 / 24);

    const doneEmbed = new EmbedBuilder()
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setTimestamp()
      .setColor('#A6D3CF')
      .setTitle(`<:Verified:1401460125612507156> Subscription time updated successfully`)
      .setDescription(`**Remaining days: \`${remainingDays}\`**`);

    return interaction.reply({ embeds: [doneEmbed] });
  }
};
