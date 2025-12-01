const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const fs = require('fs');
const { Database } = require("st.db")
const shopDB = new Database("/Json-db/Bots/shopDB.json")
const shortcutDB = new Database("/Json-db/Others/shortcutDB.json")
const tokens = new Database("/tokens/tokens")
const { PermissionsBitField } = require('discord.js')
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let shop = tokens.get('shop')
if(!shop) return;

const path = require('path');
const { readdirSync } = require("fs");
shop.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client20 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client20.commands = new Collection();
  require(`./handlers/events`)(client20);
  client20.events = new Collection();
  require(`../../events/requireBots/shop-commands`)(client20);
  const rest = new REST({ version: '10' }).setToken(token);
  client20.setMaxListeners(1000)

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
        client20.once('ready', () => {
    client20.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`shop bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client20.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`shop`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client20.users.cache.get(owner) || await client20.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : شوب\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`shop`, filtered);
          await client20.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`../shop/handlers/events`)(client20)
  const folderPath = path.join(__dirname, 'slashcommand20');
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



const folderPath2 = path.join(__dirname, 'slashcommand20');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/shop-commands`)(client20)
require("./handlers/events")(client20)
require("./handlers/copy")(client20)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client20.once(event.name, (...args) => event.execute(...args));
	} else {
		client20.on(event.name, (...args) => event.execute(...args));
	}
	}




  client20.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client20.shopSlashCommands.get(interaction.commandName);
	    
      if (!command) {
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
			console.log(error)
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
        thumbnail: { url: message.author.displayAvatarURL({ dynamic: true }) },
        footer: { 
            text: `Requested by ${message.author.tag}`, 
            iconURL: message.author.displayAvatarURL({ dynamic: true }) 
        },
        author: { name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) },
        fields: []
    };

    products.forEach(product => {
        let nameEmojiDisplay = product.nameEmoji?.startsWith('<:') ? product.nameEmoji : (product.nameEmoji || "🏷️");
        let priceEmojiDisplay = product.priceEmoji?.startsWith('<:') ? product.priceEmoji : (product.priceEmoji || "💰");
        let goodsEmojiDisplay = product.goodsEmoji?.startsWith('<:') ? product.goodsEmoji : (product.goodsEmoji || "📦");

        embed.fields.push({
            name: `**\`${product.name}\`** ${nameEmojiDisplay} `,
            value: `** السعر: \`${product.price}\` ${priceEmojiDisplay}\nالكمية المتاحة: \`${product.goods?.length ?? 0}\` ${goodsEmojiDisplay} **`,
            inline: false
        });
    });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('مالك البوت')
                .setStyle(ButtonStyle.Link)
                .setEmoji('👑')
                .setURL(`https://discord.com/users/${theowner}`)
        );

    const response = await message.channel.send({ 
        embeds: [embed],
        components: [row]
    });

    // Remove collector since we're using a link button now
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

client20.on("interactionCreate" , async(interaction) => {
  if(interaction.customId === "help_general"){
    const embed = new EmbedBuilder()
        .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
        .setTitle('قائمة اوامر البوت')
        .addFields(
          {name : `\`${prefix}buy\`` , value : `لشراء سلعة`},
          {name : `\`${prefix}stock\`` , value : `لرؤية المنتجات المتاحة للبيع`},
          {name : `\`/help\`` , value : `لعرض قائمة الاوامر`},
          {name : `\`/support\`` , value : `للانضمام للسيرفر الداعم`},
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
      {name : `\`/add-category\`` , value : `لاضافة نوع من المنتجات للبيع`},
      {name : `\`/add-product\`` , value : `لاضافة سلع لمنتج معين`},
      {name : `\`/edit-product-price\`` , value : `لتعديل سعر منتج`},
      {name : `\`/remove-category\`` , value : `لازالة نوع من المنتجات للبيع`},
      {name : `\`/give\`` , value : `اعطاء منتج`},
      {name : `\`/remove-product\`` , value : `لازالة سلع من منتج معين`},
      {name : `\`/set-straming\`` , value : `تغيير حالة البوت`},
      {name : `\`${prefix}add\`` , value : `إضافة المنتجات`},)
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
client20.on('messageCreate', async message => {
    if (!message.content.startsWith(`${prefix}add`)) return;
    if (message.author.id !== theowner) return message.reply("**هذا الأمر للمالك فقط**");

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    if (args.length < 2) return message.reply("**الرجاء استخدام الأمر بالشكل الصحيح: `!add [اسم_المنتج]`**");

    const productName = args[1];
    let products = await shopDB.get(`products_${message.guild.id}`);
    
    if (!products) {
        await shopDB.set(`products_${message.guild.id}`, []);
        products = await shopDB.get(`products_${message.guild.id}`);
    }

    const product = products.find(p => p.name === productName);
    if (!product) return message.reply("**لا يوجد منتج بهذا الاسم**");

    const productsList = await message.channel.send({
        content: `**المنتجات الحالية في ${productName}:**\n` + 
                 `\`\`\`\n${product.goods?.join('\n') || 'لا توجد منتجات'}\n\`\`\`\n` +
                 `**قم بإرسال المنتجات الجديدة في رسالة واحدة، كل منتج في سطر**`
    });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('done_adding')
                .setLabel('إضافة المنتجات')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('cancel_adding')
                .setLabel('إلغاء')
                .setStyle(ButtonStyle.Danger)
        );

    const msg = await message.channel.send({
        content: "**اضغط على الأزرار للإضافة أو الإلغاء**",
        components: [row]
    });

    let newProducts = [];
    const collector = message.channel.createMessageCollector({
        filter: m => m.author.id === message.author.id && m.content.length > 0,
        time: 300000
    });

    collector.on('collect', m => {
        if (m.content.toLowerCase() !== 'done' && m.content.toLowerCase() !== 'cancel') {
            newProducts = m.content.split('\n').filter(line => line.trim().length > 0);
            m.delete().catch(() => {});
        }
    });

    const buttonCollector = msg.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 300000
    });

    buttonCollector.on('collect', async i => {
        if (i.customId === 'done_adding') {
            if (newProducts.length === 0) {
                return i.reply({ content: "**لم تقم بإضافة أي منتجات**", ephemeral: true });
            }
            
            product.goods = [...(product.goods || []), ...newProducts];
            await shopDB.set(`products_${message.guild.id}`, products);
            
            await i.update({ 
                content: `**✅ تم إضافة ${newProducts.length} منتج بنجاح إلى ${productName}**\n\n**المنتجات المضافة:**\n\`\`\`\n${newProducts.join('\n')}\n\`\`\``,
                components: []
            });
            
            collector.stop();
            buttonCollector.stop();
            productsList.delete().catch(() => {});
        } else if (i.customId === 'cancel_adding') {
            await i.update({ 
                content: "**تم إلغاء العملية**",
                components: []
            });
            collector.stop();
            buttonCollector.stop();
            productsList.delete().catch(() => {});
        }
    });

    collector.on('end', () => {
        msg.edit({ components: [] }).catch(() => {});
    });
});

   client20.login(token)
   .catch(async(err) => {
    const filtered = shop.filter(bo => bo != data)
			await tokens.set(`shop` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})

