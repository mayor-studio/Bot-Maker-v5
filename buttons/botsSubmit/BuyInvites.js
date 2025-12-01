const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const prices = new Database("/database/settingsdata/prices");
const { PermissionsBitField } = require('discord.js');
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const inviterDB = new Database("/Json-db/Bots/inviterDB.json")

let invites = tokens.get(`invites`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuyInvites_Modal") {
            await interaction.deferReply({ephemeral:true})
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            
            const client15 = new Client({intents: 131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try {
                const owner = interaction.user.id;
                let price1 = prices.get(`invites_price_${interaction.guild.id}`) || 40;
                price1 = parseInt(price1);
                const userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`));
                const newbalance = userbalance - price1;

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
                        name:`**نوع البوت**`,value:`**\`Invites Bot\`**`,inline:false
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
                    type:`invites`,
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
                
                client15.on('ready' , async() => {
                  const price1 = prices.get(`invites_price_${interaction.guild.id}`) || 40;
                  const userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`));
                  const newbalance = userbalance - parseInt(price1);
                  
                  await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newbalance);
                  
                  const thebut = new ButtonBuilder()
                    .setLabel(`دعوة البوت`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client15.user.id}&permissions=8&scope=bot%20applications.commands`);

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
                        {name: 'نوع البوت', value: '`**Invites Bot**`', inline: true},
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
                                                  {name : `نوع البوت` , value : `\`\`\`invites\`\`\`` , inline : true},
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
                client15.commands = new Collection();
            client15.events = new Collection();
            require("../../Bots/invites/handlers/events")(client15)
            require("../../events/requireBots/invites-commands")(client15);
            const folderPath = path.resolve(__dirname, '../../Bots/invites/slashcommand15');
            const prefix = Bot_prefix
            client15.invitesSlashCommands = new Collection();
  const invitesSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("invites commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          invitesSlashCommands.push(command.data.toJSON());
          client15.invitesSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}
const folderPath3 = path.resolve(__dirname, '../../Bots/invites/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client15);
}

   client15.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const command = client15.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    await interaction.reply({ content: "❌ An error occurred while executing the command", ephemeral: true });
  }
});
    
const guildInvites = new Map();

client15.on('inviteCreate', async invite => {
  const invites = await invite.guild.invites.fetch();
  guildInvites.set(invite.guild.id, new Map(invites.map(i => [i.code, i.uses])));
});

client15.on('inviteDelete', async invite => {
  const invites = await invite.guild.invites.fetch();
  guildInvites.set(invite.guild.id, new Map(invites.map(i => [i.code, i.uses])));
});

client15.on('guildMemberAdd', async member => {
  if (member.user.bot) return;

  try {
    const newInvites = await member.guild.invites.fetch();
    const oldInvites = guildInvites.get(member.guild.id) || new Map();

    const usedInvite = newInvites.find(inv => {
      const oldUses = oldInvites.get(inv.code) || 0;
      return inv.uses > oldUses;
    });

    guildInvites.set(member.guild.id, new Map(newInvites.map(i => [i.code, i.uses])));

    if (!usedInvite || !usedInvite.inviter) return;
    
    const inviterId = usedInvite.inviter.id;

    // Track invitedBy
    inviterDB.set(`invitedBy_${member.id}`, inviterId);

    // Increment invite points
    const currentPoints = inviterDB.get(`invitePoints_${inviterId}`) || 0;
    inviterDB.set(`invitePoints_${inviterId}`, currentPoints + 1);

    // Track joined users
    const joinedUsers = inviterDB.get(`joinedUsers_${inviterId}`) || [];
    joinedUsers.push({
      id: member.id,
      username: member.user.tag,
      joinedAt: new Date().toISOString()
    });
    inviterDB.set(`joinedUsers_${inviterId}`, joinedUsers);

    // Optional welcome
    const welcomeChannelId = inviterDB.get(`welcomeChannel_${member.guild.id}`);
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
    if (welcomeChannel) {
      welcomeChannel.send(`🎉 <@${member.id}> joined using invite from <@${inviterId}>!`);
    }

  } catch (err) {
    console.error('Error in guildMemberAdd:', err);
  }
});

client15.on('guildMemberRemove', async member => {
  if (member.user.bot) return;

  try {
    const inviterId = inviterDB.get(`invitedBy_${member.id}`);
    if (!inviterId) return;

    // Remove invite point
    const points = inviterDB.get(`invitePoints_${inviterId}`) || 0;
    inviterDB.set(`invitePoints_${inviterId}`, Math.max(0, points - 1));

    // Increment left count
    const left = inviterDB.get(`leftUsers_${inviterId}`) || 0;
    inviterDB.set(`leftUsers_${inviterId}`, left + 1);

    // Track left user
    const leftUsersData = inviterDB.get(`leftUsersData_${inviterId}`) || [];
    leftUsersData.push({
      id: member.id,
      username: member.user.tag,
      leftAt: new Date().toISOString()
    });
    inviterDB.set(`leftUsersData_${inviterId}`, leftUsersData);

    // Remove link
    inviterDB.delete(`invitedBy_${member.id}`);

  } catch (err) {
    console.error('Error in guildMemberRemove:', err);
  }
});
    
     client15.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "help_menu") return;

  const selected = interaction.values[0];
  let embed;

  if (selected === "help_general") {
    embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTitle("Bot Command List")
      .setDescription("**There are currently no commands in this category.**")
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setColor("DarkButNotBlack");
  } else if (selected === "help_owner") {
    embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTitle("Bot Command List")
      .addFields(
{name: `\`/invites-room\``, value: `Set the invite channel`},
{name: `\`/invites\``, value: `Show the number of invites for a user`},
{name: `\`/add-invites\``, value: `Add invites to a user`},
{name: `\`/remove-room\``, value: `Remove the invite channel`},
{name: `\`/reset-all-invites\``, value: `Reset invites for all users`},
{name: `\`/reset-invites\``, value: `Reset invites for a user`},
{name: `\`/change-avatar\``, value: `Change the bot's avatar`},
{name: `\`/change-name\``, value: `Change the bot's name`},

      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setColor("DarkButNotBlack");
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("help_menu")
    .setPlaceholder("Select a command category")
    .addOptions([
      {
        label: "General",
        value: "help_general",
        description: "General commands available to all users.",
        emoji: "🌐",
        default: selected === "help_general"
      },
      {
        label: "Owner",
        value: "help_owner",
        description: "Commands only for the bot owner.",
        emoji: "👑",
        default: selected === "help_owner"
      }
    ]);

  const row = new ActionRowBuilder().addComponents(menu);

  await interaction.update({ embeds: [embed], components: [row] });
});
    
            client15.on("ready" , async() => {

                try {
                  await rest.put(
                    Routes.applicationCommands(client15.user.id),
                    { body: invitesSlashCommands },
                    );
                    
                  } catch (error) {
                    console.error(error)
                  }
          
              });
              const folderPath2 = path.resolve(__dirname, '../../Bots/invites/events');

            for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
                const event = require(path.join(folderPath2, file));
            }
                client15.on("interactionCreate" , async(interaction) => {
                    if (interaction.isChatInputCommand()) {
                        if(interaction.user.bot) return;
                      
                      const command = client15.invitesSlashCommands.get(interaction.commandName);
                        
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
                
                  client15.on("messageCreate" , async(message) => {
                    let client = message.client;
                  if (message.author.bot) return;
                  if (message.channel.type === 'dm') return;
                
                
                  if(!message.content.startsWith(prefix)) return;
                  const args = message.content.slice(prefix.length).trim().split(/ +/g); 
                  const cmd = args.shift().toLowerCase();
                  if(cmd.length == 0 ) return;
                  let command = client.commands.get(cmd)
                  if(!command) command = client15.commands.get(client.commandaliases.get(cmd));
                
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
                  await client15.login(Bot_token).catch(async() => {
                    return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
                  })
                  if(!invites) {
                      await tokens.set(`invites` , [{token:Bot_token,prefix:Bot_prefix,clientId:client15.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`invites` , {token:Bot_token,prefix:Bot_prefix,clientId:client15.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
        
            
            }catch(error){
                console.error(error)
                return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
            }
        }
    }
  }
}