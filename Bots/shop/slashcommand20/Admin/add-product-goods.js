const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder, 
  ModalBuilder 
} = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/shopDB.json");

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName('add-product')
    .setDescription('Add goods to an existing product'),
  
  async execute(interaction) {
    const products = db.get(`products_${interaction.guild.id}`);
    
    if (!products || products.length === 0) {
      return interaction.reply({
        content: '**There are no products to add goods to.**',
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId('add_goods')
      .setTitle('Add Product Goods');

    const productNameInput = new TextInputBuilder()
      .setCustomId('type')
      .setLabel('Product Name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter the product name here')
      .setRequired(true);

    const goodsInput = new TextInputBuilder()
      .setCustomId('Goods')
      .setLabel('Goods')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Describe the goods here')
      .setRequired(true);

    const firstRow = new ActionRowBuilder().addComponents(productNameInput);
    const secondRow = new ActionRowBuilder().addComponents(goodsInput);

    modal.addComponents(firstRow, secondRow);

    await interaction.showModal(modal);
  }
};
