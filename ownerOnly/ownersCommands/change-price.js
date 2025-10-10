const { ChatInputCommandInteraction, Client, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const prices = new Database("/database/settingsdata/prices.json");

const choices = [
  'apply', 'azkar', 'Broadcast', 'normalBroadcast', 'credit', 'tax', 'invites', 'verify', 'privateRooms',
  'spin', 'Logs', 'giveaway', 'ticket', 'suggestions', 'system', 'shop', 'feedback', 'probot', 'protect',
  'color', 'tempvoice', 'autoline', 'quran', 'feelings', 'one4all', 'bot_maker_premium', 'bot_maker',
  'bot_maker_ultimate', 'emoji', 'offers', 'games', 'nadeko', 'twitter', 'warns'
];

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName('change-price')
    .setDescription('Change the price of a bot')
    .addStringOption(option =>
      option
        .setName('bot-type')
        .setDescription('Bot type')
        .setRequired(true)
        .setAutocomplete(true))
    .addIntegerOption(option =>
      option
        .setName('price')
        .setDescription('Price in coins')
        .setRequired(true)),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false });
    const Bot_Type = interaction.options.getString('bot-type');
    const price = interaction.options.getInteger('price');

    const embed = new EmbedBuilder()
      .setColor('#A6D3CF')
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    if (!choices.includes(Bot_Type)) {
      embed.setDescription(`<:Warning:1401460074937057422> Invalid bot type.`);
      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    // Specific minimum price checks
    if (Bot_Type === "balance" && price < 1000) {
      embed.setDescription(`⚠️ You cannot set the currency price below \`1000\` credits.`);
      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    if (["bot_maker", "bot_maker_premium", "bot_maker_ultimate"].includes(Bot_Type)) {
      const minPrices = {
        bot_maker: 150,
        bot_maker_premium: 350,
        bot_maker_ultimate: 500
      };
      if (price < minPrices[Bot_Type]) {
        embed.setDescription(`⚠️ You cannot set the price of \`${Bot_Type}\` below \`${minPrices[Bot_Type]}\` coins.`);
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }
    }

    if (price < 0) {
      embed.setDescription(`⚠️ Price cannot be below \`0\` coins.`);
      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    await prices.set(`${Bot_Type}_price_${interaction.guild.id}`, price);
    embed.setDescription(`<:Verified:1401460125612507156> Successfully updated the price of \`${Bot_Type}\` to \`${price}\` coins.`);
    return interaction.editReply({ embeds: [embed] });
  },

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async autocomplete(interaction) {
    const value = interaction.options.getFocused().toLowerCase();
    const filtered = choices.filter(choice => choice.toLowerCase().includes(value)).slice(0, 25);
    await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
  }
};
