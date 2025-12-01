const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/nadekoDB.json");

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName("set-greet-message")
    .setDescription("Set the greeting message when a user joins")
    .addStringOption((option) =>
      option.setName("message").setDescription("The greeting message").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const message = interaction.options.getString("message");
    await db.set(`message_${interaction.guild.id}`, message);

    return interaction.editReply({ content: "**Greeting message has been set successfully!**" });
  },
};
