const { Client, Collection, discord, GatewayIntentBits, Partials, EmbedBuilder, ApplicationCommandOptionType, Events, ActionRowBuilder, ButtonBuilder, MessageAttachment, ButtonStyle, Message } = require("discord.js");
const { Database } = require("st.db");
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const { PermissionsBitField } = require('discord.js');
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens");
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");
const offersDB = new Database("/Json-db/Bots/offersDB.json");

let offers = tokens.get(`offers`);
const path = require('path');
const { readdirSync } = require("fs");

module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    if (interaction.isModalSubmit()) {
      if (interaction.customId == "BuyOffers_Modal") {
        await interaction.deferReply({ ephemeral: true });
        let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`));
        const Bot_token = interaction.fields.getTextInputValue(`Bot_token`);
        const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`);
        const client28 = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember] });

        try {
          const owner = interaction.user.id;
          let price1 = prices.get(`offers_price_${interaction.guild.id}`) || 40;
          price1 = parseInt(price1);

          // Calculate newbalance once
          const newbalance = parseInt(userbalance) - parseInt(price1);
          if (newbalance < 0) {
            return interaction.editReply({ content: "**رصيدك غير كافي لشراء البوت**" });
          }

          // Generate invoice
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

          client28.on("ready", async () => {
            // Just use the already calculated newbalance
            await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newbalance);
            
            let doneembeduser = new EmbedBuilder()
              .setTitle(`**تم انشاء بوتك بنجاح**`)
              .setDescription(`**معلومات الفاتورة :**`)
              .addFields(
                {
                  name: `**الفاتورة**`, value: `**\`${invoice}\`**`, inline: false
                },
                {
                  name: `**نوع البوت**`, value: `**\`Offers Bot\`**`, inline: false
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
                type: `عروض`,
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
              .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client28.user.id}&permissions=8&scope=bot%20applications.commands`);

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
                        {name: 'نوع البوت', value: '`**Offers Bot**`', inline: true},
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
              { name: `نوع البوت`, value: `\`\`\`عروض\`\`\``, inline: true },
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

          client28.commands = new Collection();
          client28.events = new Collection();
          require("../../Bots/offers/handlers/events")(client28);
          require("../../Bots/offers/handlers/offers")(client28);
          require("../../events/requireBots/offers-commands")(client28);
          const folderPath = path.resolve(__dirname, '../../Bots/offers/slashcommand28');
          const prefix = Bot_prefix;
          client28.offersSlashCommands = new Collection();
          const offersSlashCommands = [];
          const ascii = require("ascii-table");
          const table = new ascii("offers commands").setJustify();
          for (let folder of readdirSync(folderPath).filter(
            (folder) => !folder.includes(".")
          )) {
            for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
              f.endsWith(".js")
            )) {
              let command = require(`${folderPath}/${folder}/${file}`);
              if (command) {
                offersSlashCommands.push(command.data.toJSON());
                client28.offersSlashCommands.set(command.data.name, command);
                if (command.data.name) {
                  table.addRow(`/${command.data.name}`, "🟢 Working");
                } else {
                  table.addRow(`/${command.data.name}`, "🔴 Not Working");
                }
              }
            }
          }

          const folderPath3 = path.resolve(__dirname, '../../Bots/offers/handlers');
          for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
            const event = require(path.join(folderPath3, file))(client28);
          }

client28.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const chanList = await offersDB.get(`offers_room_${message.guild.id}`) || [];
    const roleId = await offersDB.get(`offers_role_${message.guild.id}`);
    const roomLink = await offersDB.get(`offers_roomlink_${message.guild.id}`);
    const offersMode = await offersDB.get(`offers_mode_${message.guild.id}`) || 'link';
    const attachments = message.attachments.map(att => att.url);

    if (chanList.includes(message.channel.id)) {
        const deleteButton = new ButtonBuilder()
            .setCustomId(`deloff_${message.author.id}`)
            .setLabel('Delete Offer')
      //      .setEmoji('🗑️') // إضافة الإيموجي
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder();

        if (offersMode === 'link') {
            const orderButton = new ButtonBuilder()
                .setLabel('Order Now')
                .setURL(roomLink)
                .setStyle(ButtonStyle.Link);
            row.addComponents(orderButton);
        } else if (offersMode === 'custom') {
            const customOrderButton = new ButtonBuilder()
                .setCustomId(`ord_${message.author.id}`)
                .setLabel('Order Now')
         //       .setEmoji('🛒') // إضافة الإيموجي
                .setStyle(ButtonStyle.Success);
            row.addComponents(customOrderButton);
        }

        row.addComponents(deleteButton); 

        const sentMessage = await message.channel.send({
            content: `${message.content}\n\nOffer By: ||<@${message.author.id}>||\nFor: ||<@&${roleId}>||`,
            components: [row],
            files: attachments
        }).catch(console.error);

        const line = await offersDB.get(`line_${message.guild.id}`);
        if (line) {
            await message.channel.send({ files: [line] }).catch(console.error);
        }

        return message.delete();
    }
});


client28.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    if (interaction.customId.startsWith('ord_')) {
        const userId = interaction.customId.split('_')[1];
        
        const confirmButton = new ButtonBuilder()
            .setCustomId(`aord_${userId}`)
            .setLabel('تأكيد')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cord')
            .setLabel('الغاء')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Secondary);
            
        const row = new ActionRowBuilder()
            .addComponents(confirmButton, cancelButton);
            
        await interaction.reply({
            content: 'هل أنت متأكد من فتح تكت لطلب هذا المنتج ؟',
            components: [row],
            ephemeral: true
        });
    }
    
if (interaction.customId === 'cord') {
    await interaction.update({
        content: 'تم الغاء الطلب بنجاح',
        components: [] 
    });
    }
        });


          client28.on("interactionCreate", async (interaction) => {
            if (interaction.customId === "help_general") {
              const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTitle('قائمة اوامر البوت')
                .setDescription('**لا توجد اوامر في هذا القسم حاليا**')
                .setTimestamp()
                .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor('DarkButNotBlack');
              const btns = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐').setDisabled(true),
                new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Primary).setEmoji('👑'),
              );

              await interaction.update({ embeds: [embed], components: [btns] });
            } else if (interaction.customId === "help_owner") {
              const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTitle('قائمة اوامر البوت')
                .addFields(
                { name: `\`/setup\``, value: `لتسطيب النظام` },
                { name: `\`/set-line\``, value: `لتحديد خط العروض` },
                { name: `\`/set-offers-room\``, value: `اضافة روم للعروض` },
                { name: `\`/remove-offers-room\``, value: `ازالة روم من العروض` },
                )
                .setTimestamp()
                .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor('DarkButNotBlack');
              const btns = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
                new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Primary).setEmoji('👑').setDisabled(true),
              );

              await interaction.update({ embeds: [embed], components: [btns] });
            }
          });

          client28.on('ready', async () => {
            setInterval(async () => {
              let BroadcastTokenss = tokens.get(`offers`);
              let thiss = BroadcastTokenss.find(br => br.token == Bot_token);
              if (thiss) {
                if (thiss.timeleft <= 0) {
                  console.log(`${client28.user.id} Ended`);
                  await client28.destroy();
                }
              }
            }, 1000);
          });

          client28.on("ready", async () => {
            try {
              await rest.put(
                Routes.applicationCommands(client28.user.id),
                { body: offersSlashCommands },
              );
            } catch (error) {
              console.error(error);
            }
          });

          const folderPath2 = path.resolve(__dirname, '../../Bots/offers/events');
          for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
            const event = require(path.join(folderPath2, file));
          }

          client28.on("interactionCreate", async (interaction) => {
            if (interaction.isChatInputCommand()) {
              if (interaction.user.bot) return;

              const command = client28.offersSlashCommands.get(interaction.commandName);

              if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
              }
              if (command.ownersOnly === true) {
                if (owner != interaction.user.id) {
                  return interaction.reply({ content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true });
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
          });

          await client28.login(Bot_token).catch(async () => {
            return interaction.editReply({ content: `**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**` });
          });

          if (!offers) {
            await tokens.set(`offers`, [{ token: Bot_token, prefix: Bot_prefix, clientId: client28.user.id, owner: interaction.user.id, timeleft: 2629744 }]);
          } else {
            await tokens.push(`offers`, { token: Bot_token, prefix: Bot_prefix, clientId: client28.user.id, owner: interaction.user.id, timeleft: 2629744 });
          }

        } catch (error) {
          console.error(error);
          return interaction.editReply({ content: `**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**` });
        }
      }
    }
  }
}
