  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, Attachment, ChatInputCommandInteraction, StringSelectMenuBuilder, SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const { PermissionsBitField } = require('discord.js');
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const feedbackDB = new Database("/Json-db/Bots/feedbackDB.json")

let feedback = tokens.get(`feedback`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuyFeedback_Modal") {
            await interaction.deferReply({ephemeral:true})
            let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`))
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            
            const client11 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try{
                const owner = interaction.user.id
                let price1 = prices.get(`feedback_price_${interaction.guild.id}`) || 40;
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
               client11.on("ready" , async() => {
                let doneembeduser = new EmbedBuilder()
                .setTitle(`**تم انشاء بوتك بنجاح**`)
                .setDescription(`**معلومات الفاتورة :**`)
                .addFields(
                    {
                        name:`**الفاتورة**`,value:`**\`${invoice}\`**`,inline:false
                    },
                    {
                        name:`**نوع البوت**`,value:`**\`FeedBack Bot\`**`,inline:false
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
                        type:`اراء`,
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
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client11.user.id}&permissions=8&scope=bot%20applications.commands`);

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
                        {name: 'نوع البوت', value: '`**FeedBack Bot**`', inline: true},
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
                                                    {name : `نوع البوت` , value : `\`\`\`فيدباك\`\`\`` , inline : true},
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
                client11.commands = new Collection();
                client11.events = new Collection();
                require("../../Bots/feedback/handlers/events")(client11)
                require("../../events/requireBots/feedback-commands")(client11);
                const folderPath = path.resolve(__dirname, '../../Bots/feedback/slashcommand11');
                const prefix = Bot_prefix
                client11.feedbackSlashCommands = new Collection();
  const feedbackSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("feedback commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
      (folder) => !folder.includes(".")
      )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
          let command = require(`${folderPath}/${folder}/${file}`);
          if (command) {
              feedbackSlashCommands.push(command.data.toJSON());
              client11.feedbackSlashCommands.set(command.data.name, command);
              if (command.data.name) {
                  table.addRow(`/${command.data.name}`, "🟢 Working");
                } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
    }
}

const folderPath3 = path.resolve(__dirname, '../../Bots/feedback/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client11);
}

client11.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  
  const line = feedbackDB.get(`line_${message.guild.id}`);
  const chan = feedbackDB.get(`feedback_room_${message.guild.id}`);
  const feedbackMode = feedbackDB.get(`feedback_mode_${message.guild.id}`) || 'embed'; // Default to embed if not set
  const feedbackEmoji = feedbackDB.get(`feedback_emoji_${message.guild.id}`) || "❤"; // Default emoji

  if (chan) {
    if (message.channel.id !== chan) return;

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTimestamp()
      .setTitle(`<@${message.author.id}> Thanks for your Feedback
    
        ** 
${message.content} 
        **`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    if (feedbackMode === 'embed') {
      await message.delete();
      const themsg = await message.channel.send({ embeds: [embed] }); // Define themsg here
      await themsg.react("❤️‍🔥");
      await themsg.react("♥️");
      if (line) {
        await message.channel.send({ files: [line] });
      }
    } else if (feedbackMode === 'reactions') {
      await message.react(feedbackEmoji);
      if (line) {
        await message.channel.send({ files: [line] });
      }
    }
  }
});




client11.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "help_menu") return;

  const selected = interaction.values[0];
  let embed;

  if (selected === "general") {
    embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTitle("Bot Commands Menu")
      .addFields(
        { name: '`/help`', value: 'Show the command list' },
        { name: '`/support`', value: 'Join the support server' }
      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setColor("Random");
  } else if (selected === "owner") {
    embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTitle("Bot Commands Menu")
      .addFields(
        { name: '`/feedback-room`', value: 'Set the feedback channel' },
        { name: '`/remove-feedback-room`', value: 'Remove the feedback channel' },
        { name: '`/feedback-mode`', value: 'Set the feedback mode' },
        { name: '`/feedback-line`', value: 'Set the feedback image line' },
        { name: '`/change-avatar`', value: 'Change the bot avatar' },
        { name: '`/change-name`', value: 'Change the bot name' }
      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setColor("DarkButNotBlack");
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("help_menu")
    .setPlaceholder("Select a command category")
    .addOptions([
      {
        label: "General",
        value: "general",
        description: "General commands",
        emoji: "🌐",
        default: selected === "general",
      },
      {
        label: "Owner",
        value: "owner",
        description: "Owner-only commands",
        emoji: "👑",
        default: selected === "owner",
      },
    ]);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  try {
    await interaction.update({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error("❌ Failed to update select menu interaction:", error);
  }
});

  
client11.on('ready' , async() => {
    setInterval(async() => {
      let BroadcastTokenss = tokens.get(`feedback`)
      let thiss = BroadcastTokenss.find(br => br.token == Bot_token)
      if(thiss) {
        if(thiss.timeleft <= 0) {
            console.log(`${client11.user.id} Ended`)
          await client11.destroy();
        }
      }
    }, 1000);
  })
client11.on("ready" , async() => {
    
    try {
        await rest.put(
            Routes.applicationCommands(client11.user.id),
            { body: feedbackSlashCommands },
            );
            
        } catch (error) {
            console.error(error)
        }
        
    });
    const folderPath2 = path.resolve(__dirname, '../../Bots/feedback/events');
    for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
        const event = require(path.join(folderPath2, file));
    }
    client11.on("interactionCreate" , async(interaction) => {
        if (interaction.isChatInputCommand()) {
            if(interaction.user.bot) return;
            
            const command = client11.feedbackSlashCommands.get(interaction.commandName);
            
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
    
    

    await client11.login(Bot_token).catch(async() => {
        return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
      })
                  if(!feedback) {
                      await tokens.set(`feedback` , [{token:Bot_token,prefix:Bot_prefix,clientId:client11.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`feedback` , {token:Bot_token,prefix:Bot_prefix,clientId:client11.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
                  
                    }catch(error){
                        console.error(error)
                        return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
                    }
                }
            }
        }
    }