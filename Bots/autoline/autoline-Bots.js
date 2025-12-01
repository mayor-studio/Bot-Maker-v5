
  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, Attachment, ChatInputCommandInteraction, StringSelectMenuBuilder, SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db")
const autolineDB = new Database("/Json-db/Bots/autolineDB.json")
const tokens = new Database("/tokens/tokens")
const { PermissionsBitField } = require('discord.js')
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let autoline = tokens.get('autoline')
if(!autoline) return;
const path = require('path');
const { readdirSync } = require("fs");
let theowner;
autoline.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client10 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client10.commands = new Collection();
  require(`./handlers/events`)(client10);
  client10.events = new Collection();
  require(`../../events/requireBots/autoline-commands`)(client10);
  const rest = new REST({ version: '10' }).setToken(token);
  client10.setMaxListeners(1000)

  client10.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client10.user.id),
          { body: autolineSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
          
        }

    });
        client10.once('ready', () => {

    client10.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`autoline bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client10.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`autoline`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client10.users.cache.get(owner) || await client10.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : خط تلقائي\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`autoline`, filtered);
          await client10.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`../autoline/handlers/events`)(client10)

  const folderPath = path.join(__dirname, 'slashcommand10');
  client10.autolineSlashCommands = new Collection();
  const autolineSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("autoline commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
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



const folderPath2 = path.join(__dirname, 'slashcommand10');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/autoline-commands`)(client10)
require("./handlers/events")(client10)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client10.once(event.name, (...args) => event.execute(...args));
	} else {
		client10.on(event.name, (...args) => event.execute(...args));
	}
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



   client10.login(token)
   .catch(async(err) => {
    const filtered = autoline.filter(bo => bo != data)
			await tokens.set(`autoline` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
