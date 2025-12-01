const { Database } = require('st.db')
const botStatusDB = new Database("Json-db/Others/botStatus")
const tokens = new Database("tokens/tokens")
const { readdirSync } = require("fs")
const path = require('path');

// ------------- حالة البوتات العادية -------------------//
// ------------------------------------------------//
var AsciiTable = require('ascii-table')
const tablee = new AsciiTable('Normal Bots')
tablee.setHeading('' , 'Type' , 'Length' ,'Status')

checkStatus(`ticket` , '../../Bots/ticket/ticket-Bots' , 10_000)
checkStatus(`Bc` , '../../Bots/Broadcast/Broadcast-Bots' , 10_000)
checkStatus(`Broadcast2` , '../../Bots/NormalBroadcast/Broadcast-Bots' , 10_000)
checkStatus(`apply` , '../../Bots/apply/apply-Bots' , 10_000)
checkStatus(`ai` , '../../Bots/twitter/twitter-Bots' , 10_000)
checkStatus(`autoline` , '../../Bots/autoline/autoline-Bots' , 10_000)
checkStatus(`azkar` , '../../Bots/azkar/azkar-Bots' , 10_000)
checkStatus(`tempvoice` , '../../Bots/tempvoice/tempvoice-Bots' , 10_000)
checkStatus(`feedback` , '../../Bots/feedback/feedback-Bots' , 10_000)
checkStatus(`giveaway` , '../../Bots/giveaway/giveaway-Bots' , 10_000)
checkStatus(`logs` , '../../Bots/logs/logs-Bots' , 10_000)
checkStatus(`invites` , '../../Bots/invites/invites-Bots' , 10_000)
checkStatus(`offers` , '../../Bots/offers/offers-Bots' , 10_000)
checkStatus(`nadeko` , '../../Bots/nadeko/nadeko-Bots' , 10_000)
checkStatus(`one4all` , '../../Bots/one4all/One4all-Bots' , 10_000)
checkStatus(`mention` , '../../Bots/mention/mention-Bots' , 10_000)
checkStatus(`spin` , '../../Bots/spin/spin-Bots' , 10_000)
checkStatus(`privateRooms` , '../../Bots/privateRooms/privateRooms-Bots' , 10_000)
checkStatus(`protect` , '../../Bots/protect/protect-Bots' , 10_000)
checkStatus(`games` , '../../Bots/games/games-Bots' , 10_000)
checkStatus(`emoji` , '../../Bots/emoji/emoji-Bots' , 10_000)
checkStatus(`color` , '../../Bots/color/color-Bots' , 10_000)
checkStatus(`warns` , '../../Bots/warns/warns-Bots' , 10_000) // Added warns!
checkStatus(`shop` , '../../Bots/shop/Shop-Bots' , 10_000)
checkStatus(`verify` , '../../Bots/verify/verify-Bots' , 10_000)
checkStatus(`feelings` , '../../Bots/feelings/feelings-Bots' , 10_000)
checkStatus(`suggestions` , '../../Bots/suggestions/suggestions-Bots' , 10_000)
checkStatus(`system` , '../../Bots/system/system-Bots' , 10_000)
checkStatus(`tax` , '../../Bots/tax/Tax-Bots' , 10_000)

function checkStatus(type , filePath , interval) {
	let theInterval = interval || 5_000
	setInterval(() => {
		const sta = botStatusDB.get(type);
		if(sta === "off"){
		}else{
			require(filePath)
		}
	}, theInterval);
}

const theBots = [
    {
        name:`التقديم` , defaultPrice:40,tradeName:`apply`
    },
    {
        name:`التحذيرات` , defaultPrice:40,tradeName:`warns` // Added warns!
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
        name:`السحب`,defaultPrice:40,tradeName:`spin`
    },
    {
        name:`المشاعر`,defaultPrice:40,tradeName:`feelings`
    },
    {
        name:`twitter` , defaultPrice:40,tradeName:`twitter`
    },
    {
        name:`التحكم في البرودكاست` , defaultPrice:100,tradeName:`Bc`
    },
    {
        name:`البرودكاست العادي` , defaultPrice:40,tradeName:`Broadcast2`
    },
    {
      name:`الرومات الخاصة` , defaultPrice:70,tradeName:`privateRooms`  
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
        name:`nadeko` , defaultPrice:40,tradeName:`nadeko`
    },
    {
        name:`الحماية` , defaultPrice:40 , tradeName:`protect`
    },
    {
        name:`شراء الالوان` , defaultPrice:70 , tradeName:`color`
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
        name:`العروض` , defaultPrice:40,tradeName:`offers`
    },
    {
        name:`mention` , defaultPrice:70,tradeName:`mention`
    },
    {
        name:`emoji` , defaultPrice:200,tradeName:`emoji`
    },
    {
        name : `واحد للكل` , defaultPrice:200,tradeName:`one4all`
    },
    {
        name:`التوثيق` , defaultPrice:40,tradeName:`verify`
    }
]

theBots.forEach(async(bot , index) => {
    let theBotTokens = await tokens.get(bot.tradeName) || []

    tablee.addRow(index + 1, bot.tradeName , `${theBotTokens.length ?? 0}`, `${botStatusDB.get(bot.tradeName)  === "off" ? "🔴 Not Working" : "🟢 Working"}`);
})

setTimeout(() => {
    console.log(tablee.toString());
}, 5_000);
// ------------------------------------------------//

//--------------- حالة بوتات الميكر --------------//
// ------------------------------------------------//
const ultimateBotsPath = path.resolve(__dirname, '../../ultimateBots/');

setInterval(() => {
    if(botStatusDB.get(`premuimMaker`) === "off"){

    }else{
        for (let folder of readdirSync('premiumBots/').filter(folder => !folder.includes('.'))) {
            for (let file of readdirSync('premiumBots/' + folder).filter(f => f.endsWith('.js'))) {
                const event = require(`../../premiumBots/${folder}/${file}`);
            }
          }
          for (let folder of readdirSync('premiumBots/').filter(folder => folder.endsWith('.js'))) {
                const event = require(`../../premiumBots/${file}`);
            }
    }    
}, 5_000);

setInterval(() => {
    for (let folder of readdirSync('ultimateBots/').filter(folder => !folder.includes('.'))) {
		for (let file of readdirSync('ultimateBots/' + folder).filter(f => f.endsWith('.js'))) {
			const event = require(`../../ultimateBots/${folder}/${file}`);
		}
	  }
	  for (let folder of readdirSync('ultimateBots/').filter(folder => folder.endsWith('.js'))) {
			const event = require(`../../ultimateBots/${file}`);
		}
}, 5_000);
// ------------------------------------------------//