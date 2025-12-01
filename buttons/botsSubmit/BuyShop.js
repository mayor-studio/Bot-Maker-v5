const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const fs = require('fs');
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const { PermissionsBitField } = require('discord.js');
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const shortcutDB = new Database("/Json-db/Others/shortcutDB.json")
const shopDB = new Database("/Json-db/Bots/shopDB.json")

let shop = tokens.get(`shop`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuyShop_Modal") {
            await interaction.deferReply({ephemeral:true})
            let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`))
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            
            const client20 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try{
              const owner = interaction.user.id
                let price1 = prices.get(`shop_price_${interaction.guild.id}`) || 70;
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
                let doneembeduser = new EmbedBuilder()
                .setTitle(`**تم انشاء بوتك بنجاح**`)
                .setDescription(`**معلومات الفاتورة :**`)
                .addFields(
                    {
                        name:`**الفاتورة**`,value:`**\`${invoice}\`**`,inline:false
                    },
                    {
                        name:`**نوع البوت**`,value:`**\`Sell Products Bot\`**`,inline:false
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
                    type:`شوب`,
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
                client20.on('ready' , async() => {
                  const thebut = new ButtonBuilder()
                    .setLabel(`دعوة البوت`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client20.user.id}&permissions=8&scope=bot%20applications.commands`);

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
                        {name: 'نوع البوت', value: '`**Sell Products Bot**`', inline: true},
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
                                                  {name : `نوع البوت` , value : `\`\`\`شوب\`\`\`` , inline : true},
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
                client20.commands = new Collection();
            client20.events = new Collection();
            require("../../Bots/shop/handlers/events")(client20)
            require("../../Bots/shop/handlers/copy")(client20)
            require("../../events/requireBots/shop-commands")(client20);
            const folderPath = path.resolve(__dirname, '../../Bots/shop/slashcommand20');
            const prefix = Bot_prefix
            client20.shopSlashCommands = new Collection();
  const shopSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("shop commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          shopSlashCommands.push(command.data.toJSON());
          client20.shopSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}
const folderPath3 = path.resolve(__dirname, '../../Bots/shop/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client20);
}

client20.on("guildMemberAdd" , async(member) => {
  const theeGuild = member.guild
  let rooms = shopDB.get(`rooms_${theeGuild.id}`)
  const message = shopDB.get(`message_${theeGuild.id}`)
  if(!rooms) return;
  if(rooms.length <= 0) return;
  if(!message) return;
  await rooms.forEach(async(room) => {
    const theRoom = await theeGuild.channels.cache.find(ch => ch.id == room)
    if(!theRoom) return;
    await theRoom.send({content:`${member} , ${message}`}).then(async(msg) => {
      setTimeout(() => {
        msg.delete();
      }, 1500);
    })
  })
})

client20.on('ready' , async() => {
  setInterval(async() => {
    let BroadcastTokenss = tokens.get(`shop`)
    let thiss = BroadcastTokenss.find(br => br.token == Bot_token)
    if(thiss) {
      if(thiss.timeleft <= 0) {
          console.log(`${client20.user.id} Ended`)
        await client20.destroy();
      }
    }
  }, 1000);
})
            client20.on("ready" , async() => {

                try {
                  await rest.put(
                    Routes.applicationCommands(client20.user.id),
                    { body: shopSlashCommands },
                    );
                    
                  } catch (error) {
                    console.error(error)
                  }
          
              });
              const folderPath2 = path.resolve(__dirname, '../../Bots/shop/events');

            for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
                const event = require(path.join(folderPath2, file));
            }
                client20.on("interactionCreate" , async(interaction) => {
                    if (interaction.isChatInputCommand()) {
                        if(interaction.user.bot) return;
                      
                      const command = client20.shopSlashCommands.get(interaction.commandName);
                        
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
client20.on("interactionCreate" , async(interaction) => {
  if(interaction.isModalSubmit()) {
    if(interaction.customId == "add_goods") {
      let type = interaction.fields.getTextInputValue(`type`)
      let Goods = interaction.fields.getTextInputValue(`Goods`)
      let products = shopDB.get(`products_${interaction.guild.id}`)
      let productFind = products.find(prod => prod.name == type)

      if(!productFind) return interaction.reply({content: `**لا يوجد منتج بهذا الاسم**`})
      let goodsFind = productFind.goods;
      const embed = new EmbedBuilder()
        .setTimestamp(Date.now())
        .setColor('#000000')
      Goods = Goods.split("\n").filter(item => item.trim() !== '')
      productFind.goods = [...goodsFind, ...Goods]
      await shopDB.set(`products_${interaction.guild.id}` , products)
      embed.setTitle(`**[✅] تم اضافة السلع الى المنتج بنجاح**`)
      return interaction.reply({embeds: [embed]})
    }
  } 
})

client20.on('messageCreate', async message => {

    if (!message.content.startsWith(`${prefix}stock`)) return;
    let products = await shopDB.get(`products_${message.guild.id}`);
    if (!products) {
        await shopDB.set(`products_${message.guild.id}`, []);
        products = await shopDB.get(`products_${message.guild.id}`);
    }
    if (!products || products.length <= 0) {
        return message.reply({ content: '**لا يوجد منتجات متوفرة الأن للبيع**' });
    }

    let embed = {
        title: '**جميع المنتجات المتوفرة للبـيع**',
        footer: { text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) },
        author: { name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) },
        fields: []
    };

    products.forEach(product => {
        embed.fields.push({
            name: `**\`${product.name}\`**`,
            value: `**> السعر: \`${product.price}\`\n> الكمية المتاحة: \`${product.goods?.length ?? 0}\`\n> للشراء: \`${prefix}buy ${product.name}\`**`,
            inline: false
        });
    });

    await message.channel.send({ embeds: [embed] });
});

client20.on('messageCreate', async message => {
    if (!message.content.startsWith(`${prefix}buy`)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const name = args[1];
    const count = parseInt(args[2], 10) || 1;

    let active = shopDB.get(`active_${message.author.id}`);
    if (active) {
        return message.reply('لديك عملة شراء شغالة بالفعل ، أكملها أولا .');
    }

    if (!count || count <= 0) {
        return message.reply('الرجاء إدخال كمية صحيحة.');
    }

    let products = shopDB.get(`products_${message.guild.id}`);
    let testFind = products.find(ah => ah.name === name);

    let goods = testFind.goods;

    if (!goods || goods.length < count) {
        return message.reply(`**العدد الذي تريد شرائه فوق قدر الكمية الموجودة\nالمتوفر حاليا : ${goods.length}**`);
    }


    let price = parseInt(testFind.price);
    let price1 = price * count;
    let price2 = Math.floor(price1 * (20 / 19) + 1);

    let recipient = shopDB.get(`recipient_${message.guild.id}`);
    let clientrole = shopDB.get(`clientrole_${message.guild.id}`);
    let probot = shopDB.get(`probot_${message.guild.id}`);

    if (!recipient || !clientrole || !probot) {
        return message.reply('**لم يتم إعداد البوت من قبل مالك الخادم. استخدم `/setup` للإعداد.**');
    }

let embed = {
    description: `**قم بتحويل \`${price2}\` إلى <@${recipient}> لإتمام عملية الشراء\n \`\`\`#credit ${recipient} ${price2}\`\`\`لديك 30 ثانية فقط للتحويل**`,
    footer: { 
        text: message.author.username, 
        iconURL: message.author.displayAvatarURL({ dynamic: true }) 
    },
    author: { 
        name: message.guild.name, 
        iconURL: message.guild.iconURL({ dynamic: true }) 
    }
};



    const transfermessage = await message.reply({ embeds: [embed] });
    const message22 = await message.channel.send(`#credit ${recipient} ${price2}`);
    shopDB.set(`active_${message.author.id}`, true);

    const collectorFilter = m => (m.content.includes(price1) && (m.content.includes(recipient) || m.content.includes(`<@${recipient}>`)) && m.author.id == probot);
    const collectorTransfer = message.channel.createMessageCollector({
        filter: collectorFilter,
        max: 1,
        time: 1000 * 30
    });

    collectorTransfer.on('collect', async () => {
        function getRandomAndRemove(array, counter) {
            const result = [];
            for (let i = 0; i < counter; i++) {
                const randomIndex = Math.floor(Math.random() * array.length);
                const randomElement = array.splice(randomIndex, 1)[0];
                result.push(randomElement);
            }
            return result;
        }

        const randomAndRemoved = getRandomAndRemove(goods, count);
        testFind.goods = goods;
        await shopDB.set(`products_${message.guild.id}`, products);

let doneEmbed = {
    title: `**تم الشراء بنجاح!**`,
    description: '**ستصلك المنتجات في الخاص**',
    author: { name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) }
};

        if (count > 50) {
            // إرسال المنتجات كملف إذا كانت الكمية أكبر من 50
            const fileContent = randomAndRemoved.join('\n');
            const filePath = `./products_${message.author.id}.txt`;
            require('fs').writeFileSync(filePath, fileContent);

            await message.author.send({
                files: [filePath]
            }).then(() => {
                require('fs').unlinkSync(filePath); // حذف الملف بعد الإرسال
            }).catch(() => {
                message.reply('❌ Unable to send the file in DM. Please make sure your DM is open.');
            });
        } else {
            let goodsEmbed = {
                title: `**تم الشراء بنجاح!**`,
                description: `\`\`\`\n${randomAndRemoved.join('\n')}\n\`\`\``,
                author: { name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) }
            };
      let copybut = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`copynitro`)
          .setLabel('COPY')
          .setStyle(ButtonStyle.Secondary)
      );

await message.author.send({
    embeds: [goodsEmbed],
    components: [copybut]
});
        }

        await message.channel.send({ content: `${message.author}`, embeds: [doneEmbed] });

        if (clientrole) {
            const therole = message.guild.roles.cache.find(ro => ro.id == clientrole);
            if (therole) {
                await message.guild.members.cache.get(message.author.id).roles.add(therole).catch(async () => { return; });
            }
        }
        shopDB.delete(`active_${message.author.id}`);
    });

    collectorTransfer.on('end', async () => {
        try {
            transfermessage.delete().catch(() => { return; });
            await message22.delete().catch(() => { return; });
            shopDB.delete(`active_${message.author.id}`);
        } catch (error) {
            return;
        }
    });
});


                  client20.on("messageCreate" , async(message) => {
                    let client = message.client;
                  if (message.author.bot) return;
                  if (message.channel.type === 'dm') return;
                
                
                  if(!message.content.startsWith(prefix)) return;
                  const args = message.content.slice(prefix.length).trim().split(/ +/g); 
                  const cmd = args.shift().toLowerCase();
                  if(cmd.length == 0 ) return;
                  let command = client.commands.get(cmd)
                  if(!command) command = client20.commands.get(client.commandaliases.get(cmd));
                
                  if(command) {
                    if(command.ownersOnly) {
                            if (owner != message.author.id) {
                              return message.reply({content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true});
                            }
                    }
                    if(command.cooldown) {
                        
                      if(cooldown.has(`${command.name}${message.author.id}`)) return message.reply({ embeds:[{description:`**عليك الانتظار\`${ms(cooldown.get(`${command.name}${message.author.id}`) - Date.now(), {long : true}).replace("minutes", `دقيقة`).replace("seconds", `ثانية`).replace("second", `ثانية`).replace("ms", `ملي ثانية`)}\` لكي تتمكن من استخدام الامر مجددا.**`}]}).then(msg => setTimeout(() => msg.delete(), cooldown.get(`${command.name}${message.author.id}`) - Date.now()))
                      command.run(client, message, args)
                      cooldown.set(`${command.name}${message.author.id}`, Date.now() + command.cooldown)
                      setTimeout(() => {
                        cooldown.delete(`${command.name}${message.author.id}`)
                      }, command.cooldown);
                  } else {
                    command.run(client, message, args)
                  }}});

                  client20.on("interactionCreate" , async(interaction) => {
                    if(interaction.customId === "help_general"){
                      const embed = new EmbedBuilder()
                          .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
                          .setTitle('قائمة اوامر البوت')
                          .addFields(
                            {name : `\`${prefix}buy\`` , value : `لشراء سلعة`},
                            {name : `\`${prefix}stock\`` , value : `لرؤية المنتجات المتاحة للبيع`},
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
                        {name : `\`/setup\`` , value : `لتسطيب الاعدادات الرئيسية`},
                        {name : `\`/add-product\`` , value : `لاضافة نوع من المنتجات للبيع`},
                        {name : `\`/add-product-goods\`` , value : `لاضافة سلع لمنتج معين`},
                        {name : `\`/fast-add-product-goods\`` , value : `لاضافة سلع لمنتج معين بشكل أسرع`},
                        {name : `\`/edit-product-price\`` , value : `لتعديل سعر منتج`},
                        {name : `\`/remove-product\`` , value : `لازالة نوع من المنتجات للبيع`},
                        {name : `\`/give\`` , value : `اعطاء منتج`},
                        {name : `\`/remove-product-goods\`` , value : `لازالة سلع من منتج معين`},
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
                  
                  await client20.login(Bot_token).catch(async() => {
                    return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
                  })
                  if(!shop) {
                      await tokens.set(`shop` , [{token:Bot_token,prefix:Bot_prefix,clientId:client20.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`shop` , {token:Bot_token,prefix:Bot_prefix,clientId:client20.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
        
            
            }catch(error){
                console.error(error)
                return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
            }
        }
    }
  }
}