const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, StringSelectMenuBuilder } = require("discord.js");
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const { PermissionsBitField } = require('discord.js');
const usersdata = new Database(`/database/usersdata/usersdata`);
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const db = new Database("/Json-db/Bots/BroadcastDB")
const BcDB = new Database("/Json-db/Bots/BcDB.json")

let Broadcast = tokens.get(`Bc`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuyBroadcast_Modal") {
            await interaction.deferReply({ephemeral:true})
            let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`))
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            
            const client2 = new Client({intents:131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try{
              const owner = interaction.user.id
                let price1 = prices.get(`Broadcast_price_${interaction.guild.id}`) || 100;
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
                        name:`**نوع البوت**`,value:`**\`MultiCast Bot\`**`,inline:false
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
                    type:`برودكاست`,
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
                client2.on('ready' , async() => {
                  
                  const thebut = new ButtonBuilder()
                    .setLabel(`دعوة البوت`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client2.user.id}&permissions=8&scope=bot%20applications.commands`);

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
                        {name: 'نوع البوت', value: '`**MultiCast Bot**`', inline: true},
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
                                                  {name : `نوع البوت` , value : `\`\`\`برودكاست متطور\`\`\`` , inline : true},
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
                client2.commands = new Collection();
            client2.events = new Collection();
            require("../../Bots/Broadcast/handlers/events")(client2)
            require("../../events/requireBots/Broadcast-commands")(client2);
            const folderPath = path.resolve(__dirname, '../../Bots/Broadcast/slashcommand2');
            const prefix = Bot_prefix
            client2.BcSlashCommands = new Collection();
  const BcSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("Bc commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          BcSlashCommands.push(command.data.toJSON());
          client2.BcSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}

const folderPath3 = path.resolve(__dirname, '../../Bots/Broadcast/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client2);
}
            client2.on("ready" , async() => {

                try {
                  await rest.put(
                    Routes.applicationCommands(client2.user.id),
                    { body: BcSlashCommands },
                    );
                    
                  } catch (error) {
                    console.error(error)
                  }
          
              });
              const folderPath2 = path.resolve(__dirname, '../../Bots/Broadcast/events');

            for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
                const event = require(path.join(folderPath2, file));
            }
                client2.on("interactionCreate" , async(interaction) => {
                    if (interaction.isChatInputCommand()) {
                        if(interaction.user.bot) return;
                      
                      const command = client2.BcSlashCommands.get(interaction.commandName);
                        
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

                  client2.on('ready' , async() => {
                    setInterval(async() => {
                      let BroadcastTokenss = tokens.get(`Bc`)
                      let thiss = BroadcastTokenss.find(br => br.token == Bot_token)
                      if(thiss) {
                        if(thiss.timeleft <= 0) {
                          console.log(`${client2.user.id} Ended`)
                          await client2.destroy();
                        }
                      }
                    }, 1000);
                  })

client2.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith(`${prefix}obc`) || message.content.startsWith(`${prefix}bc`)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ You do not have the required permissions to use this command.');
    }

    const args = message.content.split(' ').slice(1);
    const broadcastMsg = args.join(' ');
    if (!broadcastMsg) {
      return message.reply('Please type a message after the command.');
    }

    await message.guild.members.fetch();
    let allMembers = message.guild.members.cache.filter(member => !member.user.bot);

    if (message.content.startsWith(`${prefix}obc`)) {
      allMembers = allMembers.filter(mem =>
        mem.presence?.status === 'online' ||
        mem.presence?.status === 'dnd' ||
        mem.presence?.status === 'idle' ||
        mem.presence?.activities.some(activity => activity.type === ActivityType.Streaming)
      );
    }

    allMembers = allMembers.map(mem => mem.user.id);

    const thetokens = db.get(`tokens_${message.guild.id}`) || [];
    const botsNum = thetokens.length;
    const membersPerBot = Math.floor(allMembers.length / botsNum);
    const submembers = [];
    for (let i = 0; i < allMembers.length; i += membersPerBot) {
      submembers.push(allMembers.slice(i, i + membersPerBot));
    }
    if (submembers.length > botsNum) {
      submembers.pop();
    }

    let sentCount = 0;
    let failedCount = 0;

    const embed = new EmbedBuilder()
      .setTitle('📢 Broadcast Started')
      .setColor('Aqua')
      .setDescription(`**⚫ Total members: \`${allMembers.length}\`\n🟢 Sent: \`${sentCount}\`\n🔴 Failed: \`${failedCount}\`**`);

    const msg = await message.channel.send({ embeds: [embed] });

    for (let i = 0; i < submembers.length; i++) {
      const token = thetokens[i];
      let clienter = new Client({ intents: 131071 });
      await clienter.login(token);

      submembers[i].forEach(async (sub) => {
        try {
          const user = await clienter.users.fetch(sub);
          await user.send(`${broadcastMsg}\n<@${sub}>`);
          sentCount++;
        } catch (error) {
          failedCount++;
        }

        const progressEmbed = new EmbedBuilder()
          .setTitle('📢 Broadcast Status Update')
          .setColor('Aqua')
          .setDescription(`**⚫ Total members: \`${allMembers.length}\`\n🟢 Sent: \`${sentCount}\`\n🔴 Failed: \`${failedCount}\`**`);

        await msg.edit({ embeds: [progressEmbed] });

        if (sentCount + failedCount >= allMembers.length) {
          const finalEmbed = new EmbedBuilder()
            .setTitle('✅ Broadcast Finished')
            .setColor('Green')
            .setDescription(`**⚫ Total members: \`${allMembers.length}\`\n🟢 Sent: \`${sentCount}\`\n🔴 Failed: \`${failedCount}\`**`);

          await msg.edit({ embeds: [finalEmbed] });
        }
      });
    }
  }
});


client2.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {

    if (interaction.user.bot) return;

    const command = client2.BcSlashCommands.get(interaction.commandName);

    if (!command) {
      return;
    }
    if (command.ownersOnly === true) {
      if (owner != interaction.user.id) {
        return interaction.reply({ content: `❗ ***You cannot use this command***`, ephemeral: true });
      }
    }
    if (command.adminsOnly === true) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: `❗ ***You must have Administrator permissions to use this command***`, ephemeral: true });
      }
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      // Optionally log the error here
      return;
    }
  }
});


 
 client2.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === "help_select") {
    const selected = interaction.values[0]; // the selected option value

    if (selected === "help_general") {
      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTitle('قائمة اوامر البوت')
        .addFields(
          { name: '`/help`', value: 'لعرض قائمة الاوامر' },
          { name: '`/support`', value: 'للانضمام للسيرفر الداعم' },
        )
        .setTimestamp()
        .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor('DarkButNotBlack');

      // Keep the select menu with the selected option disabled to indicate current selection
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder('اختر القسم')
        .addOptions([
          { label: 'General', description: 'General bot commands', value: 'help_general', emoji: '🌐', default: true },
          { label: 'Owner', description: 'Owner-only commands', value: 'help_owner', emoji: '👑' },
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.update({ embeds: [embed], components: [row] });
    }

    else if (selected === "help_owner") {

      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTitle('قائمة اوامر البوت')
        .addFields(
          { name: '`/send-panel`', value: 'ارسال بانل التحكم في البرودكاست' },
          { name: `\`${prefix}obc\``, value: 'لارسال رسالة للأعضاء الأونلاين' },
          { name: `\`${prefix}bc\``, value: 'ارسال رسالة للكل' },
          { name: '`/remove-token`', value: 'ازالة توكن محدد من بوتات البرودكاست' },
          { name: '`/remove-all-tokens`', value: 'ازالة جميع توكنات البرودكاست' },
          { name: '`/change-avatar`', value: 'تغيير صورة البوت' },
          { name: '`/change-name`', value: 'تغيير اسم البوت' },
        )
        .setTimestamp()
        .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor('DarkButNotBlack');

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder('اختر القسم')
        .addOptions([
          { label: 'General', description: 'General bot commands', value: 'help_general', emoji: '🌐' },
          { label: 'Owner', description: 'Owner-only commands', value: 'help_owner', emoji: '👑', default: true },
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.update({ embeds: [embed], components: [row] });
    }
  }
});

                  await client2.login(Bot_token).catch(async() => {
                    return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
                  })
                  if(!Broadcast) {
                      await tokens.set(`Bc` , [{token:Bot_token,prefix:Bot_prefix,clientId:client2.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`Bc` , {token:Bot_token,prefix:Bot_prefix,clientId:client2.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
        
            
            }catch(error){
                console.error(error)
                return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
            }
        }
    }
  }
}