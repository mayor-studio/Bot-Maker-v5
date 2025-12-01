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
    .setName("anti-bots")
    .setDescription("Set up the Anti-Bot protection system")
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("Enable or disable the protection system")
        .setRequired(true)
        .addChoices(
          { name: "On", value: "on" },
          { name: "Off", value: "off" } // corrected typo: "of" ➝ "off"
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });
    try {
      const status = interaction.options.getString("status");
      await db.set(`antibots_status_${interaction.guild.id}`, status);
      return interaction.editReply({
        content: `**Anti-Bot protection status has been successfully updated.\n- Make sure my role is the highest in the server.**`,
      });
    } catch (err) {
      console.error(err);
      return interaction.editReply({
        content: `❌ Something went wrong while updating the Anti-Bot status.`,
      });
    }
  },
};
