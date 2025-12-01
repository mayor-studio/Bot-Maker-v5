const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const emojiDB = new Database("/Json-db/Bots/emojiDB.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-emoji-channel')
    .setDescription('Set the emoji adding channel')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('The channel to set').setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "❌ You must be an administrator!", ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    emojiDB.set(`emoji_channel_${interaction.guildId}`, channel.id);

    await interaction.reply({ content: `✅ Emoji channel has been set to <#${channel.id}>`, ephemeral: true });
  }
};
