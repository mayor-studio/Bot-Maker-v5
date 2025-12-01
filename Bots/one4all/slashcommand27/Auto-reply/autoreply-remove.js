const {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  MessageComponentCollector,
  ButtonStyle,
} = require("discord.js");
const { Database } = require("st.db");
const one4allDB = new Database("/Json-db/Bots/one4allDB.json");

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName("autoreply-remove")
    .setDescription("Remove an auto-reply")
    .addStringOption((option) =>
      option.setName("word").setDescription("Trigger word").setRequired(true)
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const word = interaction.options.getString("word");

      // Get auto-replies for this server
      const replysCheck = await one4allDB.get(`replys_${interaction.guild.id}`);

      // If replies exist
      if (replysCheck) {
        // Check if the word exists
        const data = replysCheck.find((r) => r.word === word);

        if (data) {
          // Filter out the entry
          const filteredReplies = replysCheck.filter((r) => r.word !== word);
          await one4allDB.set(`replys_${interaction.guild.id}`, filteredReplies);

          return interaction.editReply({
            content: `✅ Auto-reply for \`${word}\` has been removed.`,
          });
        } else {
          return interaction.editReply({
            content: `❌ No auto-reply found for the word \`${word}\`.`,
          });
        }
      } else {
        return interaction.editReply({
          content: `❌ No auto-reply found for the word \`${word}\`.`,
        });
      }
    } catch {
      return interaction.editReply({
        content: `⚠️ An error occurred. Please contact the developers.`,
      });
    }
  },
};
