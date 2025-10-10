const {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");
const { Database } = require("st.db");
const settings = new Database("/database/settingsdata/settings.json");

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName('set-booster')
    .setDescription('Set the number of coins rewarded for boosters')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of coins to reward')
        .setRequired(true)
        .setMinValue(0)
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false });

    const amount = interaction.options.getInteger('amount');
    await settings.set(`booster_coins_${interaction.guild.id}`, amount);

    const embed = new EmbedBuilder()
      .setColor('#A6D3CF')
      .setDescription(`<:Verified:1401460125612507156> Booster reward has been set to \`${amount}\` coins.`);

    return interaction.editReply({ embeds: [embed] });
  }
};
