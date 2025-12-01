const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");

const { Database } = require("st.db");
const applyDB = new Database("/Json-db/Bots/applyDB.json");
const tokens = new Database("/tokens/tokens");
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");

module.exports = {
  ownersOnly: false,
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName("setup-apply")
    .setDescription("Setup the application system")
    .addChannelOption((option) =>
      option
        .setName("applyroom")
        .setDescription("Channel where users can apply")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("appliesroom")
        .setDescription("Channel where applications are sent")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("resultsroom")
        .setDescription("Channel where results are posted")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("adminrole")
        .setDescription("The admin role that manages applications")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const sent = await interaction.deferReply({
      fetchReply: true,
      ephemeral: false,
    });

    const embed = new EmbedBuilder()
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTimestamp(Date.now())
      .setColor("#000000");

    const applyroom = interaction.options.getChannel("applyroom");
    const appliesroom = interaction.options.getChannel("appliesroom");
    const resultsroom = interaction.options.getChannel("resultsroom");
    const adminrole = interaction.options.getRole("adminrole");

    await applyDB.set(`apply_settings_${interaction.guild.id}`, {
      applyroom: applyroom.id,
      appliesroom: appliesroom.id,
      resultsroom: resultsroom.id,
      adminrole: adminrole.id,
    });

    embed.setTitle("✅ Application system has been successfully configured.");

    return interaction.editReply({ embeds: [embed] });
  },
};
