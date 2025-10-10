const {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");
const { Database } = require("st.db");
const setting = new Database("/database/settingsdata/setting");

module.exports = {
  ownersOnly: true,
  mainGuildOnly: true,
  data: new SlashCommandBuilder()
    .setName('change-balance-price')
    .setDescription('Change the price of balance (in credits)')
    .addIntegerOption(option =>
      option
        .setName('price')
        .setDescription('New price in credits')
        .setRequired(true)
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false });

    const price = interaction.options.getInteger('price');
    await setting.set(`balance_price_${interaction.guild.id}`, price);

    const embed = new EmbedBuilder()
      .setDescription(`<:Verified:1401460125612507156> **Balance price successfully updated to \`${price}\` credits.**`)
      .setColor('#A6D3CF');

    return interaction.editReply({ embeds: [embed] });
  }
};
