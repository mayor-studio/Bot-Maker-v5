const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/shopDB.json");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-product')
        .setDescription('Remove an item from a specific product')
        .addStringOption(option =>
            option.setName('product_name')
                .setDescription('Name of the product')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('item')
                .setDescription('The item to remove')
                .setRequired(true)),
    async execute(interaction) {
        const productName = interaction.options.getString('product_name');
        const itemToRemove = interaction.options.getString('item');

        let products = await db.get(`products_${interaction.guild.id}`);
        if (!products) {
            await db.set(`products_${interaction.guild.id}`, []);
            products = await db.get(`products_${interaction.guild.id}`);
        }

        let product = products.find(p => p.name === productName);
        if (!product) 
            return interaction.reply({ content: '**This product does not exist to remove items from.**', ephemeral: true });

        let goods = product.goods;
        if (!goods || !goods.includes(itemToRemove))
            return interaction.reply({ content: '**This item is not available in this product to remove.**', ephemeral: true });

        // Remove all occurrences of the item
        product.goods = goods.filter(g => g !== itemToRemove);

        await db.set(`products_${interaction.guild.id}`, products);

        return interaction.reply({ content: '**Item removed successfully.**', ephemeral: true });
    }
};
