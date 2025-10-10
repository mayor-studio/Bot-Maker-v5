const { ChatInputCommandInteraction , Client , SlashCommandBuilder,SelectMenuBuilder,StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle, Embed } = require("discord.js");
const { Database } = require("st.db")
const db = new Database("/database/data")
const setting = new Database("/database/settingsdata/setting")
const prices = new Database("/database/settingsdata/prices.json")
const statuses = new Database("/database/settingsdata/statuses")
const { mainguild } = require('../../../config.json');

module.exports = {
    ownersOnly:true,
    data: new SlashCommandBuilder()
    .setName('send-buy-bot-panel')
    .setDescription(`ارسال بانل شراء البوتات`),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
async execute(interaction , client) {
    await interaction.deferReply({ephemeral:false})
    let price1 = await setting.get(`balance_price_${interaction.guild.id}`) ?? 1000;
    let recipient = await setting.get(`recipient_${interaction.guild.id}`)
    let logroom =  await setting.get(`log_room_${interaction.guild.id}`)
    let probot = await setting.get(`probot_${interaction.guild.id}`)
    let clientrole = await setting.get(`client_role_${interaction.guild.id}`)
    let buybotroom = await setting.get(`buy_bot_room${interaction.guild.id}`)
    if(!price1 || !recipient || !logroom || !probot || !clientrole || !buybotroom) return interaction.editReply({content:`**لم يتم تحديد الاعدادات**`})
    let theroom = interaction.guild.channels.cache.find(ch => ch.id == buybotroom)

    const theBotMember = interaction.guild.members.cache.get(interaction.client.user.id);
    const botRole = theBotMember.displayHexColor || "Random";

    let embed = new EmbedBuilder()
                    .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
                    .setTitle(`**Maker Rules**`)
                    .setDescription(`**
                        
1- Bots will be updated regularly to fix bugs and add new features, at no additional cost to users.

2- We are committed to the confidentiality of customer information and will not sell or share data with third parties without prior customer consent.

3- Users must adhere to the fair usage policy and refrain from overusing the service in a manner that impacts the performance of the bots or the service provided to others.

4- No refunds will be issued after the purchase is complete, except in exceptional cases and after review by the technical support team.

5- If you purchase a broadcast bot, we cannot compensate you for the bots suspension.

6- We are not responsible for failure to unlock your private information before purchasing any bot.
    **`)
                    .setColor(botRole)
                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic : true}))

    if(interaction.guild.id === mainguild){
        embed
        
    }

    const select = new StringSelectMenuBuilder()
                    .setCustomId('select_buy')
                    .setPlaceholder('قم بالاختيار من القائمة')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setEmoji(`<:bot:1355931653201072220>`)    
                            .setLabel('Buy bot')
                            .setDescription('شراء بوت شغال 24 ساعة')
                            .setValue('selectBuyBot'),
                        new StringSelectMenuOptionBuilder()
                            .setEmoji(`🔃`)
                            .setLabel('Reset')
                            .setDescription('عمل اعادة تعيين للاختيار')
                            .setValue('Reset_Selected'),
                    );
    const row0 = new ActionRowBuilder().addComponents(select);

    const button = new ButtonBuilder().setCustomId(`buyBotInfo`).setStyle(2).setLabel('translate');
    const row1 = new ActionRowBuilder().addComponents(button);

    theroom.send({embeds:[embed] , components:[row0 , row1]})
    if(setting.has(`subscribe_room_${interaction.guild.id}`)) {
        let subscriptionRoomId = setting.get(`subscribe_room_${interaction.guild.id}`)
        let subscriptionRoom = interaction.guild.channels.cache.find(ch => ch.id == subscriptionRoomId)
        let subscriptionEmbed = new EmbedBuilder()
                            .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
                            //.setTitle(`**بانل اشتراك في بوت الميكر**`)
                            .setColor(botRole)
                            .setDescription(`** ## :bar_chart: Subscription plans for bot services :bar_chart:

### :star: | Prime :
- Sell regular bots
- ~~Sell bot tokens~~
- ~~Customize bot name and avatar~~
- ~~Auto-renew bots~~
- ~~Sell one bot for all~~
- ~~Sell makers~~
- - ___Price___ : \`${prices.get(`bot_maker_price_`+interaction.guild.id) ?? "150"}\` currency per month

### :fire: | Ultimate :
- Sell regular bots
- Sell bot tokens
- Customize bot name and avatar
- Auto-renew bots
- Sell one bot for all
- Sell makers ( Prime / Premium / ~~ Ultimate ~~ )
- - ___Price___ : \`${prices.get(`bot_maker_ultimate_price_`+interaction.guild.id) ?? "500"}\` currency per month

### [+] Ultimate Plus :
- All features of the Ultimate plan
- Sell Ultimate makers
- Must purchase Ultimate Maker Bot first
- - ___Price___ : \`700\` currency per week **`)
                            .setThumbnail(interaction.client.user.displayAvatarURL({dynamic : true}))

        const subscriptionEmbed_AR = new EmbedBuilder()
            .setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL({dynamic: true})})
            .setColor(botRole)
            .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true}))
            .setDescription(`** ## :bar_chart: باقات الاشتراك في خدمات البوتات :bar_chart:

### :star: | البرايم :
- بيع البوتات العادية
- ~~بيع توكنات البوتات~~
- ~~تخصيص اسم و صورة لبوتك~~
- ~~تجديد البوتات تلقائيا~~
- ~~بيع بوت واحد للكل~~
- ~~بيع ميكرات~~
- - ___السعر___ : \`${prices.get(`bot_maker_price_`+interaction.guild.id) ?? "150"}\` عملة شهريا

### :fire: | التيميت :
- بيع البوتات العادية
- بيع توكنات البوتات
- تخصيص اسم و صورة لبوتك
- تجديد البوتات تلقائيا
- بيع بوت واحد للكل
- بيع ميكرات ( برايم / بريميوم  / ~~  الـتـيـمـيـت  ~~ )
- - ___السعر___ : \`${prices.get(`bot_maker_ultimate_price_`+interaction.guild.id) ?? "500"}\` عملة شهريا

### [+] التيميت بلس :
- جميع مميزات باقة التيميت
- بيع ميكرات التيميت
- يجب شراء بوت ميكر التيميت أولاً
- - ___السعر___ : \`700\` عملة اسبوعيا **`);

        const select2 = new StringSelectMenuBuilder()
            .setCustomId('select_bot')
            .setPlaceholder('Choose subscription plan')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setEmoji(`⭐`)
                    .setLabel('Prime')
                    .setDescription('Subscribe to Prime Maker Bot')
                    .setValue('Bot_Maker_Subscribe'),
                new StringSelectMenuOptionBuilder()
                    .setEmoji(`🔥`)
                    .setLabel('Ultimate')
                    .setDescription('Subscribe to Ultimate Maker Bot')
                    .setValue('Bot_Maker_Ultimate_Subscribe'),
                new StringSelectMenuOptionBuilder()
                    .setEmoji(`❇️`)
                    .setLabel('Ultimate Plus')
                    .setDescription('Subscribe to Ultimate Plus Maker Bot')
                    .setValue('Bot_Maker_Ultimate_Plus_Subscribe'),
                new StringSelectMenuOptionBuilder()
                    .setEmoji(`🔃`)
                    .setLabel('Reset')
                    .setDescription('Reset selection')
                    .setValue('Reset_Selected'));
            const row2 = new ActionRowBuilder().addComponents(select2);

            const translateButton = new ButtonBuilder()
                .setCustomId('translate_subscribe')
                .setLabel('translate')
                .setStyle(ButtonStyle.Secondary);

            const row3 = new ActionRowBuilder()
                .addComponents(translateButton);
            
        const msg = await subscriptionRoom.send({embeds:[subscriptionEmbed], components:[row2, row3]});

        // Add collector for translate button
        const filter = i => i.customId === 'translate_subscribe';
        const collector = msg.createMessageComponentCollector({ filter });

        let isEnglish = true;
        collector.on('collect', async interaction => {
            isEnglish = !isEnglish;
            await interaction.update({
                embeds: [isEnglish ? subscriptionEmbed : subscriptionEmbed_AR],
                components: [row2, row3]
            });
        });
    }
    return interaction.editReply({content:`**تم ارسال الرسالة بنجاح**`})
}
}