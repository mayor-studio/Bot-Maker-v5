const { Client, Collection, discord, GatewayIntentBits, Partials, EmbedBuilder, ApplicationCommandOptionType, Events, ActionRowBuilder, ButtonBuilder, MessageAttachment, ButtonStyle, Message, Attachment, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const Discord = require('discord.js');
const mentionProtectDB = new Database('/Json-db/Bots/mentionProtectDB.json');
const tokens = new Database("/tokens/tokens");
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");

let mention = tokens.get('mention');
if (!mention) return;

const path = require('path');
const { readdirSync } = require("fs");
let theowner;
mention.forEach(async (data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix, token, clientId, owner } = data;
  theowner = owner;

  const client30 = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageTyping,
      GatewayIntentBits.MessageContent
    ],
    shards: "auto",
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
  });

  client30.commands = new Collection();
  require(`./handlers/events`)(client30);
  client30.events = new Collection();
  require(`../../events/requireBots/mention-commands`)(client30);

  const rest = new REST({ version: '10' }).setToken(token);
  client30.setMaxListeners(1000);

  client30.on("ready", async () => {
    try {
      await rest.put(
        Routes.applicationCommands(client30.user.id),
        { body: mentionSlashCommands },
      );
    } catch (error) {
      console.error(error);
    }
  });

  client30.once('ready', () => {
    client30.guilds.cache.forEach(guild => {
      guild.members.fetch().then(members => {
        if (members.size < 10) {
          console.log(`Mention bot : Guild: ${guild.name} has less than 10 members`);
        }
      }).catch(console.error);
    });
  });

  //------------- التحقق من وقت البوت --------------//
  client30.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokens = tokens.get(`mention`) || [];
      let thiss = BroadcastTokens.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client30.users.cache.get(owner) || await client30.users.fetch(owner);
          const embed = new EmbedBuilder()
            .setDescription(`**مرحبا <@${thiss.owner}>، لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : منشن\nالاشتراك انتهى**`)
            .setColor("DarkerGrey")
            .setTimestamp();
          await user.send({ embeds: [embed] }).catch((err) => { console.log(err); });

          const filtered = BroadcastTokens.filter((bo) => bo != thiss);
          await tokens.set(`mention`, filtered);
          await client30.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });

  require(`./handlers/events`)(client30);

  const folderPath = path.join(__dirname, 'slashcommand30');
  client30.mentionSlashCommands = new Collection();
  const mentionSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("Mention commands").setJustify();

  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
  )) {
    for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
    )) {
      let command = require(`${folderPath}/${folder}/${file}`);
      if (command) {
        mentionSlashCommands.push(command.data.toJSON());
        client30.mentionSlashCommands.set(command.data.name, command);
        if (command.data.name) {
          table.addRow(`/${command.data.name}`, "🟢 Working");
        } else {
          table.addRow(`/${command.data.name}`, "🔴 Not Working");
        }
      }
    }
  }

  const folderPath2 = path.join(__dirname, 'slashcommand30');
  for (let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
    for (let fiee of (readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
      require(`${folderPath2}/${foldeer}/${fiee}`);
    }
  }

  require(`../../events/requireBots/mention-commands`)(client30);
  require("./handlers/events")(client30);

  for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
    const event = require(`./events/${file}`);
    if (event.once) {
      client30.once(event.name, (...args) => event.execute(...args));
    } else {
      client30.on(event.name, (...args) => event.execute(...args));
    }
  }

  // Mention protection listener
  client30.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    const guildId = message.guild?.id;
    if (!guildId) return;

    const guildProtect = mentionProtectDB.get(guildId) || {};
    const mentionedUsers = message.mentions.users;
    if (!mentionedUsers.size) return;

    for (const [id, user] of mentionedUsers) {
      if (guildProtect[id]) {
        const timeoutSeconds = guildProtect[id];
        const member = message.guild.members.cache.get(message.author.id);

        if (member && member.moderatable) {
          try {
            await member.timeout(timeoutSeconds * 1000, `Mentioned protected member: ${user.tag}`);
            await message.reply(`🚫 ${message.author}, تم إعطاؤك تايم أوت لمدة ${timeoutSeconds} ثانية بسبب منشن`);
          } catch (err) {
            console.error(`Failed to timeout ${message.author.tag}:`, err);
          }
        }
        break;
      }
    }
  });

  client30.login(token)
    .catch(async (err) => {
      const filtered = mention.filter(bo => bo != data);
      await tokens.set(`mention`, filtered);
      console.log(`${clientId} Not working and removed`);
    });
});
