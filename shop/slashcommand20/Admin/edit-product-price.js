const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/shopDB.json");

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName("edit-product-price")
    .setDescription("Edit the price of a product")
    .addStringOption(option =>
      option
        .setName("name")
        .setDescription("Name of the product")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("newprice")
        .setDescription("The new price")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const name = interaction.options.getString("name");
    const newPrice = interaction.options.getInteger("newprice");
    const products = db.get(`products_${interaction.guild.id}`);

    if (!products || products.length === 0) {
      return interaction.editReply({ content: "**No products available to edit.**" });
    }

    const product = products.find(p => p.name === name);
    if (!product) {
      return interaction.editReply({ content: "**No product found with that name.**" });
    }

    product.price = newPrice;
    await db.set(`products_${interaction.guild.id}`, products);

    return interaction.editReply({ content: "**The price has been successfully updated.**" });
  }
};
