const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const systemDB = new Database("/Json-db/Bots/systemDB.json");

module.exports = {
  ownersOnly: false,
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("View your avatar or someone else's")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user whose avatar you want to see")
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const user = interaction.options.getUser("user") || interaction.user;
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new EmbedBuilder()
      .setAuthor({ name: user.tag, iconURL: avatarURL })
      .setTitle("Click to view full avatar")
      .setURL(avatarURL)
      .setImage(avatarURL)
      .setColor("Blurple")
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    return interaction.editReply({ embeds: [embed] });
  }
};
