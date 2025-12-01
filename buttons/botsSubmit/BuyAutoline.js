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
  StringSelectMenuBuilder,
  PermissionsBitField
} = require("discord.js");

const { Database } = require("st.db");
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens");
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");
const autolineDB = new Database("/Json-db/Bots/autolineDB.json");

let autoline = tokens.get("autoline");

const path = require('path');
const { readdirSync } = require("fs");

module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
      if(interaction.customId == "BuyAutoline_Modal") {
        await interaction.deferReply({ephemeral:true});

        let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`));
        const Bot_token = interaction.fields.getTextInputValue(`Bot_token`);
        const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`);

        const client10 = new Client({
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessageReactions, 
            GatewayIntentBits.GuildMessages, 
            GatewayIntentBits.GuildMessageTyping, 
            GatewayIntentBits.MessageContent
          ],
          shards: "auto",
          partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
        });

        try {
          const owner = interaction.user.id;
          let price1 = prices.get(`autoline_price_${interaction.guild.id}`) || 40;
          price1 = parseInt(price1);
          const newbalance = userbalance - price1;
          await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newbalance);

          function generateRandomCode() {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let code = '';
            for (let i = 0; i < 12; i++) {
              if (i > 0 && i % 4 === 0) code += '-';
              const randomIndex = Math.floor(Math.random() * characters.length);
              code += characters.charAt(randomIndex);
            }
            return code;
          }
          const invoice = generateRandomCode();

          const { REST } = require('@discordjs/rest');
          const rest = new REST({ version: '10' }).setToken(Bot_token);
          const { Routes } = require('discord-api-types/v10');

          client10.on("ready", async () => {
            let doneembeduser = new EmbedBuilder()
              .setTitle(`✅ Your bot was successfully created`)
              .setDescription(`**Invoice Information:**`)
              .addFields(
                { name:`Invoice`, value:`\`${invoice}\``, inline:false },
                { name:`Bot Type`, value:`\`Auction Bot\``, inline:false },
                { name:`Bot Token`, value:`\`${Bot_token}\``, inline:false },
                { name:`Prefix`, value:`\`${Bot_prefix}\``, inline:false }
              )
              .setColor("#A6D3CF")
              .setTimestamp();

            await invoices.set(`${invoice}_${interaction.guild.id}`, {
              type: `Autoline`,
              token: Bot_token,
              prefix: Bot_prefix,
              userid: interaction.user.id,
              guildid: interaction.guild.id,
              serverid: "General",
              price: price1
            });

            const inviteButton = new ButtonBuilder()
              .setLabel(`Invite Bot`)
              .setStyle(ButtonStyle.Link)
              .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client10.user.id}&permissions=8&scope=bot%20applications.commands`);

            const supportButton = new ButtonBuilder()
              .setLabel('Support Server')
              .setStyle(ButtonStyle.Link)
              .setURL('https://discord.gg/JRRwcxMyry'); // Your support server invite

            const youtubeButton = new ButtonBuilder()
              .setLabel('YouTube')
              .setStyle(ButtonStyle.Link)
              .setURL('https://youtube.com/@3mran77'); // Your YouTube channel

            const rowss = new ActionRowBuilder().addComponents(inviteButton, supportButton, youtubeButton);

            await interaction.user.send({embeds: [doneembeduser], components: [rowss]});
          });

          let doneembedprove = new EmbedBuilder()
            .setColor('#A6D3CF')
            .setTitle('New Purchase')
            .setDescription(`**Bot purchased by: ${interaction.user}**`)
            .addFields(
              {name: 'Buyer', value: `${interaction.user} | \`${interaction.user.tag}\``, inline: true},
              {name: 'Bot Type', value: '`Autoline Bot`', inline: true},
              {name: 'User Balance', value: `\`${newbalance}\``, inline: true},
              {name: 'Bot Price', value: `\`${price1}\``, inline: true}
            )
            .setImage(interaction.guild.banner ? interaction.guild.bannerURL({ dynamic: true, size: 1024 }) : null)
            .setFooter({ text: `Developed by ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setThumbnail(interaction.user.displayAvatarURL({dynamic: true}))
            .setTimestamp();

          const profileButton = new ButtonBuilder()
            .setLabel('Profile')
            .setURL(`https://discord.com/users/${interaction.user.id}`)
            .setStyle(ButtonStyle.Link)
            .setEmoji('👤');

          const logRow = new ActionRowBuilder().addComponents(profileButton);

          let logroom = setting.get(`log_room_${interaction.guild.id}`);
          let theroom = interaction.guild.channels.cache.find(ch => ch.id == logroom);
          if (theroom) await theroom.send({embeds:[doneembedprove], components: [logRow]});

          // Send webhook to official server logs
          const { WebhookClient } = require('discord.js');
          const { purchaseWebhookUrl } = require('../../config.json');
          const webhookClient = new WebhookClient({ url: purchaseWebhookUrl });
          const theEmbed = new EmbedBuilder()
            .setColor('#A6D3CF')
            .setTitle('New Purchase Completed')
            .addFields(
              {name: `Bot Type`, value: `\`\`\`Autoline\`\`\``, inline: true},
              {name: `Bot Price`, value: `\`\`\`${price1}\`\`\``, inline: true},
              {name: `Buyer`, value: `\`\`\`${interaction.user.username} [${interaction.user.id}]\`\`\``, inline: true},
              {name: `Server`, value: `\`\`\`${interaction.guild.name} [${interaction.guild.id}]\`\`\``, inline: true},
              {name: `Server Owner`, value: `\`\`\`${interaction.guild.ownerId}\`\`\``, inline: true},
              {name: `Invoice`, value: `\`\`\`${invoice}\`\`\``, inline: false}
            );
          await webhookClient.send({embeds: [theEmbed]});

          let userbots = usersdata.get(`bots_${interaction.user.id}_${interaction.guild.id}`);
          if(!userbots) {
            await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}`, 1);
          } else {
            userbots++;
            await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}`, userbots);
          }

          const successEmbed = new EmbedBuilder()
            .setColor('#A6D3CF')
            .setDescription(`<:Verified:1401460125612507156> Your bot has been created and \`${price1}\` has been deducted from your balance.`)
            .setTimestamp();

          await interaction.editReply({embeds: [successEmbed]});

          client10.commands = new Collection();
          client10.events = new Collection();

          require("../../Bots/autoline/handlers/events")(client10);
          require("../../events/requireBots/autoline-commands")(client10);

          const folderPath = path.resolve(__dirname, '../../Bots/autoline/slashcommand10');
          const prefix = Bot_prefix;
          client10.autolineSlashCommands = new Collection();
          const autolineSlashCommands = [];
          const ascii = require("ascii-table");
          const table = new ascii("autoline commands").setJustify();

          for (let folder of readdirSync(folderPath).filter(f => !f.includes("."))) {
            for (let file of readdirSync(`${folderPath}/${folder}`).filter(f => f.endsWith(".js"))) {
              let command = require(`${folderPath}/${folder}/${file}`);
              if (command) {
                autolineSlashCommands.push(command.data.toJSON());
                client10.autolineSlashCommands.set(command.data.name, command);
                if (command.data.name) {
                  table.addRow(`/${command.data.name}`, "🟢 Working");
                } else {
                  table.addRow(`/${command.data.name}`, "🔴 Not Working");
                }
              }
            }
          }

          const folderPath3 = path.resolve(__dirname, '../../Bots/autoline/handlers');
          for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
            require(path.join(folderPath3, file))(client10);
          }

client10.on("interactionCreate", async(interaction) => {
if (interaction.isChatInputCommand()) {

if (interaction.user.bot) return;

const command = client10.autolineSlashCommands.get(interaction.commandName);

if (!command) {
return;
}
if (command.ownersOnly === true) {
if (owner != interaction.user.id) {
return interaction.reply({content: `❗ ***You cannot use this command***`, ephemeral: true});
}
}
if (command.adminsOnly === true) {
if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
return interaction.reply({ content: `❗ ***You must have admin privileges to use this Command***`, ephemeral: true }); 
} 
} 
try { 

await command. execute(interaction); 
} catch (error) { 
return; 
} 
} 
} )




client10.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const line = autolineDB.get(`line_${message.guild.id}`);
  const lineMode = autolineDB.get(`line_mode_${message.guild.id}`) || 'image'; // Default to link if not set

  if (message.content === "-" || message.content === "خط") {
    if (line && message.member.permissions.has('ManageMessages')) {
      await message.delete();
      if (lineMode === 'link') {
        return message.channel.send({ content: `${line}` });
      } else if (lineMode === 'image') {
        return message.channel.send({ files: [line] });
      }
    }
  }
});

client10.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const autoChannels = autolineDB.get(`line_channels_${message.guild.id}`);
  if (autoChannels) {
    if (autoChannels.length > 0) {
      if (autoChannels.includes(message.channel.id)) {
        const line = autolineDB.get(`line_${message.guild.id}`);
        const lineMode = autolineDB.get(`line_mode_${message.guild.id}`) || 'image'; // Default to link if not set

        if (line) {
          if (lineMode === 'link') {
            return message.channel.send({ content: `${line}` });
          } else if (lineMode === 'image') {
            return message.channel.send({ files: [line] });
          }
        }
      }
    }
  }
});

client10.on("interactionCreate", async (interaction) => {
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
      .setDescription("**There are currently no commands in this category.**")
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setColor("DarkButNotBlack");
  } else if (selected === "owner") {
    embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTitle("Bot Commands Menu")
      .addFields(
        { name: `\`/set-line\``, value: `Set the line` },
        { name: `\`/add-autoline-channel\``, value: `Add an auto-line channel` },
        { name: `\`/remove-autoline-channel\``, value: `Remove an auto-line channel` },
        { name: `\`/line-mode\``, value: `Choose how to send the line (image/link)` },
        { name: `\`خط\` | \`-\``, value: `Send a line` },
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

  await interaction.update({ embeds: [embed], components: [row] });
});


          client10.on('ready', async () => {
            setInterval(async () => {
              let BroadcastTokenss = tokens.get("autoline");
              let thiss = BroadcastTokenss.find(br => br.token == Bot_token);
              if (thiss && thiss.timeleft <= 0) {
                console.log(`${client10.user.id} Ended`);
                await client10.destroy();
              }
            }, 1000);
          });

          client10.on("ready", async () => {
            try {
              await rest.put(
                Routes.applicationCommands(client10.user.id),
                { body: autolineSlashCommands }
              );
            } catch (error) {
              console.error(error);
            }
          });

          const folderPath2 = path.resolve(__dirname, '../../Bots/autoline/events');
          for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
            require(path.join(folderPath2, file));
          }

          client10.on("interactionCreate", async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            if (interaction.user.bot) return;

            const command = client10.autolineSlashCommands.get(interaction.commandName);
            if (!command) {
              console.error(`No command matching ${interaction.commandName} was found.`);
              return;
            }

            if (command.ownersOnly === true && owner != interaction.user.id) {
              const noPermEmbed = new EmbedBuilder()
                .setColor('#A6D3CF')
                .setDescription(`❗ You cannot use this command.`)
                .setTimestamp();
              return interaction.reply({embeds: [noPermEmbed], ephemeral: true});
            }

            if (command.adminsOnly === true && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
              const noAdminEmbed = new EmbedBuilder()
                .setColor('#A6D3CF')
                .setDescription(`❗ You need Administrator permission to use this command.`)
                .setTimestamp();
              return interaction.reply({ embeds: [noAdminEmbed], ephemeral: true });
            }

            try {
              await command.execute(interaction);
            } catch (error) {
              console.error(`Error executing ${interaction.commandName}`);
              console.error(error);
            }
          });

          await client10.login(Bot_token).catch(async () => {
            const failEmbed = new EmbedBuilder()
              .setColor('#A6D3CF')
              .setDescription(`<:Warning:1401460074937057422> Verification failed, please enable the last three options in your bot's settings.`)
              .setTimestamp();
            return interaction.editReply({embeds: [failEmbed]});
          });

          if(!autoline) {
            await tokens.set("autoline", [{token: Bot_token, prefix: Bot_prefix, clientId: client10.user.id, owner: interaction.user.id, timeleft: 2629744}]);
          } else {
            await tokens.push("autoline", {token: Bot_token, prefix: Bot_prefix, clientId: client10.user.id, owner: interaction.user.id, timeleft: 2629744});
          }

        } catch(error) {
          console.error(error);
          const errorEmbed = new EmbedBuilder()
            .setColor('#A6D3CF')
            .setDescription(`<:Warning:1401460074937057422> Please enable the last three options or verify the bot token and try again.`)
            .setTimestamp();
          return interaction.editReply({embeds: [errorEmbed]});
        }
      }
    }
  }
};
