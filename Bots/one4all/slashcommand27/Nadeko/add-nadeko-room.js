const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/nadekoDB.json");

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName("add-greet-room")
    .setDescription("Add a room where the greet feature is enabled")
    .addChannelOption((option) =>
      option.setName("room").setDescription("The channel").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const room = interaction.options.getChannel("room");
    let rooms = db.get(`rooms_${interaction.guild.id}`);

    if (!rooms) {
      await db.set(`rooms_${interaction.guild.id}`, []);
      rooms = [];
    }

    // Avoid duplicate addition:
    if (rooms.includes(room.id)) {
      return interaction.editReply({ content: "**This channel is already added.**" });
    }

    await db.push(`rooms_${interaction.guild.id}`, room.id);

    return interaction.editReply({ content: "**Channel added successfully!**" });
  },
};
