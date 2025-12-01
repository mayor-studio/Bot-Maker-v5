const {
  SlashCommandBuilder,
  Events,
  ActivityType,
  ModalBuilder,
  TextInputStyle,
  EmbedBuilder,
  PermissionsBitField,
  ButtonStyle,
  TextInputBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  MessageComponentCollector,
  Embed,
} = require("discord.js");
const { Database } = require("st.db");

const applyDB = new Database("/Json-db/Bots/applyDB.json");
const tokens = new Database("/tokens/tokens");
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");

module.exports = (client13) => {
  client13.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      // Handle Apply Button
      if (interaction.customId === "apply_button") {
        const settings = applyDB.get(`apply_settings_${interaction.guild.id}`);
        if (!settings) {
          return interaction.reply({
            content: `**Application settings are not configured.**`,
            ephemeral: true,
          });
        }

        const findApply = await applyDB.get(`apply_${interaction.guild.id}`);
        if (!findApply) {
          return interaction.reply({
            content: `**No active application is currently open.**`,
            ephemeral: true,
          });
        }

        if (interaction.member.roles.cache.has(findApply.roleid)) {
          return interaction.reply({
            content: `**You already have this role <@&${findApply.roleid}>.**`,
            ephemeral: true,
          });
        }

        const status = applyDB.get(`status_slogan_${interaction.guild.id}`);
        const slogan = applyDB.get(`apply_slogan_${interaction.guild.id}`) || "";

        if (status === "on" && !interaction.member.displayName.includes(slogan)) {
          return interaction.reply({
            content: `You must include the slogan **${slogan}** in your nickname first.`,
            ephemeral: true,
          });
        }

        const modal = new ModalBuilder()
          .setCustomId("modal_apply")
          .setTitle(`Apply for Role`);

        const ask_1 = new TextInputBuilder()
          .setCustomId("ask_1")
          .setLabel(findApply.ask1)
          .setStyle(TextInputStyle.Short);
        const ask_2 = new TextInputBuilder()
          .setCustomId("ask_2")
          .setLabel(findApply.ask2)
          .setStyle(TextInputStyle.Short);
        const ask_3 = new TextInputBuilder()
          .setCustomId("ask_3")
          .setLabel(findApply.ask3)
          .setStyle(TextInputStyle.Short);
        const ask_4 = new TextInputBuilder()
          .setCustomId("ask_4")
          .setLabel(findApply.ask4)
          .setStyle(TextInputStyle.Short);
        const ask_5 = new TextInputBuilder()
          .setCustomId("ask_5")
          .setLabel(findApply.ask5)
          .setStyle(TextInputStyle.Short);

        const ActionRow1 = new ActionRowBuilder().addComponents(ask_1);
        const ActionRow2 = new ActionRowBuilder().addComponents(ask_2);
        const ActionRow3 = new ActionRowBuilder().addComponents(ask_3);
        const ActionRow4 = new ActionRowBuilder().addComponents(ask_4);
        const ActionRow5 = new ActionRowBuilder().addComponents(ask_5);

        if (findApply.ask1) modal.addComponents(ActionRow1);
        if (findApply.ask2) modal.addComponents(ActionRow2);
        if (findApply.ask3) modal.addComponents(ActionRow3);
        if (findApply.ask4) modal.addComponents(ActionRow4);
        if (findApply.ask5) modal.addComponents(ActionRow5);

        await interaction.showModal(modal);
      }

      // Handle Reject With Reason Button
      if (interaction.customId === "apply_reject_with_reason") {
        const settings = applyDB.get(`apply_settings_${interaction.guild.id}`);
        const adminrole = settings.adminrole;

        if (!interaction.member.roles.cache.has(adminrole)) {
          return interaction.reply({
            content: `**You don't have permission to do this.**`,
            ephemeral: true,
          });
        }

        const modal = new ModalBuilder()
          .setCustomId("modal_reject_with_reason")
          .setTitle(`Reject With Reason`);

        const reason = new TextInputBuilder()
          .setCustomId("reason")
          .setLabel(`Reason`)
          .setStyle(TextInputStyle.Short);

        const ActionRow1 = new ActionRowBuilder().addComponents(reason);
        modal.addComponents(ActionRow1);

        await interaction.showModal(modal);
      }
    }
  });
};
