const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const quiz = JSON.parse(fs.readFileSync('Bots/games/handlers/quiz.json', 'utf8'))
const gamesDB = new Database("/Json-db/Bots/gamesDB.json")

let games = tokens.get(`games`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuyGames_Modal") {
            await interaction.deferReply({ephemeral:true})
            let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`))
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            
            const client26 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try{
              const owner = interaction.user.id
                let price1 = prices.get(`games_price_${interaction.guild.id}`) || 40;
                price1 = parseInt(price1)
                const newbalance = parseInt(userbalance) - parseInt(price1)
                await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newbalance)

                function generateRandomCode() {
                    const characters = 'AquranDEFGHIJKLMNOPQRSTUVWXYZaqurandefghijklmnopqrstuvwxyz0123456789';
                    let code = '';
                    for (let i = 0; i < 12; i++) {
                      if (i > 0 && i % 4 === 0) {
                        code += '-';
                      }
                      const randomIndex = Math.floor(Math.random() * characters.length);
                      code += characters.charAt(randomIndex);
                    }
                    return code;
                  }
                  const invoice = generateRandomCode();
                let doneembeduser = new EmbedBuilder()
                .setTitle(`**تم انشاء بوتك بنجاح**`)
                .setDescription(`**معلومات الفاتورة :**`)
                .addFields(
                    {
                        name:`**الفاتورة**`,value:`**\`${invoice}\`**`,inline:false
                    },
                    {
                        name:`**نوع البوت**`,value:`**\`Games Bot\`**`,inline:false
                    },
                    {
                        name:`**توكن البوت**`,value:`**\`${Bot_token}\`**`,inline:false
                    },
                    {
                        name:`**البريفكس**`,value:`**\`${Bot_prefix}\`**`,inline:false
                    }
                )
                await invoices.set(`${invoice}_${interaction.guild.id}` , 
                {
                    type:`العاب`,
                    token:`${Bot_token}`,
                    prefix:`${Bot_prefix}`,
                    userid:`${interaction.user.id}`,
                    guildid:`${interaction.guild.id}`,
                    serverid:`عام`,
                    price:price1
                })
                const { REST } = require('@discordjs/rest');
                const rest = new REST({ version: '10' }).setToken(Bot_token);
                const { Routes } = require('discord-api-types/v10');
                client26.on('ready' , async() => {
                  
                  const thebut = new ButtonBuilder()
                    .setLabel(`دعوة البوت`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client26.user.id}&permissions=8&scope=bot%20applications.commands`);

            const supportButton = new ButtonBuilder()
              .setLabel('سيرفر الدعم')
              .setStyle(ButtonStyle.Link)
              .setURL('https://discord.gg/JRRwcxMyry'); // Replace with your support server invite

            const youtubeButton = new ButtonBuilder()
              .setLabel('يوتيوب')
              .setStyle(ButtonStyle.Link)
              .setURL('https://youtube.com/@3mran77'); // Replace with your YouTube channel

                  const rowss = new ActionRowBuilder().addComponents(thebut, supportButton, youtubeButton);
                  await interaction.user.send({embeds:[doneembeduser] , components:[rowss]})
                })
                let doneembedprove = new EmbedBuilder()
                    .setColor('Aqua')
                    .setTitle('عملية شراء جديدة')
                    .addFields(
                        {name: 'المشتري', value: `${interaction.user} | \`${interaction.user.tag}\``, inline: true},
                        {name: 'نوع البوت', value: '`**Games Bot**`', inline: true},
                        {name: 'رصيد العضو', value: `\`${newbalance}\``, inline: true},
                        {name: 'سعر البوت', value: `\`${price1}\``, inline: true}
                    )
                    .setImage(interaction.guild.banner ? interaction.guild.bannerURL({ dynamic: true, size: 1024 }) : null)
                    .setFooter({ text: `Developed by ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })                    .setThumbnail(interaction.user.displayAvatarURL({dynamic: true}))
                    .setTimestamp();

                const profileButton = new ButtonBuilder()
                    .setLabel('Profile')
                    .setURL(`https://discord.com/users/${interaction.user.id}`)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('👤');

                const logRow = new ActionRowBuilder()
                    .addComponents(profileButton);

                let logroom = setting.get(`log_room_${interaction.guild.id}`);
                let theroom = interaction.guild.channels.cache.find(ch => ch.id == logroom);
                await theroom.send({embeds:[doneembedprove], components: [logRow]})
                  // انشاء ايمبد لوج لعملية الشراء و جلب معلومات روم اللوج في السيرفر الرسمي و ارسال الايمبد هناك
                  const { WebhookClient } = require('discord.js')
                  const { purchaseWebhookUrl } = require('../../config.json');
                  const webhookClient = new WebhookClient({ url : purchaseWebhookUrl });
                  const theEmbed = new EmbedBuilder()
                                              .setColor('Green')
                                              .setTitle('تمت عملية شراء جديدة')
                                              .addFields(
                                                  {name : `نوع البوت` , value : `\`\`\`العاب\`\`\`` , inline : true},
                                                  {name : `سعر البوت` , value : `\`\`\`${price1}\`\`\`` , inline : true},
                                                  {name : `المشتري` , value : `\`\`\`${interaction.user.username} , [${interaction.user.id}]\`\`\`` , inline : true},
                                                  {name : `السيرفر` , value : `\`\`\`${interaction.guild.name} [${interaction.guild.id}]\`\`\`` , inline : true},
                                                  {name : `صاحب السيرفر` , value : `\`\`\`${interaction.guild.ownerId}\`\`\`` , inline : true},
                                                  {name : `الفاتورة` , value : `\`\`\`${invoice}\`\`\`` , inline : false},
                                              )
                  await webhookClient.send({embeds : [theEmbed]})

               let userbots = usersdata.get(`bots_${interaction.user.id}_${interaction.guild.id}`);
               if(!userbots) {
                await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}` , 1)
               }else {
                userbots = userbots + 1
                await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}` , userbots) 
               }
                await interaction.editReply({content:`**تم انشاء بوتك بنجاح وتم خصم \`${price1}\` من رصيدك**`})
                    client26.commands = new Collection();
                client26.events = new Collection();
                require("../../Bots/games/handlers/events")(client26)
                require("../../events/requireBots/games-commands")(client26);
                const folderPath = path.resolve(__dirname, '../../Bots/games/slashcommand26');
                const prefix = Bot_prefix
                client26.gamesSlashCommands = new Collection();
  const gamesSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("games commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
      (folder) => !folder.includes(".")
      )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
          let command = require(`${folderPath}/${folder}/${file}`);
          if (command) {
              gamesSlashCommands.push(command.data.toJSON());
              client26.gamesSlashCommands.set(command.data.name, command);
              if (command.data.name) {
                  table.addRow(`/${command.data.name}`, "🟢 Working");
                } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
    }
}


/*const folderPath3 = path.resolve(__dirname, '../../Bots/games/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client26);
}*/
client26.on('ready' , async() => {
    setInterval(async() => {
      let BroadcastTokenss = tokens.get(`games`)
      let thiss = BroadcastTokenss.find(br => br.token == Bot_token)
      if(thiss) {
        if(thiss.timeleft <= 0) {
            console.log(`${client26.user.id} Ended`)
          await client26.destroy();
        }
      }
    }, 1000);
  })
client26.on("ready" , async() => {
    
    try {
        await rest.put(
            Routes.applicationCommands(client26.user.id),
            { body: gamesSlashCommands },
            );
            
        } catch (error) {
            console.error(error)
        }
        
    });
    const folderPath2 = path.resolve(__dirname, '../../Bots/games/events');
    
    for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
        const event = require(path.join(folderPath2, file));
    }
    client26.on("interactionCreate" , async(interaction) => {
        if (interaction.isChatInputCommand()) {
            if(interaction.user.bot) return;
            
            const command = client26.gamesSlashCommands.get(interaction.commandName);
            
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            if (command.ownersOnly === true) {

                if (owner != interaction.user.id) {
                    return interaction.reply({content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true});
                }
            }
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
            }
        }
    } )


    client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(`اوامر`)) return;

  const embed = new EmbedBuilder()
    .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
    .setTitle('قائمة اوامر البوت')
    .setDescription(`**يرجى اختيار القسم المراد معرفة اوامره**`)
    .setTimestamp()
    .setFooter({
      text: `Requested By ${message.author.username}`,
      iconURL: message.author.displayAvatarURL({ dynamic: true })
    })
    .setColor('DarkButNotBlack');

  const btns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
    new ButtonBuilder().setCustomId('help_owner').setLabel('جماعية').setStyle(ButtonStyle.Primary).setEmoji('👑')
  );

  await message.channel.send({ embeds: [embed], components: [btns] });
});
    
    
    
  client26.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client26.gamesSlashCommands.get(interaction.commandName);
	    
      if (!command) {
        return;
      }
      if (command.ownersOnly === true) {
        if (owner != interaction.user.id) {
          return interaction.reply({content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true});
        }
      }
      try {

        await command.execute(interaction);
      } catch (error) {
			return
		}
    }
  } )

  client26.on("interactionCreate" , async(interaction) => {
    if(interaction.customId === "help_general"){
      const embed = new EmbedBuilder()
          .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
          .setTitle('قائمة اوامر البوت')
          .addFields(
          {name : `\`${prefix}اسرع\`` , value : `بدء لعبة أسرع`},
          {name : `\`${prefix}فكك\`` , value : `بدء لعبة فكك`},
          {name : `\`${prefix}اعلام\`` , value : `بدء لعبة اعلام`},           
          {name : `\`${prefix}زر\`` , value : `بدء لعبة ازرار`},             
          {name : `\`${prefix}الوان\`` , value : `بدء لعبة الوان`},              
          {name : `\`${prefix}ايموجي\`` , value : `بدء لعبة ايموجيات`},              
          {name : `\`${prefix}كت\`` , value : `بدء لعبة كت`},             
          {name : `\`${prefix}عواصم\`` , value : `بدء لعبة عواصم`},             
          {name : `\`${prefix}رياضيات\`` , value : `بدء لعبة رياضيات`},             
          {name : `\`${prefix}جمع\`` , value : `بدء لعبة جمع كلمات`},              
          {name : `\`${prefix}مفرد\`` , value : `بدء لعبة مفردات كلمات`},            
          {name : `\`${prefix}عكس\`` , value : `بدء لعبة عكس كلمات`},             
          {name : `\`${prefix}ارقام\`` , value : `بدء لعبة ارقام`},              
          {name : `\`${prefix}تمويه\`` , value : `بدء لعبة تمويه`},              
          {name : `\`${prefix}سؤال\`` , value : `بدء لعبة اسئلة`},              
          {name : `\`${prefix}لغز\`` , value : `بدء لعبة الغاز`},
          )
          .setTimestamp()
          .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
          .setColor('DarkButNotBlack');
      const btns = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐').setDisabled(true),
          new ButtonBuilder().setCustomId('help_owner').setLabel('جماعية').setStyle(ButtonStyle.Primary).setEmoji('👑'),
      )
  
      await interaction.update({embeds : [embed] , components : [btns]})
    }else if(interaction.customId === "help_owner"){
      const embed = new EmbedBuilder()
      .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
      .setTitle('قائمة اوامر البوت')
          .addFields(
          {name : `\`/set-games-role\`` , value : `لتحديد رتبة مسؤول الألعاب`},
          {name : `\`${prefix}مافيا\`` , value : `بدء لعبة المافيا`},
          {name : `\`${prefix}روليت\`` , value : `بدء لعبة الروليت`},
          {name : `\`${prefix}xo\`` , value : `بدء لعبة xo`},
          {name : `\`${prefix}rpc\`` , value : `بدء لعبة حجرة ورقة مقص`},
          {name : `\`${prefix}غميضة\`` , value : `بدء لعبة غميضة`},


          )
      .setTimestamp()
      .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
      .setColor('DarkButNotBlack');
  const btns = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
      new ButtonBuilder().setCustomId('help_owner').setLabel('جماعية').setStyle(ButtonStyle.Primary).setEmoji('👑').setDisabled(true),
  )
  
  await interaction.update({embeds : [embed] , components : [btns]})
    }
  })

                  await client26.login(Bot_token).catch(async() => {
                    return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
                  })
                  if(!games) {
                      await tokens.set(`games` , [{token:Bot_token,prefix:Bot_prefix,clientId:client26.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`games` , {token:Bot_token,prefix:Bot_prefix,clientId:client26.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
        
            
            }catch(error){
                console.error(error)
                return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
            }
        }
    }
  }
}