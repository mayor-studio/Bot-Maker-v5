const { SlashCommandBuilder } = require('discord.js');
const { Database } = require("st.db");
const spinDB = new Database("/Json-db/Bots/spinDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-vip-prizes')
        .setDescription('Set the VIP spin prizes')
        .addStringOption(opt =>
            opt.setName('prize1')
                .setDescription('First VIP prize')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('prize2')
                .setDescription('Second VIP prize')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('prize3')
                .setDescription('Third VIP prize')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('prize4')
                .setDescription('Fourth VIP prize')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('prize5')
                .setDescription('Fifth VIP prize')
                .setRequired(true)),

    async execute(interaction) {
        const prizes = [
            interaction.options.getString('prize1'),
            interaction.options.getString('prize2'),
            interaction.options.getString('prize3'),
            interaction.options.getString('prize4'),
            interaction.options.getString('prize5')
        ];

        await spinDB.set(`vip_prizes_${interaction.guild.id}`, prizes);
        await interaction.reply({ 
            content: `✅ VIP spin prizes have been set:\n${prizes.map((p, i) => `${i + 1}. ${p}`).join('\n')}`, 
            ephemeral: true 
        });
    }
};
