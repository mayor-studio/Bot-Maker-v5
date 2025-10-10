const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
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
    .setName("transfer-owner")
    .setDescription("Transfer a server subscription to a new owner")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Subscription type")
        .setRequired(true)
        .addChoices(
          { name: "Prime", value: "tier1" },
          { name: "Premium", value: "tier2" },
          { name: "Ultimate", value: "tier3" }
        )
    )
    .addStringOption((option) =>
      option.setName("oldownerid").setDescription("Old owner ID").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("newownerid").setDescription("New owner ID").setRequired(true)
    ),

  async execute(interaction) {
    if (!owner.includes(interaction.user.id)) return;

    const type = interaction.options.getString("type");
    const oldownerid = interaction.options.getString("oldownerid");
    const newownerid = interaction.options.getString("newownerid");

    let subsearch = [];
    let serversearch = null;

    if (type === "tier1") {
      subsearch = tier1subscriptions.get(`${type}_subs`);
      serversearch = subsearch.find((su) => su.ownerid === oldownerid);
    } else if (type === "tier2") {
      subsearch = tier2subscriptions.get(`${type}_subs`);
      serversearch = subsearch.find((su) => su.ownerid === oldownerid);
    } else if (type === "tier3") {
      subsearch = tier3subscriptions.get(`${type}_subs`);
      serversearch = subsearch.find((su) => su.ownerid === oldownerid);
    }

    if (!serversearch) {
      return interaction.reply({
        content: `**No subscription found with this owner ID.**`,
      });
    }

    serversearch.ownerid = newownerid;

    if (type === "tier1") {
      await tier1subscriptions.set(`${type}_subs`, subsearch);
    } else if (type === "tier2") {
      await tier2subscriptions.set(`${type}_subs`, subsearch);
    } else if (type === "tier3") {
      await tier3subscriptions.set(`${type}_subs`, subsearch);
    }

    const doneEmbed = new EmbedBuilder()
      .setColor("#A6D3CF")
      .setTitle("<:Verified:1401460125612507156> Owner Transferred Successfully")
      .setDescription(
        `Server ID: \`${serversearch.guildid || "Unknown"}\`\nNew Owner ID: \`${newownerid}\``
      )
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTimestamp();

    return interaction.reply({ embeds: [doneEmbed] });
  },
};
