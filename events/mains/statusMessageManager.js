const { Client, Collection,ActivityType, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const tokens = new Database("tokens/tokens")
const statuses = new Database("/database/settingsdata/statuses")
const prices = new Database("/database/settingsdata/prices.json")
const setting = new Database("/database/settingsdata/setting")
const botStatusDB = new Database("Json-db/Others/botStatus")

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		setInterval(() => {
            let guilds = client.guilds.cache.forEach(async(guild) => {
            let messageInfo = setting.get(`statusmessageinfo_${guild.id}`)
            if(!messageInfo) return;
            const {messageid , channelid} = messageInfo;
            const theChan = guild.channels.cache.find(ch => ch.id == channelid)
            if(!theChan || !messageid) return;
            await theChan.messages.fetch(messageid).catch(() => {return;})
            const theMsg = await theChan.messages.cache.find(ms => ms.id == messageid)
            
            // Calculate uptime first
            const totalSeconds = process.uptime();
            const days = Math.floor(totalSeconds / (3600 * 24)); 
            const remainingSecondsAfterDays = totalSeconds % (3600 * 24);
            const hours = Math.floor(remainingSecondsAfterDays / 3600);
            const remainingSecondsAfterHours = remainingSecondsAfterDays % 3600;
            const minutes = Math.floor(remainingSecondsAfterHours / 60);
            const seconds = Math.floor(remainingSecondsAfterHours % 60);

            const embed1 = new EmbedBuilder().setTitle(`**الحالة العامة للبوتات**`)
            const embed2 = new EmbedBuilder()
            const theBots = [
                {
                    name:`التقديم` , defaultPrice:40,tradeName:`apply`
                },
                {
                    name:`الاذكار`,defaultPrice:40,tradeName:`azkar`
                },
                {
                    name:`الألعاب`,defaultPrice:40,tradeName:`games`
                },
                {
                    name:`الخط التلقائي` , defaultPrice:40,tradeName:`autoline`
                },
                {
                    name:`الرومات المؤقتة` , defaultPrice:40,tradeName:`tempvoice`
                },
                {
                    name:`التحذيرات` , defaultPrice:40,tradeName:`warns`
                },
                {
                    name:`السحب`,defaultPrice:40,tradeName:`spin`
                },
                {
                    name:`المشاعر`,defaultPrice:40,tradeName:`feelings`
                },
                {
                    name:`التحكم في البرودكاست` , defaultPrice:100,tradeName:`Bc`
                },
                 {
                    name:`nadeko` , defaultPrice:40,tradeName:`nadeko`
                },
                {
                    name:`twitter` , defaultPrice:40,tradeName:`twitter`
                },
                {
                    name:`البرودكاست العادي` , defaultPrice:40,tradeName:`Broadcast2`
                },
                {
                  name:`الرومات الخاصة` , defaultPrice:70,tradeName:`privateRooms`  
                },
                {
                    name:`emoji` , defaultPrice:40,tradeName:`emoji`
                },
                {
                    name:`الاراء` , defaultPrice:40,tradeName:`feedback`
                },
                {
                    name:`الجيف اواي` , defaultPrice:40,tradeName:`giveaway`
                },
                {
                    name:`اللوج` , defaultPrice:40,tradeName:`logs`
                },
                {
                    name:`الدعوات` , defaultPrice:40,tradeName:`invites`
                },
                {
                    name:`البروبوت بريميوم الوهمي` , defaultPrice:40,tradeName:`probot`
                },
                {
                    name:`الحماية` , defaultPrice:40 , tradeName:`protect`
                },
                {
                    name:`الالوان` , defaultPrice:70 , tradeName:`color`
                },
                {
                    name:`التوثيق` , defaultPrice:40,tradeName:`verify`
                },
                {
                    name:`الاقتراحات` , defaultPrice:40,tradeName:`suggestions`
                },
                {
                    name:`السيستم` , defaultPrice:100 , tradeName:`system`
                },
                {
                    name:`الضريبة` , defaultPrice:40,tradeName:`tax`
                },
                {
                    name:`التكت` , defaultPrice:160,tradeName:`ticket`
                },
                {
                    name:`الشوب` , defaultPrice:70,tradeName:`shop`
                },
                {
                    name : `واحد للكل` , defaultPrice:200,tradeName:`one4all`
                }
            ]
        const embedFields = [];
        theBots.forEach(async(theBot) => {
            let theBotTokens = tokens.get(theBot.tradeName) ?? 0;
            let theBotStats = statuses.get(theBot.tradeName) ?? true;
            embedFields.push({
                name: `**بوتات ${theBot.name} ${botStatusDB.get(theBot.tradeName) === "off" ? "🔴" : "🟢"}**`,
                value: `**السعر في السيرفر : \`${prices.get(theBot.tradeName+`_price_`+guild.id) ?? theBot.defaultPrice}\` عملة**\nعدد البوتات العامة : \`${theBotTokens.length ?? 0}\``,
                inline: false
            });
        });

        // Split fields into chunks of 25
        const chunks = [];
        for (let i = 0; i < embedFields.length; i += 25) {
            chunks.push(embedFields.slice(i, i + 25));
        }

        // Create an embed for each chunk
        const embeds = chunks.map((chunk, index) => {
            const embed = new EmbedBuilder()
                .setTitle(`**الحالة العامة للبوتات ${index + 1}/${chunks.length}**`)
                .setColor('Random')
                .setThumbnail(guild.iconURL({dynamic:true}))
                .setFooter({text:guild.name, iconURL:guild.iconURL({dynamic:true})})
                .addFields(...chunk);
            return embed;
        });

        // Add the uptime embed
        const uptimeEmbed = new EmbedBuilder()
            .addFields(
                {
                    name:`**تم الرفع لمدة :**`,
                    inline:false,
                    value:`**\`${days}\` Days,\`${hours}\` Hours , \`${minutes}\` Minutes , \`${seconds}\` Seconds  بدون انقطاع**`
                }
            )
            .setColor('Random')
            .setThumbnail(guild.iconURL({dynamic:true}))
            .setFooter({text:guild.name, iconURL:guild.iconURL({dynamic:true})});

        embeds.push(uptimeEmbed);

        try {
            await theMsg.edit({embeds: embeds});
        } catch (error) {
            return;
        }
        embed2.addFields(
            {
                name:`**تم الرفع لمدة :**` , inline:false,value:`**\`${days}\` Days,\`${hours}\` Hours , \`${minutes}\` Minutes , \`${seconds}\` Seconds  بدون انقطاع**`
            }
        )
        embed1.setColor('Random')
        embed1.setThumbnail(guild.iconURL({dynamic:true}))
        embed1.setFooter({text:guild.name , iconURL:guild.iconURL({dynamic:true})})

        embed2.setColor('Random')
        embed2.setThumbnail(guild.iconURL({dynamic:true}))
        embed2.setFooter({text:guild.name , iconURL:guild.iconURL({dynamic:true})})
    
            try {
                await theMsg.edit({embeds:[embed1 , embed2]});
            } catch {
                return;
            }
        })
        }, 60 * 1000);
	},
};