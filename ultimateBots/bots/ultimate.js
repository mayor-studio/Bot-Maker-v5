const { client,Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { readdirSync } = require("fs")
const colors = require('colors');
const moment = require("moment");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const path = require('node:path');
const fs = require('node:fs');
const mongodb = require('mongoose');
const ms = require("ms")
var prettySeconds = require('pretty-seconds');
const mainBot = require('../../index')
const { Database } = require("st.db")
const tokens = new Database("tokens/tokens")
const tier3subscriptions = new Database("/database/makers/tier3/subscriptions")
const botStatusDB = new Database("Json-db/Others/botStatus")
const setting = new Database("/database/settingsdata/setting")
const usersdata = new Database(`/database/usersdata/usersdata`);
const subs = tier3subscriptions.get(`tier3_subs`);
const tier3subscriptionsplus = new Database("/database/makers/tier3/plus")
const statuses = new Database("/database/settingsdata/statuses")
const prices = new Database("/database/settingsdata/prices.json")
const { WebhookClient } = require('discord.js')
const { makerSubsLogsWebhookUrl } = require('../../config.json');
const webhookClient = new WebhookClient({ url : makerSubsLogsWebhookUrl });
var AsciiTable = require('ascii-table')
const tablee = new AsciiTable('Ultimate makers')
tablee.setHeading('' , 'UserName' , 'Bot ID' , 'Owner' , 'Guild ID' , 'timeleft' , 'Status')

const ultimateClients = new Map();

if(!subs) return;
if(subs.length < 0) return;
let currentIndex = 0;
subs.forEach(async(sub) => {
    let {token , owner , guildid , prefix , timeleft} = sub;
    const client3 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
	client3.setMaxListeners(999999)
	client3.commandaliases = new Collection()
    const rest = new REST({ version: '10' }).setToken(token);
    module.exports = client3;

    // Store client reference
    ultimateClients.set(guildid, client3);

    // Add reconnection logic
    async function reconnectClient() {
        try {
            await client3.login(token);
            console.log(`✅ Ultimate Maker reconnected for guild: ${guildid}`);
            tablee.addRow(`${currentIndex}`, `${client3.user.username}`, `${client3.user.id}`, `${owner}`, `${guildid}`, `${prettySeconds(timeleft)}`, `🟢 ONLINE`);
        } catch (err) {
            console.error(`❌ Failed to reconnect Ultimate Maker for guild: ${guildid}`);
            tablee.addRow(`${currentIndex}`, `Undefined`, `Undefined`, `${owner}`, `${guildid}`, `${prettySeconds(timeleft)}`, `🔴 OFFLINE`);
            // Try again in 5 seconds
            setTimeout(reconnectClient, 5000);
        }
    }

    client3.on('disconnect', () => {
        console.log(`Ultimate Maker disconnected for guild: ${guildid}, attempting reconnect...`);
        reconnectClient();
    });

    // Initial login
    client3.login(token).then(e => {
        currentIndex++;
        tablee.addRow(`${currentIndex}`, `${client3.user.username}`, `${client3.user.id}`, `${owner}`, `${guildid}`, `${prettySeconds(timeleft)}`, `🟢 ONLINE`);
    }).catch(err => {
        currentIndex++;
        tablee.addRow(`${currentIndex}`, `Undefined`, `Undefined`, `${owner}`, `${guildid}`, `${prettySeconds(timeleft)}`, `🔴 OFFLINE`);
        // Try reconnecting if initial login fails
        setTimeout(reconnectClient, 5000);
    });

        client3.on("ready" , async() => {
            setInterval(async() => {
				const subs2 = tier3subscriptions.get(`tier3_subs`);
				if(!subs2) return;
                const sub = subs2.find(su => su.guildid == guildid)
				if(!sub) return;
                const theTimeleft = sub.timeleft;
				if(theTimeleft === 259200){
					await client3.users.fetch(owner);
                    const theowner = client3.users.cache.find(us => us.id == owner);
                    const warnEmbed = new EmbedBuilder()
                    .setTitle(`🔔 تنبيه باقتراب انتهاء الاشتراك 🔔`)
					.setColor('Yellow') 
                    .setDescription(`** مرحبًا [${theowner.username}]،
نود إبلاغك بأن انتهاء اشتراك بوت الميكر الالتيميت الخاص بك سيكون خلال 3 أيام.
يرجى التفكير في تجديد الاشتراك قبل انتهاء المدة لضمان استمرار الخدمة.
شكرًا لتفهمك!**`)
                    .setTimestamp();
                    await theowner.send({embeds:[warnEmbed]}).catch(() => {return;})

					await webhookClient.send({ embeds: [
							new EmbedBuilder()
									.setTitle(`🔔 تنبيه باقتراب انتهاء الاشتراك 🔔`)
									.setColor('Yellow')
									.addFields(
										{name : `الاشتراك :` , value : `\`\`\`التيميت\`\`\`` , inline : true},
										{name : `السيرفر` , value : `\`\`\`${guildid}\`\`\`` , inline : true},
										{name : `صاجب الاشتراك` , value : `\`\`\`${owner}\`\`\`` , inline : true},
										{name : `ايدي البوت :` , value : `\`\`\`${client3.user.id}\`\`\`` , inline : true},
										{name : `توكن البوت :` , value : `\`\`\`${token}\`\`\`` , inline : true},
										{name : `الوقت المتبقي :` , value : `\`\`\`${prettySeconds(timeleft)}\`\`\`` , inline : true},
										
									)
									.setTimestamp()
								] }).catch((err) => {return;});
				}
                if(theTimeleft == 0) {
                    await client3.users.fetch(owner);
                    const theowner = client3.users.cache.find(us => us.id == owner);
                    const endEmbed = new EmbedBuilder()
                    .setTitle(`🚨 **تنبيه بانتهاء الاشتراك** 🚨`)
					.setColor('Red')
                    .setDescription(`**انتهى اشتراك البوت ميكر التيميت الخاص بك. يمكنك إعادة الشراء مجددًا دون فقدان أي من البيانات.** \n \`\`\`شكرًا لاختيارك خدماتنا! نحن نقدر دعمك وثقتك بنا\`\`\``)
                    .setTimestamp();
                    const sub4 = tier3subscriptionsplus.get(`plus`)
                    if(sub4){
	                const filtered = await sub4.filter(su => su.guildid != guildid)
					await tier3subscriptionsplus.set(`plus` , filtered)
					}
                    await theowner.send({embeds:[endEmbed]}).catch(() => {return;})

					await webhookClient.send({ embeds: [
							new EmbedBuilder()
									.setTitle(`🚨 **تنبيه بانتهاء الاشتراك** 🚨`)
									.setColor('Red')
									.addFields(
										{name : `الاشتراك :` , value : `\`\`\`التيميت\`\`\`` , inline : true},
										{name : `السيرفر` , value : `\`\`\`${guildid}\`\`\`` , inline : true},
										{name : `صاجب الاشتراك` , value : `\`\`\`${owner}\`\`\`` , inline : true},
										{name : `ايدي البوت :` , value : `\`\`\`${client3.user.id}\`\`\`` , inline : true},
										{name : `توكن البوت :` , value : `\`\`\`${token}\`\`\`` , inline : true},										
									)
									.setTimestamp()
								] }).catch((err) => {return;});
					
                    await client3.destroy();
                }
				const sub3 = tier3subscriptionsplus.get(`plus`)
				if(!sub3) return;
				const theSubGet = sub3.find(ch => ch.guildid == guildid)
				if(!theSubGet) return;
				const theTimeleft2 = theSubGet.timeleft;
				theSubGet.timeleft = theTimeleft2 - 1
				await tier3subscriptionsplus.set(`plus` , sub3)
				if(theTimeleft2 <= 0) {

					await webhookClient.send({ embeds: [
							new EmbedBuilder()
									.setTitle(`🚨 **انتهاء اشتراك** 🚨`)
									.setColor('Red')
									.addFields(
										{name : `الاشتراك :` , value : `\`\`\`التيميت بلس\`\`\`` , inline : true},
										{name : `السيرفر` , value : `\`\`\`${theSubGet.guildid}\`\`\`` , inline : true},								
									)
									.setTimestamp()
								] }).catch((err) => {return;});
					

					const filtered = await sub3.filter(su => su.guildid != guildid)
					await tier3subscriptionsplus.set(`plus` , filtered)
				}
            }, 1000);
            try {
                await rest.put(
                    Routes.applicationCommands(client3.user.id),
                    { body: premiumSlashCommands },
                );
            } catch (error) {
                console.error(error);
            }
        })

		client3.on("ready" , async() => {
			setInterval(() => {
				let guilds = client3.guilds.cache.forEach(async(guild) => {
				let messageInfo = setting.get(`statusmessageinfo_${guild.id}`)
				if(!messageInfo) return;
				const {messageid , channelid} = messageInfo;
				const theChan = guild.channels.cache.find(ch => ch.id == channelid)
                if(!theChan || !messageid) return;
				await theChan.messages.fetch(messageid).catch(() => {return;})
				const theMsg = await theChan.messages.cache.find(ms => ms.id == messageid)
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
						name:`القرأن`,defaultPrice:40,tradeName:`quran`
					},
					{
						name:`الخط التلقائي` , defaultPrice:40,tradeName:`autoline`
					},
					{
						name:`البلاك ليست` , defaultPrice:40,tradeName:`blacklist`
					},
					{
						name:`الطلبات`,defaultPrice:40,tradeName:`orders`
					},
					{
						name:`رومات الشوب`,defaultPrice:40,tradeName:`shopRooms`
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
						name:`الكريدت الوهمي` , defaultPrice:40,tradeName:`credit`
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
						name:`الناديكو` , defaultPrice:40,tradeName:`nadeko`
					},
					{
						name:`البروبوت بريميوم الوهمي` , defaultPrice:40,tradeName:`probot`
					},
					{
						name:`الحماية` , defaultPrice:40 , tradeName:`protect`
					},
					{
						name:`شراء الرتب` , defaultPrice:70 , tradeName:`roles`
					},
					{
						name:`النصابين` , defaultPrice:40,tradeName:`scam`
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
			theBots.forEach(async(theBot) => {
				let theBotTokens = tokens.get(theBot.tradeName) ?? 0
				let theBotStats = statuses.get(theBot.tradeName) ?? true
				embed1.addFields(
					{
						name:`**بوتات ${theBot.name} ${botStatusDB.get(theBot.tradeName) === "off" ? "🔴" : "🟢"}**` , value:`**السعر في السيرفر : \`${prices.get(theBot.tradeName+`_price_`+guild.id) ?? theBot.defaultPrice}\` عملة**\nعدد البوتات العامة : \`${theBotTokens.length ?? 0}\`` , inline:false
					}
				)
			})
			const totalSeconds = process.uptime();
	const days = Math.floor(totalSeconds / (3600 * 24)); 
	const remainingSecondsAfterDays = totalSeconds % (3600 * 24);
	const hours = Math.floor(remainingSecondsAfterDays / 3600);
	const remainingSecondsAfterHours = remainingSecondsAfterDays % 3600;
	const minutes = Math.floor(remainingSecondsAfterHours / 60);
	const seconds = Math.floor(remainingSecondsAfterHours % 60);
    embed2.addFields(
        {
            name:`**تم الرفع لمدة :**` , inline:false,value:`**\`${days}\` Days,\`${hours}\` Hours , \`${minutes}\` Minutes , \`${seconds}\` Seconds  بدون انقطاع**`
        }
			)
			embed1.setColor("Random")
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
		})

client3.on("messageCreate" , async(message) => {
    const subs2 = tier3subscriptions.get(`tier3_subs`);
    const sub = subs2.find(su => su.guildid == guildid)
    if(!sub) return;

    if(message.content == `<@${client3.user.id}>`) {
        if(message.author.bot) return;
        return message.reply({content:`**Hello In <@${client3.user.id}> , Im Using / Commands**`})
    }

  if (message.content === prefix + 'boost') {
    try {
        // Remove the Canvas part and use embeds only

        // Utility for embed creation
        function createBoostEmbed({ text, color, icon = null }) {
            return {
                embeds: [
                    {
                        title: "🎉 Boost Reward",
                        description: text,
                        color: parseInt(color.replace('#', ''), 16),
                        author: {
                            name: message.author.username,
                            icon_url: message.author.displayAvatarURL(),
                        },
                        footer: {
                            text: 'Powered by MAYOR STUDIO',
                        },
                        thumbnail: icon ? { url: icon } : undefined,
                        timestamp: new Date().toISOString(),
                    }
                ]
            };
        }

        // Not a booster
        if (!message.member.premiumSince) {
            return message.reply(createBoostEmbed({
                text: '❌ يجب ان تكون من داعمين السيرفر!',
                color: '#F04747'
            }));
        }

        const lastClaim = usersdata.get(`lastBoostClaim_${message.author.id}_${message.guild.id}`);
        const now = Date.now();
        if (lastClaim && now - lastClaim < 604800000) {
            return message.reply(createBoostEmbed({
                text: '❌ لقد حصلت على مكافأة البوست مسبقاً، يرجى الانتظار 7 ايام!',
                color: '#F04747'
            }));
        }

        const boosterCoins = settings.get(`booster_coins_${message.guild.id}`);
        if (!boosterCoins || boosterCoins <= 0) {
            return message.reply(createBoostEmbed({
                text: '❌ لم يتم تحديد مكافأة البوست بعد!',
                color: '#F04747'
            }));
        }

        // Update Balance
        const currentBalance = usersdata.get(`balance_${message.author.id}_${message.guild.id}`) || 0;
        const newBalance = currentBalance + parseInt(boosterCoins);

        await usersdata.set(`balance_${message.author.id}_${message.guild.id}`, newBalance);
        await usersdata.set(`lastBoostClaim_${message.author.id}_${message.guild.id}`, now);

        console.log(`Booster reward given: ${boosterCoins} to user ${message.author.tag}`);

        return message.reply(createBoostEmbed({
            text: `✅ تم اضافة ${boosterCoins} عملة الى حسابك!`,
            color: '#43B581'
        }));

    } catch (error) {
        console.error('Error in boost command:', error);
        return message.reply({
            embeds: [{
                title: "❌ حدث خطأ اثناء اضافة العملات",
                color: parseInt('FF5555', 16),
                description: '',
                footer: { text: 'Powered by MAYOR STUDIO' },
                timestamp: new Date().toISOString(),
            }]
        });
    }
}
    
    if(message.content.startsWith(prefix + 'box')) {
        if(!message.member.permissions.has('Administrator')) return message.reply('❌ يجب ان تكون اداري!');
        
        const amount = parseInt(message.content.split(' ')[1]);
        if(!amount || isNaN(amount)) return message.reply('❌ الرجاء تحديد رقم صحيح!');

        const giftEmbed = new EmbedBuilder()
            .setTitle('🎁 صندوق هدية')
            .setDescription(`اول شخص يضغط يحصل على ${amount} عملة!\nاضغط على الزر للحصول على الهدية!`)
            .setColor('#FFD200')
            .setTimestamp();

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`claim_${amount}_${Date.now()}`)
                    .setLabel('احصل على الهدية! 🎁')
                    .setStyle('Primary')
            );

        await message.channel.send({ embeds: [giftEmbed], components: [button] });
    }
});

const helpCategories = {
  general: {
    title: 'General Commands',
    commands: [
            { name: '$boost', description: 'To get the Boost Reward' },
            { name: '$help', description: 'to show the help menu' },
            { name: '/discount-codes', description: 'Show all available discount codes' },
            { name: '/buy-coins', description: 'to buy coins use this command' },
            { name: '/coins', description: 'View your balance or another user\'s balance' },
            { name: '/subscription-time', description: 'To check the subscription info' },

    ]
  },
  moderation: {
    title: 'Moderation Commands',
    commands: [
            { name: '$box', description: 'make a gift for coins' },
            { name: '/create-discount-code', description: 'Create a new discount code' },
            { name: '/delete-discount-code', description: 'Delete a discount code' },
            { name: '/add-coins', description: 'Add coins to a user' },
            { name: '/remove-coins', description: 'Remove coins from a user' },
            { name: '/reset-all-coins', description: 'Reset balance for all members' },
            { name: '/change-balance-price', description: 'change price of the coins' },
            { name: '/remove-days', description: 'Remove days from a subscription' },
            { name: '/renew-subscription', description: 'To renew a subscription' },
            { name: '/set-avatar', description: 'set avatar bot' },
            { name: '/transfer-owner', description: 'transfer sub owner' },
            { name: '/transfer-server', description: 'transfer sub server' },
            { name: '/plus', description: 'Change sub to Ultimate Plus' },
            { name: '/change-price', description: 'change a bot price' },
            { name: '/send-buy-bot-panel', description: 'Send Bot and subs Panel' },
            { name: '/control-panel', description: 'Send the bot control Panel' },
            { name: '/setup', description: 'Setup the maker system' },
            { name: '/set-booster', description: 'Set the booster gift coins' }
    ]
  }
};

client3.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'help') {
    const guildIcon = message.guild?.iconURL({ dynamic: true, size: 256 }) 
      || client.user.displayAvatarURL();

    const embed = new EmbedBuilder()
      .setTitle('Help Menu')
      .setDescription('Select a category below to view commands.')
      .setThumbnail(guildIcon)
      .setColor(0x5865F2);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_menu')
      .setPlaceholder('Select a category')
      .addOptions([
        {
          label: 'General',
          description: 'General commands',
          value: 'general'
        },
        {
          label: 'Moderation',
          description: 'Moderation commands',
          value: 'moderation'
        }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

// Interaction handler for select menu
client3.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'help_menu') return;

  const category = interaction.values[0];
  const selected = helpCategories[category];

  if (!selected) return;

  const guildIcon = interaction.guild?.iconURL({ dynamic: true, size: 256 }) 
    || interaction.client.user.displayAvatarURL();

  const embed = new EmbedBuilder()
    .setTitle(selected.title)
    .setDescription(selected.commands.map(cmd => `\`${cmd.name}\` - ${cmd.description}`).join('\n'))
    .setThumbnail(guildIcon)
    .setColor(0x5865F2);

  await interaction.update({
    embeds: [embed],
    components: [interaction.message.components[0]] // keep the menu
  });
});
// Add button interaction handler
client3.on('interactionCreate', async interaction => {
    if(!interaction.isButton()) return;
    
    if(interaction.customId.startsWith('claim_')) {
        const [, amount] = interaction.customId.split('_');
        
        const currentBalance = usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`) || 0;
        usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, currentBalance + parseInt(amount));

        const claimedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setDescription(`🎉 ${interaction.user} حصل على ${amount} عملة!`)
            .setColor('#43B581');

        await interaction.update({ 
            embeds: [claimedEmbed], 
            components: [] 
        });
    }
});

        client3.premiumSlashCommands = new Collection()
const premiumSlashCommands = [];
 const ascii = require('ascii-table');
const { setMaxListeners } = require("events");
const table = new ascii('Owner Commands').setJustify();
try {
	const commandsDir = path.join(__dirname, '../commands'); // Resolve the directory path
	if (!fs.existsSync(commandsDir)) {
	  throw new Error(`'../commands/' directory does not exist.`);
	}
  
	const folders = fs.readdirSync(commandsDir);
  
	for (let folder of folders.filter(folder => !folder.includes('.'))) {
	  const folderPath = path.join(commandsDir, folder);
	  const files = fs.readdirSync(folderPath);
  
	  for (let file of files.filter(f => f.endsWith('.js'))) {
		let command = require(path.join(folderPath, file));
		if (command) {
		  premiumSlashCommands.push(command.data.toJSON());
		  client3.premiumSlashCommands.set(command.data.name, command);
		  if (command.data.name) {
			table.addRow(`/${command.data.name}`, '🟢 Working');
		  } else {
			table.addRow(`/${command.data.name}`, '🔴 Not Working');
		  }
		}
	  }
	}
  } catch (err) {
	console.error("An error occurred:", err);
  }

  try {
	const eventsDir = path.join(__dirname, '../events'); // Resolve the directory path
  
	if (!fs.existsSync(eventsDir)) {
	  throw new Error(`'../events/' directory does not exist.`);
	}
  
	const folders = fs.readdirSync(eventsDir);
  
	for (let folder of folders.filter(folder => !folder.includes('.'))) {
	  const folderPath = path.join(eventsDir, folder);
	  const files = fs.readdirSync(folderPath);
  
	  for (let file of files.filter(f => f.endsWith('.js'))) {
		const event = require(path.join(folderPath, file));
		if (event.once) {
		  client3.once(event.name, (...args) => event.execute(...args));
		} else {
		  client3.on(event.name, (...args) => event.execute(...args));
		}
	  }
	}
  } catch (err) {
	console.error("An error occurred:", err);
  }

  try {
	const buttonsDir = path.join(__dirname, '../../buttons'); // Resolve the directory path
  
	if (!fs.existsSync(buttonsDir)) {
	  throw new Error(`'../../buttons/' directory does not exist.`);
	}
  
	const folders = fs.readdirSync(buttonsDir);
  
	for (let folder of folders.filter(folder => !folder.includes('.'))) {
	  const folderPath = path.join(buttonsDir, folder);
	  const files = fs.readdirSync(folderPath);
  
	  for (let file of files.filter(f => f.endsWith('.js'))) {
		const event = require(path.join(folderPath, file));
		if (event.once) {
		  client3.once(event.name, (...args) => event.execute(...args));
		} else {
		  client3.on(event.name, (...args) => event.execute(...args));
		}
	  }
	}
  } catch (err) {
	console.error("An error occurred:", err);
  }
  
client3.on('ready' , async() => {
	const subs2 = tier3subscriptions.get(`tier3_subs`);
	const sub = subs2.find(su => su.guildid == guildid)
	if(!sub) return;
	try {
		let guilds = client3.guilds.cache.forEach(async(guild) => {
		let subscriptions1 = tier3subscriptions.get(`tier3_subs`)
		if(!subscriptions1) {
			await tier3subscriptions.set(`tier3_subs` , [])
		}
		let filtered = subscriptions1.find(a => a.guildid == guild.id)
		if(!filtered) {
			if(guild.id == guildid) return;
			await guild.leave();
		}
	})
	} catch (error) {
		return
	}
	
})
client3.on("messageCreate" , async(message) => {
	const subs2 = tier3subscriptions.get(`tier3_subs`);
	const sub = subs2.find(su => su.guildid == guildid)
	if(!sub) return;
	if(message.content == `<@${client3.user.id}>`) {
		if(message.author.bot) return;
		return message.reply({content:`**Hello In <@${client3.user.id}> , Im Using / Commands**`})
	}
})
//======= -------- =========//
  //guildCreate
  client3.on("guildCreate", async (guild) => {
    const owner = await client3.users.fetch(guild.ownerId);
    const ownerUsername = owner ? owner.username : "Unknown";
    const { WebhookClient } = require('discord.js')
    const { joinLeaveWebhookUrl } = require('../../config.json');
    const webhookClient = new WebhookClient({ url : joinLeaveWebhookUrl });

    const joinsEmbed = new EmbedBuilder()
      .setTitle("Bot Maker Ultimate")
      .setColor("Purple")
      .setDescription(`Joined: ${guild.name}\nOwner Mention: <@${guild.ownerId}>\nOwner user: ${ownerUsername}\Bot name: ${client3.user.username} \nBot ID: ${client3.user.id}`);

    await webhookClient.send({ embeds: [joinsEmbed] }).catch(() => {return;});

	const subs2 = tier3subscriptions.get(`tier3_subs`);
	const sub = subs2.find(su => su.guildid == guildid)
	if(!sub) return;
	let subscriptions1 = tier3subscriptions.get(`tier3_subs`)
		let filtered = subscriptions1.find(a => a.guildid == guild.id)
		if(!filtered) {
			if(guild.id == guildid) return;
			await guild.leave();
		}

  });

  //GuildDelete
  client3.on("guildDelete", async (guild) => {
    const owner = await client3.users.fetch(guild.ownerId);
    const ownerUsername = owner ? owner.username : "Unknown";
    const { WebhookClient } = require('discord.js')
    const { joinLeaveWebhookUrl } = require('../../config.json');
    const webhookClient = new WebhookClient({ url : joinLeaveWebhookUrl });

    const joinsEmbed = new EmbedBuilder()
      .setTitle("Bot Maker Ultimate")
      .setColor("DarkPurple")
      .setDescription(`Left: ${guild.name}\nOwner Mention: <@${guild.ownerId}>\nOwner user: ${ownerUsername}\Bot name: ${client3.user.username} \nBot ID: ${client3.user.id}`);

    await webhookClient.send({ embeds: [joinsEmbed] }).catch(() => {return;});
  });

//-------

})

setTimeout(async() => {
	console.log(tablee.toString())
}, 35_000);

process.on('SIGINT', async () => {
    console.log('Gracefully shutting down Ultimate Makers...');
    for (const [guildid, client] of ultimateClients.entries()) {
        try {
            await client.destroy();
            console.log(`Destroyed Ultimate Maker for guild: ${guildid}`);
        } catch (err) {
            console.error(`Error destroying Ultimate Maker for guild: ${guildid}`, err);
        }
    }
    process.exit(0);
});