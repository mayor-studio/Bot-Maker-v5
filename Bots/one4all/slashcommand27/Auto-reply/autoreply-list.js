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
    .setName("autoreply-list")
    .setDescription("View all auto-replies"),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const data = await one4allDB.get(`replys_${interaction.guild.id}`);
      if (data && data.length > 0) {
        const embed = new EmbedBuilder()
          .setTitle("📃 All Auto-Replies")
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setAuthor({
            name: interaction.client.user.username,
            iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
          })
          .setFooter({
            text: `Requested by: ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          });

        data.forEach((d) => {
          const { word, reply } = d;
          embed.addFields({
            name: `🔹 Trigger: \`${word}\``,
            value: `**Reply:** __${reply}__`,
          });
        });

        embed.addFields({
          name: "\u200B",
          value: `\`\`\`There are ${data.length} auto-replies in this server.\`\`\``,
        });

        return interaction.editReply({ embeds: [embed] });
      } else {
        return interaction.editReply({
          content: "**There are no auto-replies registered for this server.**",
        });
      }
    } catch {
      return interaction.editReply({
        content: "**An error occurred. Please contact the developers.**",
      });
    }
  },
};
