const { SlashCommandBuilder } = require('discord.js');
const { Database } = require("st.db");
const spinDB = new Database("/Json-db/Bots/spinDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-spin-category')
        .setDescription('Set the category for spin channels')
        .addChannelOption(option => 
            option.setName('category')
                .setDescription('The category to be used for spin channels')
                .setRequired(true)
                .addChannelTypes(4) // 4 = Guild Category
        ),
    async execute(interaction) {
        const category = interaction.options.getChannel('category');

        // Save category ID in the DB
        await spinDB.set(`spin_category_${interaction.guild.id}`, category.id);

        await interaction.reply({ content: `✅ Spin category has been set to ${category.name}`, ephemeral: true });
    }
};
