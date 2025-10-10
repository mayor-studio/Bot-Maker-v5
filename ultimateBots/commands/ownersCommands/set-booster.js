const { ChatInputCommandInteraction, Client, SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const settings = new Database("/database/settingsdata/settings.json");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-booster')
        .setDescription('تحديد عدد العملات للبوستر')
        .addIntegerOption(option => 
            option
                .setName('amount')
                .setDescription('عدد العملات')
                .setRequired(true)
                .setMinValue(0)),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false });
        const amount = interaction.options.getInteger('amount');

        await settings.set(`booster_coins_${interaction.guild.id}`, amount);
        
        return interaction.editReply({ 
            content: `**✅ تم تحديد مكافأة البوستر الى \`${amount}\` عملة**`
        });
    }
};
