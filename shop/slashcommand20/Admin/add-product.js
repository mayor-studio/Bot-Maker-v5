const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/shopDB.json");

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName('add-category')
    .setDescription('Add a product category for sale')
    .addStringOption(option => option
      .setName('name')
      .setDescription('Category name')
      .setRequired(true))
    .addIntegerOption(option => option
      .setName('price')
      .setDescription('Product price')
      .setRequired(true))
    .addStringOption(option => option
      .setName('name_emoji')
      .setDescription('Emoji for product name')
      .setRequired(false))
    .addStringOption(option => option
      .setName('price_emoji')
      .setDescription('Emoji for product price')
      .setRequired(false))
    .addStringOption(option => option
      .setName('goods_emoji')
      .setDescription('Emoji for available goods')
      .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const name = interaction.options.getString('name');
    const price = interaction.options.getInteger('price');

    let nameEmoji = interaction.options.getString('name_emoji') || "🏷️";
    let priceEmoji = interaction.options.getString('price_emoji') || "💰";
    let goodsEmoji = interaction.options.getString('goods_emoji') || "📦";

    // Helper function to parse emojis
    function parseEmoji(input) {
      if (!input) return null;
      if (input.match(/<a?:.+:\d+>/)) {
        return input; // Already full emoji format
      } else if (input.match(/^\d+$/)) {
        // If only ID is provided, try to get from guild emojis
        const emoji = interaction.guild.emojis.cache.get(input);
        return emoji ? emoji.toString() : null;
      }
      return input; // fallback to input (likely unicode emoji)
    }

    nameEmoji = parseEmoji(nameEmoji) || "🏷️";
    priceEmoji = parseEmoji(priceEmoji) || "💰";
    goodsEmoji = parseEmoji(goodsEmoji) || "📦";

    let products = await db.get(`products_${interaction.guild.id}`);
    if (!products) {
      await db.set(`products_${interaction.guild.id}`, []);
      products = [];
    }

    const exists = products.find(prod => prod.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return interaction.editReply({ content: "**This product category already exists.**" });
    }

    await db.push(`products_${interaction.guild.id}`, {
      name,
      price,
      nameEmoji,
      priceEmoji,
      goodsEmoji,
      goods: []
    });

    await interaction.editReply({ content: "**Product category added successfully.**" });
  }
};
