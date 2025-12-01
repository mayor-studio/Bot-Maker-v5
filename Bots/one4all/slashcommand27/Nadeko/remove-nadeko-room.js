const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/nadekoDB.json");

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName("remove-greet-room")
    .setDescription("Remove a room where the greet feature is enabled")
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

    if (!rooms.includes(room.id)) {
      return interaction.editReply({
        content: "**This channel was not added before, so it cannot be removed.**",
      });
    }

    const filtered = rooms.filter((ro) => ro !== room.id);
    await db.set(`rooms_${interaction.guild.id}`, filtered);

    return interaction.editReply({ content: "**Channel removed successfully!**" });
  },
};
