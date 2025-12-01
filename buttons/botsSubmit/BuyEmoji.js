  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, ChatInputCommandInteraction, StringSelectMenuBuilder, SlashCommandBuilder, PermissionsBitField  } = require("discord.js");
const { Database } = require("st.db");
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont('./Bots/emoji/handlers/DGTrikaRegular.ttf', { family: 'Trika' });
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database("/database/usersdata/usersdata");
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens");
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");


let emoji = tokens.get(`emoji`);
const path = require('path');
const { readdirSync } = require("fs");

module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    if (interaction.isModalSubmit()) {
      if (interaction.customId == "BuyEmoji_Modal") {
        await interaction.deferReply({ ephemeral: true });
        let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`));
        const Bot_token = interaction.fields.getTextInputValue(`Bot_token`);
        const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`);
        const client31 = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember] });

        try {
          const owner = interaction.user.id;
          let price1 = prices.get(`emoji_price_${interaction.guild.id}`) || 200;
          price1 = parseInt(price1);
          const newbalance = parseInt(userbalance) - parseInt(price1);
          await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newbalance);

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

          client31.on("ready", async () => {
            let doneembeduser = new EmbedBuilder()
              .setTitle(`**تم انشاء بوتك بنجاح**`)
              .setDescription(`**معلومات الفاتورة :**`)
              .addFields(
                {
                  name: `**الفاتورة**`, value: `**\`${invoice}\`**`, inline: false
                },
                {
                  name: `**نوع البوت**`, value: `**\`System Emoji Bot\`**`, inline: false
                },
                {
                  name: `**توكن البوت**`, value: `**\`${Bot_token}\`**`, inline: false
                },
                {
                  name: `**البريفكس**`, value: `**\`${Bot_prefix}\`**`, inline: false
                }
              );
            await invoices.set(`${invoice}_${interaction.guild.id}`,
              {
                type: `ايموجي`,
                token: `${Bot_token}`,
                prefix: `${Bot_prefix}`,
                userid: `${interaction.user.id}`,
                guildid: `${interaction.guild.id}`,
                serverid: `عام`,
                price: price1
              });
            
            const thebut = new ButtonBuilder()
              .setLabel(`دعوة البوت`)
              .setStyle(ButtonStyle.Link)
              .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client31.user.id}&permissions=8&scope=bot%20applications.commands`);

            const supportButton = new ButtonBuilder()
              .setLabel('سيرفر الدعم')
              .setStyle(ButtonStyle.Link)
              .setURL('https://discord.gg/JRRwcxMyry'); // Replace with your support server invite

            const youtubeButton = new ButtonBuilder()
              .setLabel('يوتيوب')
              .setStyle(ButtonStyle.Link)
              .setURL('https://youtube.com/@3mran77'); // Replace with your YouTube channel

            const rowss = new ActionRowBuilder().addComponents(thebut, supportButton, youtubeButton);
            await interaction.user.send({ embeds: [doneembeduser], components: [rowss] });
          });

                let doneembedprove = new EmbedBuilder()
                    .setColor('Aqua')
                    .setTitle('عملية شراء جديدة')
                    .addFields(
                        {name: 'المشتري', value: `${interaction.user} | \`${interaction.user.tag}\``, inline: true},
                        {name: 'نوع البوت', value: '`**System Emoji Bot**`', inline: true},
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
          const { WebhookClient } = require('discord.js');
          const { purchaseWebhookUrl } = require('../../config.json');
          const webhookClient = new WebhookClient({ url: purchaseWebhookUrl });
          const theEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('تمت عملية شراء جديدة')
            .addFields(
              { name: `نوع البوت`, value: `\`\`\`ايموجي\`\`\``, inline: true },
              { name: `سعر البوت`, value: `\`\`\`${price1}\`\`\``, inline: true },
              { name: `المشتري`, value: `\`\`\`${interaction.user.username} , [${interaction.user.id}]\`\`\``, inline: true },
              { name: `السيرفر`, value: `\`\`\`${interaction.guild.name} [${interaction.guild.id}]\`\`\``, inline: true },
              { name: `صاحب السيرفر`, value: `\`\`\`${interaction.guild.ownerId}\`\`\``, inline: true },
              { name: `الفاتورة`, value: `\`\`\`${invoice}\`\`\``, inline: false },
            );
          await webhookClient.send({ embeds: [theEmbed] });

          let userbots = usersdata.get(`bots_${interaction.user.id}_${interaction.guild.id}`);
          if (!userbots) {
            await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}`, 1);
          } else {
            userbots = userbots + 1;
            await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}`, userbots);
          }
          await interaction.editReply({ content: `**تم انشاء بوتك بنجاح وتم خصم \`${price1}\` من رصيدك**` });

          client31.commands = new Collection();
          client31.events = new Collection();
          require("../../Bots/emoji/handlers/events")(client31);
          require("../../events/requireBots/emoji-commands")(client31);
          const folderPath = path.resolve(__dirname, '../../Bots/emoji/slashcommand31');
          const prefix = Bot_prefix;
          client31.emojiSlashCommands = new Collection();
          const emojiSlashCommands = [];
          const ascii = require("ascii-table");
          const table = new ascii("emoji commands").setJustify();
          for (let folder of readdirSync(folderPath).filter(
            (folder) => !folder.includes(".")
          )) {
            for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
              f.endsWith(".js")
            )) {
              let command = require(`${folderPath}/${folder}/${file}`);
              if (command) {
                emojiSlashCommands.push(command.data.toJSON());
                client31.emojiSlashCommands.set(command.data.name, command);
                if (command.data.name) {
                  table.addRow(`/${command.data.name}`, "🟢 Working");
                } else {
                  table.addRow(`/${command.data.name}`, "🔴 Not Working");
                }
              }
            }
          }

          const folderPath3 = path.resolve(__dirname, '../../Bots/emoji/handlers');
          for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
            const event = require(path.join(folderPath3, file))(client31);
          }



          client31.on('ready', async () => {
            setInterval(async () => {
              let BroadcastTokenss = tokens.get(`emoji`);
              let thiss = BroadcastTokenss.find(br => br.token == Bot_token);
              if (thiss) {
                if (thiss.timeleft <= 0) {
                  console.log(`${client31.user.id} Ended`);
                  await client31.destroy();
                }
              }
            }, 1000);
          });

          client31.on("ready", async () => {
            try {
              await rest.put(
                Routes.applicationCommands(client31.user.id),
                { body: emojiSlashCommands },
              );
            } catch (error) {
              console.error(error);
            }
          });

          const folderPath2 = path.resolve(__dirname, '../../Bots/emoji/events');
          for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
            const event = require(path.join(folderPath2, file));
          }

client31.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client31.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "❌ An error occurred while executing the command!", ephemeral: true });
        } else {
            await interaction.reply({ content: "❌ An error occurred while executing the command!", ephemeral: true });
        }
    }
});

            
   client31.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;

  const emojiChannelId = emojiDB.get(`emoji_channel_${message.guild.id}`);
  if (!emojiChannelId || message.channel.id !== emojiChannelId) return;

  const { parseEmoji } = require("discord.js");
  const addedEmojis = [];
  const failed = [];

  // Helper to check image extension
  const isImage = url => {
    if (!url) return false;
    const ext = url.split('.').pop().toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
  };

  // 1. Handle custom discord emojis in message content
  const customEmojiRegex = /<(a)?:(\w+):(\d{17,19})>/g;
  let match;
  while ((match = customEmojiRegex.exec(message.content)) !== null) {
    // match[1] is "a" if animated, match[2] is name, match[3] is id
    const emojiUrl = `https://cdn.discordapp.com/emojis/${match[3]}.${match[1] === "a" ? "gif" : "png"}`;
    const emojiName = `${match[2]}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    try {
      const emoji = await message.guild.emojis.create({ attachment: emojiUrl, name: emojiName });
      addedEmojis.push(emoji);
    } catch (error) {
      failed.push(`<${match[1] ? "a" : ""}:${match[2]}:${match[3]}>`);
    }
  }

  // 2. Handle direct image links in the message content
  const words = message.content.split(/\s+/);
  for (const word of words) {
    if (isImage(word)) {
      const emojiName = `emoji_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      try {
        const emoji = await message.guild.emojis.create({ attachment: word, name: emojiName });
        addedEmojis.push(emoji);
      } catch (error) {
        failed.push(word);
      }
    }
  }

  // 3. Handle attached images
  if (message.attachments && message.attachments.size > 0) {
    for (const attachment of message.attachments.values()) {
      if (isImage(attachment.url)) {
        const emojiName = `emoji_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        try {
          const emoji = await message.guild.emojis.create({ attachment: attachment.url, name: emojiName });
          addedEmojis.push(emoji);
        } catch (error) {
          failed.push(attachment.url);
        }
      }
    }
  }

// Response to user
const response = [];
if (addedEmojis.length)
  response.push(`${addedEmojis.length} emojis have been added: ${addedEmojis.map(e => `<:${e.name}:${e.id}>`).join(', ')}`);
if (failed.length)
  response.push(`❌ Failed to add: ${failed.join(', ')}`);
if (response.length)
  await message.reply({ content: response.join('\n') });
   });

    
    client31.on("interactionCreate", async (interaction) => {
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
        { name: `\`/change-avatar\``, value: `To change the bot avatar` },
        { name: `\`/change-avatar\``, value: `To change the bot username` },
        { name: `\`/set-emoji-channel\``, value: `Set the emoji adding channel` },
        { name: `\`/remove-emoji-channel\``, value: `Remove the emoji adding channel` },
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
          await client31.login(Bot_token).catch(async () => {
            return interaction.editReply({ content: `**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**` });
          });

          if (!emoji) {
            await tokens.set(`emoji`, [{ token: Bot_token, prefix: Bot_prefix, clientId: client31.user.id, owner: interaction.user.id, timeleft: 2629744 }]);
          } else {
            await tokens.push(`emoji`, { token: Bot_token, prefix: Bot_prefix, clientId: client31.user.id, owner: interaction.user.id, timeleft: 2629744 });
          }

        } catch (error) {
          console.error(error);
          return interaction.editReply({ content: `**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**` });
        }
      }
    }
  }
}