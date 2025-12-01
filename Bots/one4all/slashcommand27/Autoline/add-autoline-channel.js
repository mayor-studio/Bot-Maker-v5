const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const autolineDB = new Database("/Json-db/Bots/autolineDB.json");

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName('add-autoline-channel')
    .setDescription('Add a channel to be used for the auto line system')
    .addChannelOption(option =>
      option
        .setName('room')
        .setDescription('The channel to add')
        .setRequired(true)),
  
  async execute(interaction) {
    const room = interaction.options.getChannel('room');

    if (!autolineDB.has(`line_channels_${interaction.guild.id}`)) {
      await autolineDB.set(`line_channels_${interaction.guild.id}`, []);
    }

    await autolineDB.push(`line_channels_${interaction.guild.id}`, room.id);

    return interaction.reply({ content: `✅ The channel has been successfully added.`, ephemeral: true });
  }
};
