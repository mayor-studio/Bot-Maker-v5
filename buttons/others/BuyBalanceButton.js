const { SlashCommandBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,Events, EmbedBuilder , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle } = require("discord.js");
const { Database } = require("st.db");
const setting = new Database("/database/settingsdata/setting")
module.exports = {
  name: Events.InteractionCreate,
    /**
    * @param {Interaction} interaction
  */
  async execute(interaction, client){
    if(interaction.isButton()) {
        if(interaction.customId == "BuyBalanceButton") {
            let price1 = setting.get(`balance_price_${interaction.guild.id}`) ?? 1000;
            let recipient = setting.get(`recipient_${interaction.guild.id}`)
            let logroom =  setting.get(`log_room_${interaction.guild.id}`)
            let probot = setting.get(`probot_${interaction.guild.id}`)
            let clientrole = setting.get(`client_role_${interaction.guild.id}`)
            if(!price1 || !recipient || !logroom || !probot || !clientrole) return interaction.reply({content:`**لم يتم تحديد الاعدادات**` , ephemeral:true})
            const modal = new ModalBuilder()
            .setCustomId('BuyBalanceModal')
			.setTitle('Buy Balance');
            const quantity = new TextInputBuilder()
            .setCustomId('balance_quantity')
            .setLabel("الكمية")
            .setStyle(TextInputStyle.Short);
            const firstActionRow = new ActionRowBuilder().addComponents(quantity);
            modal.addComponents(firstActionRow)
            await interaction.showModal(modal)
        }
    } else if (!interaction.isCommand()) return;

    if (interaction.commandName === 'setup') {
        const buycoinsroom = interaction.guild.channels.cache.get(setting.get(`buy_coins_room_${interaction.guild.id}`));
        if (!buycoinsroom) return;

        const buyEmbed = new EmbedBuilder()
            .setTitle('💰 شراء رصيد')
            .setDescription(`**
            • سعر 1000 كريدت = 1000 بروبوت
            • للشراء اضغط على الزر بالأسفل
            • سيتم خصم المبلغ تلقائياً من حسابك في البروبوت
            **`)
            .setColor('Gold')
            .setThumbnail(interaction.guild.iconURL({dynamic: true}))
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('BuyBalanceButton')
                    .setLabel('شراء رصيد')
                    .setEmoji('💰')
                    .setStyle(ButtonStyle.Success)
            );

        await buycoinsroom.send({
            embeds: [buyEmbed],
            components: [row]
        });
    }
}
};