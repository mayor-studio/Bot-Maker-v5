const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  MessageComponentCollector,
  ButtonStyle,
} = require("discord.js");
const { Database } = require("st.db");

const db = new Database("/database/settings");
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");
const tier2subscriptions = new Database("/database/makers/tier2/subscriptions");
const tier3subscriptions = new Database("/database/makers/tier3/subscriptions");
const tokens = new Database("/database/tokens");
const { clientId, owner } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("renew-subscription")
    .setDescription("Renew a server subscription")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Type of subscription")
        .setRequired(true)
        .addChoices(
          { name: "Prime", value: "tier1" },
          { name: "Premium", value: "tier2" },
          { name: "Ultimate", value: "tier3" }
        )
    )
    .addStringOption((option) =>
      option.setName("serverid").setDescription("Server ID").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("days")
        .setDescription("Number of days to add")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!owner.includes(interaction.user.id)) return;

    const type = interaction.options.getString("type");
    const serverid = interaction.options.getString("serverid");
    const days = interaction.options.getInteger("days");

    let subsearch = 0;
    if (type === "tier1") {
      subsearch = tier1subscriptions.get(`${type}_subs`);
    } else if (type === "tier2") {
      subsearch = tier2subscriptions.get(`${type}_subs`);
    } else if (type === "tier3") {
      subsearch = tier3subscriptions.get(`${type}_subs`);
    }

    const serversearch = subsearch.find((su) => su.guildid === serverid);
    if (!serversearch) {
      return interaction.reply({
        content: `**No subscription found with this server ID.**`,
      });
    }

    const daysInSeconds = days * 24 * 60 * 60;
    let { timeleft } = serversearch;
    timeleft += daysInSeconds;
    serversearch.timeleft = timeleft;

    if (type === "tier1") {
      await tier1subscriptions.set(`${type}_subs`, subsearch);
    } else if (type === "tier2") {
      await tier2subscriptions.set(`${type}_subs`, subsearch);
    } else if (type === "tier3") {
      await tier3subscriptions.set(`${type}_subs`, subsearch);
    }

    const doneembed = new EmbedBuilder()
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTimestamp(Date.now())
      .setColor("#A6D3CF") // Updated color
      .setTitle(`<:Verified:1401460125612507156> Subscription Renewed Successfully`)
      .setDescription(
        `📅 Remaining days: \`${Math.floor(timeleft / 60 / 60 / 24)}\``
      );

    return interaction.reply({ embeds: [doneembed] });
  },
};
