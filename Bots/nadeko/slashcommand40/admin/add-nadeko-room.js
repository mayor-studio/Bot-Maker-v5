const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/nadekoDB.json");

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName('add-nadeko-room')
    .setDescription('Add a room where the feature will be enabled')
    .addChannelOption(option =>
      option
        .setName('room')
        .setDescription('The channel to enable the feature in')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const room = interaction.options.getChannel('room');
    let rooms = db.get(`rooms_${interaction.guild.id}`) || [];

    if (!rooms.includes(room.id)) {
      await db.push(`rooms_${interaction.guild.id}`, room.id);
    }

    return interaction.editReply({
      content: `✅ **Channel <#${room.id}> has been successfully added.**`
    });
  }
};
