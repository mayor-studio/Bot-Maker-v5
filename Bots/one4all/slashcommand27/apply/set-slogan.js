const {
  SlashCommandBuilder,
} = require("discord.js");
const { Database } = require("st.db");

const applyDB = new Database("/Json-db/Bots/applyDB.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-slogan")
    .setDescription("Set a slogan for applications")
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("Require slogan?")
        .setRequired(true)
        .addChoices(
          { name: "On", value: "on" },
          { name: "Off", value: "off" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("slogan")
        .setDescription("The slogan text")
        .setRequired(false)
    ),
  async execute(interaction) {
    const status = interaction.options.getString("status");
    const slogan = interaction.options.getString("slogan") || "";

    await applyDB.set(`status_slogan_${interaction.guild.id}`, status);
    await applyDB.set(`apply_slogan_${interaction.guild.id}`, slogan);

    return interaction.reply({
      content: `✅ **Settings have been updated successfully**`,
      ephemeral: true,
    });
  },
};
