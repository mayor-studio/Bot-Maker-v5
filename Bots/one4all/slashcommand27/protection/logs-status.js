const {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/protectDB.json");

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName("protection-status")
    .setDescription("Check the status of the protection system"),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false });

    try {
      const banStatus = db.get(`ban_status_${interaction.guild.id}`) || "off";
      const banLimit = db.get(`ban_limit_${interaction.guild.id}`) ?? "Not set";

      const botsStatus = db.get(`antibots_status_${interaction.guild.id}`) || "off";
      const botsLimit = "Not applicable";

      const deleteRolesStatus = db.get(`antideleteroles_status_${interaction.guild.id}`) || "off";
      const deleteRolesLimit = db.get(`antideleteroles_limit_${interaction.guild.id}`) ?? "Not set";

      const deleteRoomsStatus = db.get(`antideleterooms_status_${interaction.guild.id}`) || "off";
      const deleteRoomsLimit = db.get(`antideleterooms_limit_${interaction.guild.id}`) ?? "Not set";

      const embed = new EmbedBuilder()
        .setTitle("Protection System Status")
        .setColor(banStatus === "on" || botsStatus === "on" || deleteRolesStatus === "on" || deleteRoomsStatus === "on" ? 0x00ff00 : 0xff0000)
        .addFields(
          {
            name: "Anti-Bots",
            value: `Status: ${botsStatus === "on" ? "🟢 On" : "🔴 Off"}\nLimit: \`${botsLimit}\``,
            inline: false,
          },
          {
            name: "Anti-Ban",
            value: `Status: ${banStatus === "on" ? "🟢 On" : "🔴 Off"}\nLimit: \`${banLimit}\``,
            inline: false,
          },
          {
            name: "Anti-Channel Deletion",
            value: `Status: ${deleteRoomsStatus === "on" ? "🟢 On" : "🔴 Off"}\nLimit: \`${deleteRoomsLimit}\``,
            inline: false,
          },
          {
            name: "Anti-Role Deletion",
            value: `Status: ${deleteRolesStatus === "on" ? "🟢 On" : "🔴 Off"}\nLimit: \`${deleteRolesLimit}\``,
            inline: false,
          }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "❌ An error occurred while fetching the protection status.",
      });
    }
  },
};
