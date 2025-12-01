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
    .setName("anti-ban")
    .setDescription("Set up the Anti-Ban protection system")
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
        .setDescription("Maximum allowed bans per day")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    try {
      const status = interaction.options.getString("status");
      const limit = interaction.options.getInteger("limit");

      await db.set(`ban_status_${interaction.guild.id}`, status);
      await db.set(`ban_limit_${interaction.guild.id}`, limit);
      await db.set(`ban_users_${interaction.guild.id}`, []);

      return interaction.editReply({
        content: `**Anti-Ban protection has been successfully configured.\n- Make sure my role is at the top of the server roles.**`,
      });
    } catch (err) {
      console.error(err);
      return interaction.editReply({
        content: `❌ Something went wrong while setting up the Anti-Ban system.`,
      });
    }
  },
};
