const { Client, Collection, discord,GatewayIntentBits,ChannelType, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const { PermissionsBitField } = require('discord.js');
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const shortcutDB = new Database("/Json-db/Others/shortcutDB.json")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const systemDB = new Database("/Json-db/Bots/systemDB.json")

let system = tokens.get(`system`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuySystem_Modal") {
            await interaction.deferReply({ephemeral:true})
            let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`))
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            
            const client17 = new Client({intents:131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try{
              const owner = interaction.user.id
                let price1 = prices.get(`system_price_${interaction.guild.id}`) || 100;
                price1 = parseInt(price1)
                const newbalance = parseInt(userbalance) - parseInt(price1)
                await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newbalance)

                function generateRandomCode() {
                    const characters = 'AsystemDEFGHIJKLMNOPQRSTUVWXYZasystemdefghijklmnopqrstuvwxyz0123456789';
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
                        name:`**نوع البوت**`,value:`**\`System Bot\`**`,inline:false
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
                    type:`سيستم`,
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
                client17.on('ready' , async() => {
                  
                  const thebut = new ButtonBuilder()
                    .setLabel(`دعوة البوت`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client17.user.id}&permissions=8&scope=bot%20applications.commands`);

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
                        {name: 'نوع البوت', value: '`**System Bot**`', inline: true},
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
                                                  {name : `نوع البوت` , value : `\`\`\`سيستم\`\`\`` , inline : true},
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
                client17.commands = new Collection();
            client17.events = new Collection();
            require("../../Bots/system/handlers/events")(client17)
            require("../../Bots/system/handlers/autorole")(client17)
            require("../../Bots/system/handlers/info")(client17)
            require("../../events/requireBots/system-commands")(client17);
            const folderPath = path.resolve(__dirname, '../../Bots/system/slashcommand17');
            const prefix = Bot_prefix
            client17.systemSlashCommands = new Collection();
  const systemSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("system commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          systemSlashCommands.push(command.data.toJSON());
          client17.systemSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}

const folderPath3 = path.resolve(__dirname, '../../Bots/system/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client17);
}
            client17.on("ready" , async() => {

                try {
                  await rest.put(
                    Routes.applicationCommands(client17.user.id),
                    { body: systemSlashCommands },
                    );
                    
                  } catch (error) {
                    console.error(error)
                  }
          
              });
              const folderPath2 = path.resolve(__dirname, '../../Bots/system/events');

            for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
                const event = require(path.join(folderPath2, file));
            }
                client17.on("interactionCreate" , async(interaction) => {
                    if (interaction.isChatInputCommand()) {
                        if(interaction.user.bot) return;
                      
                      const command = client17.systemSlashCommands.get(interaction.commandName);
                        
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

                  client17.on('ready' , async() => {
                    setInterval(async() => {
                      let systemTokenss = tokens.get(`system`)
                      let thiss = systemTokenss.find(br => br.token == Bot_token)
                      if(thiss) {
                        if(thiss.timeleft <= 0) {
                          console.log(`${client17.user.id} Ended`)
                          await client17.destroy();
                        }
                      }
                    }, 1000);
                  })

client17.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`say_cmd_${message.guild.id}`) || null;  
    if (message.author.bot) return;
    if (message.content.startsWith(`${prefix}say`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const content = message.content.slice(`${prefix}say`.length).trim();
        if (!content) {
            message.channel.send("من فضلك اكتب شيئا بعد الأمر.");
            return;
        }
        let image = null;
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            image = attachment.url;
        }
        await message.delete();
        await message.channel.send({ 
            content: content, 
            files: image ? [image] : [] 
        });
    }
});

client17.on('messageCreate', async message => {
  const cmd = shortcutDB.get(`clear_cmd_${message.guild.id}`) || null;
    if (message.author.bot) return;
    if (message.content.startsWith(`${prefix}clear`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const args = message.content.split(' ').slice(1);
        const amount = args[0] ? parseInt(args[0]) : 99;
        if (isNaN(amount) || amount <= 0 || amount > 100) return;
        try {
            const fetchedMessages = await message.channel.messages.fetch({ limit: amount });
            const messagesToDelete = fetchedMessages.filter(msg => {
                const fourteenDays = 14 * 24 * 60 * 60 * 1000;
                return (Date.now() - msg.createdTimestamp) < fourteenDays;
            });
            await message.channel.bulkDelete(messagesToDelete);
        } catch (error) {
        }
    }
});

client17.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`come_cmd_${message.guild.id}`) || null;  
    if (message.content.startsWith(`${prefix}come`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('يجب أن تملك صلاحية إدارة الرسائل (MANAGE_MESSAGES).');
        }
        const mentionOrID = message.content.split(/\s+/)[1];
        const targetMember = message.mentions.members.first() || message.guild.members.cache.get(mentionOrID);
        if (!targetMember) {
            return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
        }
        const directMessageContent = `**تم استدعائك بواسطة : ${message.author}\nفي : ${message.channel}**`;
        try {
            await targetMember.send(directMessageContent);
            await message.reply('**تم الارسال للشخص بنجاح**');
        } catch (error) {
            await message.reply('**لم استطع الارسال للشخص**');
        }
    }
});

client17.on("messageCreate", async (message) => {
  const cmd = await shortcutDB.get(`lock_cmd_${message.guild.id}`) || null;
  if (message.content === `${prefix}lock` || message.content === `${cmd}`) {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
      }
      await message.channel.permissionOverwrites.edit(
        message.channel.guild.roles.everyone, 
        { SendMessages: false }
      );
      return message.reply({ content: `**${message.channel} has been locked**` });
    } catch (error) {
      message.reply({ content: `لقد حدث خطأ، اتصل بالمطورين.` });
      console.log(error);
    }
  }
});

client17.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`unlock_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}unlock` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { SendMessages: true }
    );
    return message.reply({ content: `**${message.channel} has been unlocked**` });
  }
});

client17.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`hide_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}hide` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { ViewChannel: false }
    );
    return message.reply({ content: `**${message.channel} has been hidden**` });
  }
});

client17.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`unhide_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}unhide` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { ViewChannel: true }
    );
    return message.reply({ content: `**${message.channel} has been unhidded**` });
  }
});

client17.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`server_cmd_${message.guild.id}`) || null;
  if (message.content === `${prefix}server` || message.content === `${cmd}`) {
    const embedser = new EmbedBuilder()
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setColor('Random')
      .addFields(
        {
          name: `**🆔 Server ID:**`, 
          value: message.guild.id, 
          inline: false
        },
        {
          name: `**📆 Created On:**`, 
          value: `**<t:${parseInt(message.guild.createdTimestamp / 1000)}:R>**`, 
          inline: false
        },
        {
          name: `**👑 Owned By:**`, 
          value: `**<@${message.guild.ownerId}>**`, 
          inline: false
        },
        {
          name: `**👥 Members (${message.guild.memberCount})**`, 
          value: `**${message.guild.premiumSubscriptionCount} Boosts ✨**`, 
          inline: false
        },
        {
          name: `**💬 Channels (${message.guild.channels.cache.size})**`, 
          value: `**${message.guild.channels.cache.filter(r => r.type === ChannelType.GuildText).size}** Text | **${
              message.guild.channels.cache.filter(r => r.type === ChannelType.GuildVoice).size
            }** Voice | **${message.guild.channels.cache.filter(r => r.type === ChannelType.GuildCategory).size}** Category`,
          inline: false
        },
        {
          name: '🌍 Others',
          value: `**Verification Level:** ${message.guild.verificationLevel}`,
          inline: false
        }
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }));
    return message.reply({ embeds: [embedser] });
  }
});

let invites = {}; 
const getInviteCounts = async (guild) => {
    return new Map(guild.invites.cache.map(invite => [invite.code, invite.uses]));
};

client17.on('inviteCreate', async invite => {
    if (!invites[invite.guild.id]) {
        invites[invite.guild.id] = new Map();
    }
    invites[invite.guild.id].set(invite.code, invite.uses);
});

client17.on('inviteDelete', async invite => {
    if (invites[invite.guild.id]) {
        invites[invite.guild.id].delete(invite.code);
    }
});

client17.on('guildMemberAdd', async member => {
    try {
        const welcomeChannelId = await systemDB.get(`welcome_channel_${member.guild.id}`);
        const welcomeRoleId = await systemDB.get(`welcome_role_${member.guild.id}`);
        const welcomeImage = await systemDB.get(`welcome_image_${member.guild.id}`);

        if (welcomeRoleId) {
            const role = member.guild.roles.cache.get(welcomeRoleId);
            if (role) {
                await member.roles.add(role);
            }
        }

        const newInvites = await member.guild.invites.fetch();
        const oldInvites = invites[member.guild.id] || new Map();

        const usedInvite = newInvites.find(inv => {
            const prevUses = oldInvites.get(inv.code) || 0;
            return inv.uses > prevUses;
        });

        let inviterMention = 'Unknown';
        if (usedInvite && usedInvite.inviter) {
            inviterMention = `<@${usedInvite.inviter.id}>`;
        }

        const fullUser = await client17.users.fetch(member.user.id, { force: true });

        const welcomeEmbed = new EmbedBuilder()
            .setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) })
            .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) })
            .setColor('#787575')
            .setTitle('Welcome to the Server!')
            .setDescription(`Hello ${member}, welcome to **${member.guild.name}**! Enjoy your stay.`)
            .addFields(
                { name: 'Username', value: member.user.tag, inline: true },
                { name: 'Invited By', value: inviterMention, inline: true },
                { name: 'Invite Used', value: usedInvite ? `||${usedInvite.code}||` : 'Direct Join', inline: true },
                { name: 'You\'re Member', value: `${member.guild.memberCount}`, inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();
        
        if (welcomeImage) {
            welcomeEmbed.setImage(welcomeImage);
        }

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (welcomeChannel) {
            await welcomeChannel.send({ embeds: [welcomeEmbed] });
        }

        invites[member.guild.id] = new Map(newInvites.map(invite => [invite.code, invite.uses]));
    } catch (error) {
        console.error('Error handling guildMemberAdd event:', error);
    }
});

                
                  client17.on("interactionCreate" , async(interaction) => {
                    if(interaction.customId === "help_general"){
                      const embed = new EmbedBuilder()
                          .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
                          .setTitle('قائمة اوامر البوت')
                          .addFields(
                            {name : `\`/avatar\`` , value : `لرؤية افتارك او فتار شخص اخر`},
                            {name : `\`/server\` | \`${prefix}server\`` , value : `لرؤية معلومات السرفر`},
                            {name : `\`/user\`` , value : `لرؤية معلومات حسابك او حساب شخص اخر`},
                            {name : `\`/banner\`` , value : `لرؤية بانرك او بانر شخص اخر`},
                          )
                          .setTimestamp()
                          .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
                          .setColor('DarkButNotBlack');
                      const btns = new ActionRowBuilder().addComponents(
                          new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐').setDisabled(true),
                          new ButtonBuilder().setCustomId('help_admin').setLabel('ادمن').setStyle(ButtonStyle.Primary).setEmoji('🛠️'),
                      )
                  
                      await interaction.update({embeds : [embed] , components : [btns]})
                    }else if(interaction.customId === "help_admin"){
                      const embed = new EmbedBuilder()
                      .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
                      .setTitle('قائمة اوامر البوت')
                      .addFields(
                        {name : `\`/new-panel\`` , value : `انشاء بنل رتب جديد`},
                        {name : `\`/add-button\`` , value : `اضافة زر جديد للرتبة`},
                        {name : `\`/add-info-button\`` , value : `اضافة زر معلومات`},
                        {name : `\`/setup-welcome\`` , value : `تسطيب نظام الترحيب`},
                        {name : `\`/ban\`` , value : `لاعطاء باند لشخص او ازالته`},
                        {name : `\`/clear\` | \`${prefix}clear\`` , value : `لحذف عدد من الرسائل`},
                        {name : `\`/come\` | \`${prefix}come\`` , value : `لاستدعاء شخص`},
                        {name : `\`/embed\`` , value : `لقول كلام في ايمبد`},
                        {name : `\`/hide\` | \`${prefix}hide\`` , value : `لاخفاء روم`},
                        {name : `\`/kick\`` , value : `لاعطاء طرد لشخص او ازالته`},
                        {name : `\`/lock\` | \`${prefix}lock\`` , value : `لقفل روم`},
                        {name : `\`/nickname\`` , value : `اعطاء اسم مستعار لشخص او ازالته`},
                        {name : `\`/mute\`` , value : `لاعطاء ميوت لشخص او ازالته`},
                        {name : `\`/role\`` , value : `لاعطاء رتبة لشخص او ازالتها`},
                        {name : `\`/roles\`` , value : `للاستعلام عن رتب السيرفر`},
                        {name : `\`/say\` | \`${prefix}say\`` , value : `لقول كلام`},
                        {name : `\`/send\`` , value : `لارسال رسالة لشخص ما`},
                        {name : `\`/timeout\`` , value : `لاعطاء تايم اوت لشخص او ازالته`},
                        {name : `\`/unhide\` | \`${prefix}unhide\`` , value : `لاظهار روم`},
                        {name : `\`/unlock\` | \`${prefix}unlock\`` , value : `لفتح روم`},
                      )
                      .setTimestamp()
                      .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
                      .setColor('DarkButNotBlack');
                  const btns = new ActionRowBuilder().addComponents(
                      new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
                      new ButtonBuilder().setCustomId('help_admin').setLabel('ادمن').setStyle(ButtonStyle.Primary).setEmoji('🛠️').setDisabled(true),
                  )
                  
                  await interaction.update({embeds : [embed] , components : [btns]})
                    }
                  })

                  await client17.login(Bot_token).catch(async() => {
                    return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
                  })
                  if(!system) {
                      await tokens.set(`system` , [{token:Bot_token,prefix:Bot_prefix,clientId:client17.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`system` , {token:Bot_token,prefix:Bot_prefix,clientId:client17.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
        
            
            }catch(error){
                console.error(error)
                return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
            }
        }
    }
  }
}