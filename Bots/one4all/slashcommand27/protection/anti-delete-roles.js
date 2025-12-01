const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonStyle,
  PermissionsBitField,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/protectDB.json");

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName("anti-delete-roles")
    .setDescription("Set up the protection system against role deletion")
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("Enable or disable the protection system")
        .setRequired(true)
        .addChoices(
          { name: "On", value: "on" },
          { name: "Off", value: "off" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setDescription("The allowed number of deletions per day")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });
    try {
      const status = interaction.options.getString("status");
      const limit = interaction.options.getInteger("limit");

      await db.set(`antideleteroles_status_${interaction.guild.id}`, status);
      await db.set(`antideleteroles_limit_${interaction.guild.id}`, limit);
      await db.set(`rolesdelete_users_${interaction.guild.id}`, []);

      return interaction.editReply({
        content:
          "**Anti-role-deletion protection has been successfully set.\n- Make sure my role is the highest in the server.**",
      });
    } catch (err) {
      console.error(err);
      return interaction.editReply({
        content: "❌ An error occurred while setting the protection system.",
      });
    }
  },
};
