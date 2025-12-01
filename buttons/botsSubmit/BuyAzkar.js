const { 
  Client, 
  Collection, 
  discord,
  GatewayIntentBits, 
  Partials, 
  EmbedBuilder, 
  ApplicationCommandOptionType, 
  Events, 
  ActionRowBuilder, 
  ButtonBuilder, 
  MessageAttachment, 
  ButtonStyle, 
  Message,
  PermissionsBitField,
  StringSelectMenuBuilder
} = require("discord.js");

const { Database } = require("st.db");
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens");
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");
const azkarDB = new Database("/Json-db/Bots/azkarDB.json");

let azkar = tokens.get(`azkar`);

const path = require('path');
const { readdirSync } = require("fs");

module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    if (interaction.isModalSubmit()) {
      if (interaction.customId == "BuyAzkar_Modal") {
        await interaction.deferReply({ ephemeral: true });
        let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`)) || 0;
        const Bot_token = interaction.fields.getTextInputValue(`Bot_token`);
        const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`);

        const client23 = new Client({
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageTyping,
            GatewayIntentBits.MessageContent,
          ],
          shards: "auto",
          partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
        });

        try {
          const owner = interaction.user.id;
          let price1 = prices.get(`azkar_price_${interaction.guild.id}`) || 1;
          price1 = parseInt(price1);
          const newbalance = userbalance - price1;
          await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newbalance);

          function generateRandomCode() {
            const characters = 'AazkarDEFGHIJKLMNOPQRSTUVWXYZaazkardefghijklmnopqrstuvwxyz0123456789';
            let code = '';
            for (let i = 0; i < 12; i++) {
              if (i > 0 && i % 4 === 0) code += '-';
              const randomIndex = Math.floor(Math.random() * characters.length);
              code += characters.charAt(randomIndex);
            }
            return code;
          }
          const invoice = generateRandomCode();

          let doneembeduser = new EmbedBuilder()
            .setTitle(`✅ Your bot has been created successfully`)
            .setDescription(`**Invoice Information:**`)
            .addFields(
              { name: `Invoice`, value: `\`${invoice}\``, inline: false },
              { name: `Bot Type`, value: `\`Azkar Bot\``, inline: false },
              { name: `Bot Token`, value: `\`${Bot_token}\``, inline: false },
              { name: `Prefix`, value: `\`${Bot_prefix}\``, inline: false }
            )
            .setColor("#A6D3CF")
            .setTimestamp();

          await invoices.set(`${invoice}_${interaction.guild.id}`, {
            type: `Azkar`,
            token: Bot_token,
            prefix: Bot_prefix,
            userid: interaction.user.id,
            guildid: interaction.guild.id,
            serverid: `General`,
            price: price1,
          });

          const { REST } = require('@discordjs/rest');
          const rest = new REST({ version: '10' }).setToken(Bot_token);
          const { Routes } = require('discord-api-types/v10');

          client23.on('ready', async () => {
            const inviteButton = new ButtonBuilder()
              .setLabel(`Invite Bot`)
              .setStyle(ButtonStyle.Link)
              .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client23.user.id}&permissions=8&scope=bot%20applications.commands`);

            const supportButton = new ButtonBuilder()
              .setLabel('Support Server')
              .setStyle(ButtonStyle.Link)
              .setURL('https://discord.gg/JRRwcxMyry'); // Your support server invite

            const youtubeButton = new ButtonBuilder()
              .setLabel('YouTube')
              .setStyle(ButtonStyle.Link)
              .setURL('https://youtube.com/@3mran77'); // Your YouTube channel

            const rowss = new ActionRowBuilder().addComponents(inviteButton, supportButton, youtubeButton);

            await interaction.user.send({ embeds: [doneembeduser], components: [rowss] });
          });

          let doneembedprove = new EmbedBuilder()
            .setColor('#A6D3CF')
            .setTitle('New Purchase Made')
            .addFields(
              { name: 'Buyer', value: `${interaction.user} | \`${interaction.user.tag}\``, inline: true },
              { name: 'Bot Type', value: '`Azkar Bot`', inline: true },
              { name: 'User Balance', value: `\`${newbalance}\``, inline: true },
              { name: 'Bot Price', value: `\`${price1}\``, inline: true }
            )
            .setImage(interaction.guild.banner ? interaction.guild.bannerURL({ dynamic: true, size: 1024 }) : null)
            .setFooter({ text: `Developed by ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

          const profileButton = new ButtonBuilder()
            .setLabel('Profile')
            .setURL(`https://discord.com/users/${interaction.user.id}`)
            .setStyle(ButtonStyle.Link)
            .setEmoji('👤');

          const logRow = new ActionRowBuilder().addComponents(profileButton);

          let logroom = setting.get(`log_room_${interaction.guild.id}`);
          let theroom = interaction.guild.channels.cache.find(ch => ch.id == logroom);
          if (theroom) await theroom.send({ embeds: [doneembedprove], components: [logRow] });

          // Official webhook log
          const { WebhookClient } = require('discord.js');
          const { purchaseWebhookUrl } = require('../../config.json');
          const webhookClient = new WebhookClient({ url: purchaseWebhookUrl });
          const theEmbed = new EmbedBuilder()
            .setColor('#A6D3CF')
            .setTitle('New Purchase Made')
            .addFields(
              { name: `Bot Type`, value: `\`\`\`Azkar\`\`\``, inline: true },
              { name: `Bot Price`, value: `\`\`\`${price1}\`\`\``, inline: true },
              { name: `Buyer`, value: `\`\`\`${interaction.user.username} , [${interaction.user.id}]\`\`\``, inline: true },
              { name: `Server`, value: `\`\`\`${interaction.guild.name} [${interaction.guild.id}]\`\`\``, inline: true },
              { name: `Server Owner`, value: `\`\`\`${interaction.guild.ownerId}\`\`\``, inline: true },
              { name: `Invoice`, value: `\`\`\`${invoice}\`\`\``, inline: false }
            );
          await webhookClient.send({ embeds: [theEmbed] });

          let userbots = usersdata.get(`bots_${interaction.user.id}_${interaction.guild.id}`);
          if (!userbots) {
            await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}`, 1);
          } else {
            userbots++;
            await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}`, userbots);
          }

          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor("#A6D3CF")
                .setDescription(`<:Verified:1401460125612507156> Your bot has been created successfully and \`${price1}\` has been deducted from your balance.`)
                .setTimestamp(),
            ],
          });

          // Setup slash commands and events loading as before...
          client23.commands = new Collection();
          client23.events = new Collection();

          const folderPath = path.resolve(__dirname, '../../Bots/azkar/slashcommand23');
          const prefix = Bot_prefix;
          client23.azkarSlashCommands = new Collection();
          const azkarSlashCommands = [];
          const ascii = require("ascii-table");
          const table = new ascii("azkar commands").setJustify();

          for (let folder of readdirSync(folderPath).filter((folder) => !folder.includes("."))) {
            for (let file of readdirSync(`${folderPath}/` + folder).filter((f) => f.endsWith(".js"))) {
              let command = require(`${folderPath}/${folder}/${file}`);
              if (command) {
                azkarSlashCommands.push(command.data.toJSON());
                client23.azkarSlashCommands.set(command.data.name, command);
                if (command.data.name) {
                  table.addRow(`/${command.data.name}`, "🟢 Working");
                } else {
                  table.addRow(`/${command.data.name}`, "🔴 Not Working");
                }
              }
            }
          }

          const folderPath3 = path.resolve(__dirname, '../../Bots/azkar/handlers');
          for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
            require(path.join(folderPath3, file))(client23);
          }

          client23.on("ready", async () => {
            try {
              await rest.put(
                Routes.applicationCommands(client23.user.id),
                { body: azkarSlashCommands },
              );
            } catch (error) {
              console.error(error);
            }
          });

          const folderPath2 = path.resolve(__dirname, '../../Bots/azkar/events');
          for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
            require(path.join(folderPath2, file));
          }

          client23.on("interactionCreate", async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            if (interaction.user.bot) return;

            const command = client23.azkarSlashCommands.get(interaction.commandName);
            if (!command) {
              console.error(`No command matching ${interaction.commandName} was found.`);
              return;
            }
            if (command.ownersOnly === true && owner != interaction.user.id) {
              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor("#A6D3CF")
                    .setDescription(`❗ You are not allowed to use this command.`),
                ],
                ephemeral: true,
              });
            }
            if (command.adminsOnly === true && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor("#A6D3CF")
                    .setDescription(`❗ You must have Administrator permission to use this command.`),
                ],
                ephemeral: true,
              });
            }
            try {
              await command.execute(interaction);
            } catch (error) {
              console.error(`Error executing ${interaction.commandName}`);
              console.error(error);
            }
          });

 client23.on("ready" , async() => {
    setInterval(() => {
      client23.guilds.cache.forEach(async(guild) => {
        let theAzkarRoom = await azkarDB.get(`azkar_room_${guild.id}`)
        if(!theAzkarRoom) return;
        let theRoom = await guild.channels.cache.find(ch => ch.id == theAzkarRoom)
        let {azkar} = require(`./azkarData/azkar.json`)
        let randomNum = Math.floor(Math.random() * azkar.length)
        let randomZekr = azkar[randomNum]
        let line = azkarDB.get(`azkar_line_${guild.id}`);
        let embed1 = new EmbedBuilder()
        .setTitle(`**عطروا افواهكم بذكر الله**`)
        .setColor(`#0956c6`)
        .setTimestamp()
        .setFooter({text:`الأذكــار`})
        .setThumbnail(`https://i.postimg.cc/g0rDXc6q/2714091.png`)
        .setDescription(`**\`\`\`${randomZekr}\`\`\`**`)
        await theRoom.send({embeds:[embed1]}).catch(async() => {return;})
        if(line){
          await theRoom.send(`${line}`).catch(async() => {return;})
        }
        //-
        let thePrayersRoom = await azkarDB.get(`prayers_room_${guild.id}`)
        if(!thePrayersRoom) return;
        let theRoom2 = await guild.channels.cache.find(ch => ch.id == thePrayersRoom)
        let {prayers} = require(`./azkarData/prayers.json`)
        let randomNum2 = Math.floor(Math.random() * prayers.length)
        let randomPrayer = azkar[randomNum2]
        let embed2 = new EmbedBuilder()
        .setTitle(`**اَلدُّعَاءُ في الإسلام هي عبادة**`)
        .setColor(`#0956c6`)
        .setTimestamp()
        .setFooter({text:`اَلأدُّعَــيــة`})
        .setThumbnail(`https://i.postimg.cc/g0rDXc6q/2714091.png`)
        .setDescription(`**\`\`\`${randomPrayer}\`\`\`**`)
        await theRoom2.send({embeds:[embed2]}).catch(async() => {return;})
        if(line){
          await theRoom2.send(`${line}`).catch(async() => {return;})
        }
        //-
        let theVersesRoom = await azkarDB.get(`verse_${guild.id}`)
        if(!theVersesRoom) return;
        let theRoom3 = await guild.channels.cache.find(ch => ch.id == theVersesRoom)
        let {verses} = require(`./azkarData/verses.json`)
        let randomNum3 = Math.floor(Math.random() * verses.length)
        let randomVerse = verses[randomNum3]
        let embed3 = new EmbedBuilder()
        .setTitle(`**أبتدئ قراءة القرآن باسم الله مستعينا به**`)
        .setColor(`#0956c6`)
        .setTimestamp()
        .setFooter({text:`الأيـــات`})
        .setThumbnail(`https://i.postimg.cc/g0rDXc6q/2714091.png`)
        .setDescription(`**\`\`\`${randomVerse}\`\`\`**`)
        await theRoom3.send({embeds:[embed3]}).catch(async() => {return;})
        if(line){
          await theRoom3.send(`${line}`).catch(async() => {return;})
        }
        //-
        let theInfoRoom = await azkarDB.get(`religious_information_${guild.id}`)
        if(!theInfoRoom) return;
        let theRoom4 = await guild.channels.cache.find(ch => ch.id == theInfoRoom)
        let {information} = require(`./azkarData/information.json`)
        let randomNum4 = Math.floor(Math.random() * information.length)
        let randomInfo = information[randomNum4]
        let embed4 = new EmbedBuilder()
        .setTitle(`**زود ثقافتك بمعرفة دينك**`)
        .setColor(`#0956c6`)
        .setTimestamp()
        .setFooter({text:`الـمـعـلومـات الـديـنـيـة`})
        .setThumbnail(`https://i.postimg.cc/g0rDXc6q/2714091.png`)
        .setDescription(`**\`\`\`${randomInfo}\`\`\`**`)
        await theRoom4.send({embeds:[embed4]}).catch(async() => {return;})
        if(line){
          await theRoom4.send(`${line}`).catch(async() => {return;})
        }

      })
    },  300_000);
  })


          client23.on("interactionCreate", async (interaction) => {
            if (!interaction.isStringSelectMenu()) return;

            if (interaction.customId === "help_menu") {
              let embed;

              if (interaction.values[0] === "general") {
                embed = new EmbedBuilder()
                  .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                  .setTitle('Bot Command List')
                  .addFields(
                    { name: `\`/help\``, value: `Show the commands list` },
                    { name: `\`/support\``, value: `Join the support server` }
                  )
                  .setTimestamp()
                  .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                  .setColor('#A6D3CF');
              } else if (interaction.values[0] === "owner") {
                embed = new EmbedBuilder()
                  .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                  .setTitle('Owner Command List')
                  .addFields(
                    { name: `\`/set-azkar-room\``, value: `Set Azkar room` },
                    { name: `\`/set-prayers-room\``, value: `Set prayers room` },
                    { name: `\`/set-religious-information-room\``, value: `Set religious info room` },
                    { name: `\`/set-verse-room\``, value: `Set verses room` },
                    { name: `\`/set-azkar-line\``, value: `Set Azkar line` },
                    { name: `\`/change-avatar\``, value: `Change bot avatar` },
                    { name: `\`/change-name\``, value: `Change bot name` },
                  )
                  .setTimestamp()
                  .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                  .setColor('#A6D3CF');
              }

              const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId("help_menu")
                  .setPlaceholder("Select command category")
                  .addOptions([
                    {
                      label: "General Commands",
                      description: "Show general commands",
                      value: "general",
                      emoji: "🌐",
                    },
                    {
                      label: "Owner Commands",
                      description: "Show owner commands and settings",
                      value: "owner",
                      emoji: "👑",
                    },
                  ])
              );

              await interaction.update({ embeds: [embed], components: [menu] });
            }
          });

          await client23.login(Bot_token).catch(async () => {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor("#A6D3CF")
                  .setDescription(`<:Warning:1401460074937057422> Verification failed, please enable the last three options in the bot settings.`)
              ],
            });
          });

          if (!azkar) {
            await tokens.set(`azkar`, [
              { token: Bot_token, prefix: Bot_prefix, clientId: client23.user.id, owner: interaction.user.id, timeleft: 2629744 },
            ]);
          } else {
            await tokens.push(`azkar`, {
              token: Bot_token,
              prefix: Bot_prefix,
              clientId: client23.user.id,
              owner: interaction.user.id,
              timeleft: 2629744,
            });
          }
        } catch (error) {
          console.error(error);
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor("#A6D3CF")
                .setDescription(`<:Warning:1401460074937057422> Please enable the last three options or verify your bot token and try again.`)
            ],
          });
        }
      }
    }
  },
};
