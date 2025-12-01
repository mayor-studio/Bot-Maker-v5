const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, PermissionFlagsBits } = require("discord.js");
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const { PermissionsBitField } = require('discord.js');
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const taxDB = new Database("/Json-db/Bots/taxDB.json")
const payDB = new Database("/Json-db/Bots/payDB.json");
let tax = tokens.get(`tax`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuyTax_Modal") {
            await interaction.deferReply({ephemeral:true})
            let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`))
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            const client3 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try{
                const owner = interaction.user.id
                let price1 = prices.get(`tax_price_${interaction.guild.id}`) || 40;
                price1 = parseInt(price1)
                const newbalance = parseInt(userbalance) - parseInt(price1)
                await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newbalance)

                function generateRandomCode() {
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
                const { REST } = require('@discordjs/rest');
const rest = new REST({ version: '10' }).setToken(Bot_token);
const { Routes } = require('discord-api-types/v10');
               client3.on("ready" , async() => {
                let doneembeduser = new EmbedBuilder()
                .setTitle(`**تم انشاء بوتك بنجاح**`)
                .setDescription(`**معلومات الفاتورة :**`)
                .addFields(
                    {
                        name:`**الفاتورة**`,value:`**\`${invoice}\`**`,inline:false
                    },
                    {
                        name:`**نوع البوت**`,value:`**\`Tax Bot\`**`,inline:false
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
                        type:`ضريبة`,
                        token:`${Bot_token}`,
                        prefix:`${Bot_prefix}`,
                        userid:`${interaction.user.id}`,
                        guildid:`${interaction.guild.id}`,
                        serverid:`عام`,
                    price:price1
                })
                const thebut = new ButtonBuilder()
                    .setLabel(`دعوة البوت`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client3.user.id}&permissions=8&scope=bot%20applications.commands`);

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
                        {name: 'نوع البوت', value: '`**Tax Bot**`', inline: true},
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
                                                    {name : `نوع البوت` , value : `\`\`\`ضريبة\`\`\`` , inline : true},
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
                client3.commands = new Collection();
                client3.events = new Collection();
                require("../../Bots/tax/handlers/events")(client3)
                require('../../Bots/tax/handlers/tax4bot')(client3)
                require("../../events/requireBots/Tax-Commands")(client3);
                const folderPath = path.resolve(__dirname, '../../Bots/tax/slashcommand3');
                const prefix = Bot_prefix
                client3.taxSlashCommands = new Collection();
  const taxSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("tax commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
      (folder) => !folder.includes(".")
      )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter(f =>
      f.endsWith(".js")
      )) {
          let command = require(`${folderPath}/${folder}/${file}`);
          if (command) {
              taxSlashCommands.push(command.data.toJSON());
              client3.taxSlashCommands.set(command.data.name, command);
              if (command.data.name) {
                  table.addRow(`/${command.data.name}`, "🟢 Working");
                } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
    }
}

const folderPath3 = path.resolve(__dirname, '../../Bots/tax/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client3);
}
client3.on('ready' , async() => {
    setInterval(async() => {
      let BroadcastTokenss = tokens.get(`tax`)
      let thiss = BroadcastTokenss.find(br => br.token == Bot_token)
      if(thiss) {
        if(thiss.timeleft <= 0) {
            console.log(`${client3.user.id} Ended`)
          await client3.destroy();
        }
      }
    }, 1000);
  })
client3.on("ready" , async() => {
    
    try {
        await rest.put(
            Routes.applicationCommands(client3.user.id),
            { body: taxSlashCommands },
            );
            
        } catch (error) {
            console.error(error)
        }
        
    });
    const folderPath2 = path.resolve(__dirname, '../../Bots/tax/events');
    
    for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
        const event = require(path.join(folderPath2, file));
    }
    client3.on("interactionCreate" , async(interaction) => {
        if (interaction.isChatInputCommand()) {
            if(interaction.user.bot) return;
            
            const command = client3.taxSlashCommands.get(interaction.commandName);
            
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            if (command.ownersOnly === true) {
                if (owner != interaction.user.id) {
                    return interaction.reply({content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true});
                }
            }
            if (command.adminsOnly === true) {
              if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                 return interaction.reply({ content: `❗ ***يجب أن تمتلك صلاحية الأدمن لاستخدام هذا الأمر***`, ephemeral: true });
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
    
    
client3.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  let roomid = taxDB.get(`tax_room_${message.guild.id}`);
  let taxLine = taxDB.get(`tax_line_${message.guild.id}`);
  let taxMode = taxDB.get(`tax_mode_${message.guild.id}`) || 'embed'; // Default to embed if not set
  let taxColor = taxDB.get(`tax_color_${message.guild.id}`) || '#0099FF'; // Default color

  if (roomid) {
    if (message.channel.id === roomid) {
      if (message.author.bot) return;

      let number = message.content;

      if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
      else if (number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
      else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
      else if (number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;

      if (isNaN(number) || number == 0) return message.delete();

      let number2 = parseInt(number); // المبلغ
      let tax = Math.floor(number2 * 20 / 19 + 1); // المبلغ مع الضريبة
      let tax2 = Math.floor(tax - number2); // الضريبة
      let tax3 = Math.floor(tax * 20 / 19 + 1); // المبلغ مع ضريبة الوسيط
      let tax4 = Math.floor(number2 * 0.02); // نسبة الوسيط
      let tax5 = Math.floor(tax3 + tax4); // الضريبة كاملة مع نسبة الوسيط

      let description = `
🪙 المبلغ ** : ${number2}**
- ضريبة برو بوت **: ${tax}**
- المبلغ كامل مع ضريبة الوسيط **: ${tax3}**
- نسبة الوسيط 2 % **: ${tax4}**
- الضريبة كاملة مع نسبة الوسيط **: ${tax5}**
`;

      let btn1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`tax_${tax}`)
          .setLabel('Tax')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`mediator_${tax5}`)
          .setLabel('Mediator')
          .setStyle(ButtonStyle.Secondary)
      );

      if (taxMode === 'embed') {
        let embed1 = new EmbedBuilder()
          .setColor(taxColor)
          .setDescription(description)
          .setThumbnail(message.guild.iconURL({ dynamic: true }));

        message.reply({ embeds: [embed1], components: [btn1] });

        if (taxLine) {
          message.channel.send({ files: [taxLine] });
        }
      } else {
        message.reply({ content: description, components: [btn1] });

        if (taxLine) {
          message.channel.send({ files: [taxLine] });
        }
      }

      return;
    }
  }
});

client3.on('messageCreate', async message => {
    if (message.content.startsWith(`${prefix}tax`) || message.content.startsWith('ضريبة')) {
        const args = message.content.startsWith(`${prefix}tax`) 
            ? message.content.slice(`${prefix}tax`.length).trim() 
            : message.content.slice('ضريبة'.length).trim();

        let number = args;
        if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
        else if (number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
        else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
        else if (number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;

        let number2 = parseFloat(number);

        if (isNaN(number2)) {
            return message.reply('يرجى إدخال رقم صحيح بعد الأمر');
        }

        let tax = Math.floor(number2 * (20) / (19) + 1); // الضريبة
        let tax2 = Math.floor(tax - number2); // المبلغ مع الضريبة

        await message.reply(`${tax}`);
    }
});


client3.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  // Fetch the PayPal tax channel configuration from the database
  const taxChannelId = await payDB.get(`${message.guild.id}_paypal_tax_channel`);
  if (!taxChannelId || message.channel.id !== taxChannelId) return;

  // Check if the message contains a valid number
  const amount = parseFloat(message.content);
  if (isNaN(amount)) {
    return message.reply('❌ Please enter a valid amount.');
  }

  // PayPal fee structure
  const percentageFee = 2.9 / 100; // 2.9%
  const fixedFee = 0.30; // $0.30 fixed fee

  // Calculate the PayPal fee
  const fee = amount * percentageFee + fixedFee;
  const totalWithFee = amount + fee;

  // Reply with the tax details
  return message.reply(`💰 **PayPal Fee Calculation**:
  - **Amount:** $${amount.toFixed(2)}
  - **Fee (2.9% + $0.30):** $${fee.toFixed(2)}
  - **Total with Fee:** $${totalWithFee.toFixed(2)}`);
});
      
        client3.on("interactionCreate" , async(interaction) => {
              if(interaction.customId === "help_general"){
                const embed = new EmbedBuilder()
                    .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
                    .setTitle('قائمة اوامر البوت')
                    .addFields(
                     {name : `\`/tax\` | \`${prefix}tax\` | \`ضريبة\`` , value : `لحساب ضريبة بروبوت اي مبلغ تريده`}
                    )
                    .setTimestamp()
                    .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
                    .setColor('DarkButNotBlack');
                const btns = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐').setDisabled(true),
                    new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Primary).setEmoji('👑'),
                )
      
                await interaction.update({embeds : [embed] , components : [btns]})
              }else if(interaction.customId === "help_owner"){
                const embed = new EmbedBuilder()
                .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
                .setTitle('قائمة اوامر البوت')
                .addFields(
                  {name : `\`/set-tax-room\`` , value : `لتحديد روم الضريبة التلقائية`},
                  {name : `\`/tax-mode\`` , value : `لتحديد شكل الضريبة`},
                  {name : `\`/set-line\`` , value : `لتحديد الخط`},
                )
                .setTimestamp()
                .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
                .setColor('DarkButNotBlack');
            const btns = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
                new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Primary).setEmoji('👑').setDisabled(true),
            )
      
            await interaction.update({embeds : [embed] , components : [btns]})
              }
        })
  await client3.login(Bot_token).catch(async() => {
    return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
  })
                  if(!tax) {
                      await tokens.set(`tax` , [{token:Bot_token,prefix:Bot_prefix,clientId:client3.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`tax` , {token:Bot_token,prefix:Bot_prefix,clientId:client3.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
                  
                }catch(error){
                console.error(error)
                return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
            }
        }
    }
}
}