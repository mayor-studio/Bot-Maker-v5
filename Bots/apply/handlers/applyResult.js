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
    if (interaction.isButton() && interaction.customId === "apply_accept") {
      const settings = applyDB.get(`apply_settings_${interaction.guild.id}`);
      const applyroom = settings.applyroom;
      const appliesroom = settings.appliesroom;
      const resultsroom = settings.resultsroom;
      const adminrole = settings.adminrole;

      if (!interaction.member.roles.cache.has(adminrole))
        return interaction.reply({
          content: `**You do not have permission to do this.**`,
          ephemeral: true,
        });

      const receivedEmbed = interaction.message.embeds[0];
      const exampleEmbed = EmbedBuilder.from(receivedEmbed);
      const userId = exampleEmbed.data.title;
      const user2 = interaction.guild.members.cache.get(userId);
      const findApply = await applyDB.get(`apply_${interaction.guild.id}`);

      let roleid = findApply.roleid;
      const therole = interaction.guild.roles.cache.get(roleid);

      await user2.roles.add(therole).then(async () => {
        if (applyDB.get(`dm_${interaction.guild.id}`) === true) {
          const dm_embed = new EmbedBuilder()
            .setAuthor({
              name: interaction.guild.name,
              iconURL: interaction.guild.iconURL({ dynamic: true }),
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setTitle("Your application has been accepted 🎊")
            .setDescription(`**> Admin: ${interaction.user}**`)
            .setColor("Green");
          user2.send({ embeds: [dm_embed] }).catch(() => {});
        }

        const resultsChannel = interaction.guild.channels.cache.get(resultsroom);
        const embed = new EmbedBuilder()
          .setTimestamp()
          .setColor("Green")
          .setTitle("**Application Accepted**")
          .setAuthor({
            name: interaction.guild.name,
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          })
          .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
          .setDescription(
            `**Applicant: ${user2}\nAdmin: ${interaction.user}**`
          );

        resultsChannel.send({ content: `${user2}`, embeds: [embed] });

        const acceptButton = new ButtonBuilder()
          .setCustomId("apply_accept")
          .setLabel("Accept")
          .setEmoji("☑️")
          .setStyle(ButtonStyle.Success)
          .setDisabled(true);

        const rejectButton = new ButtonBuilder()
          .setCustomId("apply_reject")
          .setLabel("Reject")
          .setEmoji("✖️")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true);

        const rejectWithReasonButton = new ButtonBuilder()
          .setCustomId("apply_reject_with_reason")
          .setLabel("Reject with Reason")
          .setEmoji("💡")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true);

        const row = new ActionRowBuilder().addComponents(
          acceptButton,
          rejectButton,
          rejectWithReasonButton
        );

        interaction.reply({ content: "**Application accepted successfully.**" });
        interaction.message.edit({ components: [row] });
      }).catch((err) => {
        return interaction.reply({
          content: `Sorry, please make sure the bot's role is higher than the role to assign.`,
          ephemeral: true,
        });
      });
    }

    if (interaction.customId === "modal_reject_with_reason") {
      const settings = applyDB.get(`apply_settings_${interaction.guild.id}`);
      const applyroom = settings.applyroom;
      const appliesroom = settings.appliesroom;
      const resultsroom = settings.resultsroom;
      const adminrole = settings.adminrole;

      if (!interaction.member.roles.cache.has(adminrole))
        return interaction.reply({
          content: `**You do not have permission to do this.**`,
          ephemeral: true,
        });

      const reason = interaction.fields.getTextInputValue("reason");
      const receivedEmbed = interaction.message.embeds[0];
      const exampleEmbed = EmbedBuilder.from(receivedEmbed);
      const userId = exampleEmbed.data.title;
      const user2 = interaction.guild.members.cache.get(userId);
      const resultsChannel = interaction.guild.channels.cache.get(resultsroom);

      const embed = new EmbedBuilder()
        .setTimestamp()
        .setColor("Red")
        .setTitle("**Application Rejected**")
        .setDescription(
          `**Applicant: ${user2}\nAdmin: ${interaction.user}\n\nReason: \`${reason}\`**`
        )
        .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));

      await resultsChannel.send({ embeds: [embed] });

      if (applyDB.get(`dm_${interaction.guild.id}`) === true) {
        const dm_embed = new EmbedBuilder()
          .setAuthor({
            name: interaction.guild.name,
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          })
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setTitle("Your application has been rejected 😥")
          .setDescription(
            `**> Admin: ${interaction.user}\n> Reason: ${reason}**`
          )
          .setColor("Red");

        await user2.send({ embeds: [dm_embed] }).catch(() => {});
      }

      const acceptButton = new ButtonBuilder()
        .setCustomId("apply_accept")
        .setLabel("Accept")
        .setEmoji("☑️")
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

      const rejectButton = new ButtonBuilder()
        .setCustomId("apply_reject")
        .setLabel("Reject")
        .setEmoji("✖️")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);

      const rejectWithReasonButton = new ButtonBuilder()
        .setCustomId("apply_reject_with_reason")
        .setLabel("Reject with Reason")
        .setEmoji("💡")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);

      const row = new ActionRowBuilder().addComponents(
        acceptButton,
        rejectButton,
        rejectWithReasonButton
      );

      interaction.reply({ content: "**Application rejected successfully.**" });
      interaction.message.edit({ components: [row] });
    }

    if (interaction.isButton() && interaction.customId === "apply_reject") {
      const settings = applyDB.get(`apply_settings_${interaction.guild.id}`);
      const applyroom = settings.applyroom;
      const appliesroom = settings.appliesroom;
      const resultsroom = settings.resultsroom;
      const adminrole = settings.adminrole;

      if (!interaction.member.roles.cache.has(adminrole))
        return interaction.reply({
          content: `**You do not have permission to do this.**`,
          ephemeral: true,
        });

      const receivedEmbed = interaction.message.embeds[0];
      const exampleEmbed = EmbedBuilder.from(receivedEmbed);
      const userId = exampleEmbed.data.title;
      const user2 = interaction.guild.members.cache.get(userId);
      const resultsChannel = interaction.guild.channels.cache.get(resultsroom);

      const embed = new EmbedBuilder()
        .setTimestamp()
        .setColor("Red")
        .setTitle("**Application Rejected**")
        .setDescription(`**Applicant: ${user2}\nAdmin: ${interaction.user}**`)
        .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));

      await resultsChannel.send({ embeds: [embed] });

      if (applyDB.get(`dm_${interaction.guild.id}`) === true) {
        const dm_embed = new EmbedBuilder()
          .setAuthor({
            name: interaction.guild.name,
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          })
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setTitle("Your application has been rejected 😥")
          .setDescription(`**> Admin: ${interaction.user}**`)
          .setColor("Red");

        await user2.send({ embeds: [dm_embed] }).catch(() => {});
      }

      const acceptButton = new ButtonBuilder()
        .setCustomId("apply_accept")
        .setLabel("Accept")
        .setEmoji("☑️")
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

      const rejectButton = new ButtonBuilder()
        .setCustomId("apply_reject")
        .setLabel("Reject")
        .setEmoji("✖️")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);

      const rejectWithReasonButton = new ButtonBuilder()
        .setCustomId("apply_reject_with_reason")
        .setLabel("Reject with Reason")
        .setEmoji("💡")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);

      const row = new ActionRowBuilder().addComponents(
        acceptButton,
        rejectButton,
        rejectWithReasonButton
      );

      interaction.reply({ content: "**Application rejected successfully.**" });
      interaction.message.edit({ components: [row] });
    }
  });
};
