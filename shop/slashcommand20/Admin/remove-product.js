const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/shopDB.json");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-category')
        .setDescription('Remove a product category from the shop')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of the product category')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const name = interaction.options.getString('name');

        let products = await db.get(`products_${interaction.guild.id}`);
        if (!products) {
            await db.set(`products_${interaction.guild.id}`, []);
            products = await db.get(`products_${interaction.guild.id}`);
        }

        const category = products.find(p => p.name === name);
        if (!category) return interaction.editReply({ content: '**This product category does not exist to remove.**' });

        const filtered = products.filter(p => p.name !== name);
        await db.set(`products_${interaction.guild.id}`, filtered);

        await interaction.editReply({ content: '**Product category removed successfully.**' });
    }
};
