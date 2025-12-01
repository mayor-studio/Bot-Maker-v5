const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const { Database } = require("st.db");
const applyDB = new Database("/Json-db/Bots/applyDB.json");

module.exports = {
  ownersOnly: false,
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName("new-apply")
    .setDescription("Create a new bot application")
    .addRoleOption((option) =>
      option.setName("role")
        .setDescription("The role applicants will apply for")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("ask1")
        .setDescription("First question")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("ask2")
        .setDescription("Second question")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("ask3")
        .setDescription("Third question")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("ask4")
        .setDescription("Fourth question")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("ask5")
        .setDescription("Fifth question")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option.setName("image")
        .setDescription("Image to include in the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("button")
        .setDescription("Button color for the application message")
        .addChoices(
          { name: "Gray", value: '2' },
          { name: "Blue", value: '1' },
          { name: "Green", value: '3' },
          { name: "Red", value: '4' },
        )
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const settings = await applyDB.get(`apply_settings_${interaction.guild.id}`);
    if (!settings) {
      return interaction.reply({
        content: `⚠️ Please set up the application system first using **/setup-apply**`,
        ephemeral: true,
      });
    }

    const role = interaction.options.getRole("role");
    const ask1 = interaction.options.getString("ask1");
    const ask2 = interaction.options.getString("ask2");
    const ask3 = interaction.options.getString("ask3");
    const ask4 = interaction.options.getString("ask4");
    const ask5 = interaction.options.getString("ask5");
    const image = interaction.options.getAttachment("image");
    const button = interaction.options.getString("button") || "1";

    await applyDB.set(`apply_${interaction.guild.id}`, {
      roleid: role.id,
      ask1,
      ask2,
      ask3,
      ask4,
      ask5,
    });

    const modal = new ModalBuilder()
      .setCustomId("message_modal")
      .setTitle("Application Message");

    const messageInput = new TextInputBuilder()
      .setCustomId("message_input")
      .setLabel("What should the embed say?")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(messageInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);

    const filter = (i) => i.customId === "message_modal" && i.user.id === interaction.user.id;

    interaction.awaitModalSubmit({ filter, time: 60000 })
      .then(async (modalSubmit) => {
        const message = modalSubmit.fields.getTextInputValue("message_input");

        const applyChannel = interaction.guild.channels.cache.find(
          (ch) => ch.id == settings.applyroom
        );

        const applyButton = new ButtonBuilder()
          .setCustomId("apply_button")
          .setLabel("Apply")
          .setStyle(button)
          .setEmoji("✍🏻");

        const row = new ActionRowBuilder().addComponents(applyButton);

        const embed = new EmbedBuilder()
          .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setDescription(`**${message}**`);

        if (image) {
          embed.setImage(image.url);
        }

        await applyChannel.send({ embeds: [embed], components: [row] });
        await modalSubmit.reply({ content: "✅ Application message sent successfully!", ephemeral: true });
      })
      .catch((err) => {
        // Modal timed out or failed silently
      });
  },
};
