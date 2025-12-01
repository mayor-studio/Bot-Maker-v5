const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Database } = require("st.db");
const fs = require("fs");
const path = require("path");
const db = new Database("/Json-db/Bots/shopDB.json");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give a product to a user for free')
        .addStringOption(option =>
            option.setName('product')
                .setDescription('Product name')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user who will receive the product')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Quantity to give')
                .setRequired(true)),
    async execute(interaction) {
        const productName = interaction.options.getString('product');
        const recipientUser = interaction.options.getUser('user');
        const count = interaction.options.getInteger('count');

        let products = db.get(`products_${interaction.guild.id}`) || [];
        let product = products.find(p => p.name === productName);

        if (!product) {
            return interaction.reply({ content: '**This product does not exist.**', ephemeral: true });
        }

        let goods = product.goods;
        if (!goods || goods.length < count) {
            return interaction.reply({ 
                content: `**Requested quantity is not available. Currently available: ${goods.length}.**`, 
                ephemeral: true 
            });
        }

        function getRandomAndRemove(array, count) {
            const result = [];
            for (let i = 0; i < count; i++) {
                const randomIndex = Math.floor(Math.random() * array.length);
                const randomElement = array.splice(randomIndex, 1)[0];
                result.push(randomElement);
            }
            return result;
        }

        const givenGoods = getRandomAndRemove(goods, count);
        product.goods = goods;
        await db.set(`products_${interaction.guild.id}`, products);

        let purchasedProducts = givenGoods.join('\n');

        if (count > 50) {
            const fileName = `products_${recipientUser.id}.txt`;
            const filePath = path.join(__dirname, fileName);
            fs.writeFileSync(filePath, purchasedProducts, "utf-8");

            const attachment = new AttachmentBuilder(filePath);

            await recipientUser.send({ 
                content: 'Here are your products:', 
                files: [attachment] 
            });

            fs.unlinkSync(filePath);
        } else {
            const copyButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('copynitro')
                    .setLabel('COPY')
                    .setStyle(ButtonStyle.Secondary)
            );

            const goodsEmbed = new EmbedBuilder()
                .setTitle('**Products**')
                .setDescription(`**\`\`\`${purchasedProducts}\`\`\`**`)
                .setTimestamp();

            await recipientUser.send({
                embeds: [goodsEmbed],
                components: [copyButton]
            });
        }

        await interaction.reply({ 
            content: `**Successfully sent ${count} product(s) to ${recipientUser}.**`, 
            ephemeral: true 
        });
    }
};
