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
    .setName("autoreply-add")
    .setDescription("Add a new auto-reply")
    .addStringOption((option) =>
      option.setName("word").setDescription("Trigger word").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reply").setDescription("Auto-reply message").setRequired(true)
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const word = interaction.options.getString("word");
      const reply = interaction.options.getString("reply");

      const data = await one4allDB.get(`replys_${interaction.guild.id}`);
      if (data) {
        const replyCheck = data.find((r) => r.word === word);
        if (replyCheck) {
          return interaction.editReply({
            content: `❌ This auto-reply for \`${word}\` already exists.`,
          });
        } else {
          await one4allDB.push(`replys_${interaction.guild.id}`, {
            word,
            reply,
            addedBy: interaction.user.id,
          });
        }
      } else {
        await one4allDB.set(`replys_${interaction.guild.id}`, [
          {
            word,
            reply,
            addedBy: interaction.user.id,
          },
        ]);
      }

      await interaction.editReply({
        content: `✅ Auto-reply for **${word}** has been added successfully.`,
      });
    } catch {
      return interaction.editReply({
        content: `⚠️ An error occurred. Please contact the developers.`,
      });
    }
  },
};
