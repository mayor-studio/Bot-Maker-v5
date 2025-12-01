  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, ChatInputCommandInteraction, StringSelectMenuBuilder, SlashCommandBuilder, PermissionsBitField  } = require("discord.js");
const { Database } = require("st.db")
const feelingsDB = new Database("/Json-db/Bots/feelingsDB.json")
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")

const moment = require('moment-timezone');
moment.tz.setDefault('Africa/Cairo');

let feelings = tokens.get('feelings')
if(!feelings) return;

const path = require('path');
const { readdirSync } = require("fs");
feelings.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client24 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client24.commands = new Collection();
  require(`./handlers/events`)(client24);
  client24.events = new Collection();
  require(`../../events/requireBots/feelings-commands`)(client24);
  const rest = new REST({ version: '10' }).setToken(token);
  client24.setMaxListeners(1000)

  client24.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client24.user.id),
          { body: feelingsSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client24.once('ready', () => {
    client24.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`feelings bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client24.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`feelings`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client24.users.cache.get(owner) || await client24.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : رومات شوب\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`feelings`, filtered);
          await client24.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`../feelings/handlers/events`)(client24)
  const folderPath = path.join(__dirname, 'slashcommand24');
  client24.feelingsSlashCommands = new Collection();
  const feelingsSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("feelings commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          feelingsSlashCommands.push(command.data.toJSON());
          client24.feelingsSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand24');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/feelings-commands`)(client24)
require("./handlers/events")(client24)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client24.once(event.name, (...args) => event.execute(...args));
	} else {
		client24.on(event.name, (...args) => event.execute(...args));
	}
	}

  client24.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    
    const feelingsRoom = await feelingsDB.get(`feelings_room_${message.guild.id}`);
    const reactions = await feelingsDB.get(`feelings_reactions_${message.guild.id}`) || {
      reaction1: '❤️',
      reaction2: '👍',
      reaction3: '🌟'
    };

    if (message.channel.id === feelingsRoom) {
      try {
        const feelingEmbed = new EmbedBuilder()
          .setTitle(message.author.tag)
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .setDescription(`**${message.content || "No content"}**`)
          .setColor('Random')
          .setTimestamp()
          .setFooter({ text: 'Feelings Bot' });

        if (message.attachments.size > 0) {
          feelingEmbed.setImage(message.attachments.first().url);
        }

        // Send embed and add reactions
        const embedMsg = await message.channel.send({ embeds: [feelingEmbed] });
        await embedMsg.react(reactions.reaction1);
        await embedMsg.react(reactions.reaction2);
        await embedMsg.react(reactions.reaction3);
        
        // Delete original message
        if (message.deletable) {
          await message.delete().catch(() => null);
        }

      } catch (error) {
        console.error('Error in feelings room:', error);
      }
    }
  });

client24.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {

    if (interaction.user.bot) return;

    const command = client24.feelingsSlashCommands.get(interaction.commandName);

    if (!command) return;

    if (command.ownersOnly === true) {
      if (owner !== interaction.user.id) {
        return interaction.reply({
          content: `❗ ***You do not have permission to use this command***`,
          ephemeral: true
        });
      }
    }

    if (command.adminsOnly === true) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({
          content: `❗ ***You must have Administrator permission to use this command***`,
          ephemeral: true
        });
      }
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.log(error);
    }
  }
});





 client24.on("interactionCreate", async (interaction) => {
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
        { name: `\`/set-feelings-room\``, value: `Set the feelings channel` },
        { name: `\`/remove-feelings-room\``, value: `Remove the configured feelings channel` },
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

   client24.login(token)
   .catch(async(err) => {
    const filtered = feelings.filter(bo => bo != data)
			await tokens.set(`feelings` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
