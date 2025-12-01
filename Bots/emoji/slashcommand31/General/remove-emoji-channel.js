const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const emojiDB = new Database("/Json-db/Bots/emojiDB.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-emoji-channel')
    .setDescription('Remove the emoji adding channel'),
    
  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "❌ You must be an administrator!", ephemeral: true });
    }

    emojiDB.delete(`emoji_channel_${interaction.guildId}`);
    
    await interaction.reply({ content: `✅ Emoji channel has been removed from this server.`, ephemeral: true });
  }
};
