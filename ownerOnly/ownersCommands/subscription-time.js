const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");
const tier2subscriptions = new Database("/database/makers/tier2/subscriptions");
const tier3subscriptions = new Database("/database/makers/tier3/subscriptions");
const { owner } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('subscription-time')
    .setDescription('Check remaining subscription time')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Subscription tier')
        .setRequired(true)
        .addChoices(
          { name: 'Prime', value: 'tier1' },
          { name: 'Premium', value: 'tier2' },
          { name: 'Ultimate', value: 'tier3' }
        ))
    .addStringOption(option =>
      option
        .setName('serverid')
        .setDescription('Server ID')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!owner.includes(interaction.user.id)) {
      return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: false });

    const type = interaction.options.getString('type');
    const serverid = interaction.options.getString('serverid');

    let subsDB;
    if (type === 'tier1') subsDB = tier1subscriptions;
    else if (type === 'tier2') subsDB = tier2subscriptions;
    else if (type === 'tier3') subsDB = tier3subscriptions;

    const subscriptions = subsDB.get(`${type}_subs`) || [];
    const serverSub = subscriptions.find(sub => sub.guildid === serverid);

    if (!serverSub) {
      return interaction.editReply({ content: "**Subscription not found for this server ID.**" });
    }

    const { timeleft } = serverSub;
    const daysLeft = Math.floor(timeleft / 60 / 60 / 24);

    const embed = new EmbedBuilder()
      .setTitle("**Subscription Time Remaining**")
      .setDescription(`Approximately \`${daysLeft}\` days left.`)
      .setColor("#A6D3CF")
      .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }
};
