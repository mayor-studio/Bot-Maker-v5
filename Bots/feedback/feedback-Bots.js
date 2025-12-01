  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, Attachment, ChatInputCommandInteraction, StringSelectMenuBuilder, SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db")
const feedbackDB = new Database("/Json-db/Bots/feedbackDB.json")
const tokens = new Database("/tokens/tokens")
const { PermissionsBitField } = require('discord.js')
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let feedback = tokens.get('feedback')
if(!feedback) return;

const path = require('path');
const { readdirSync } = require("fs");
let theowner;
feedback.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client11 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client11.commands = new Collection();
  require(`./handlers/events`)(client11);
  client11.events = new Collection();
  require(`../../events/requireBots/feedback-commands`)(client11);
  const rest = new REST({ version: '10' }).setToken(token);
  client11.setMaxListeners(1000)

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
        client11.once('ready', () => {
    client11.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`feedback bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client11.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`feedback`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client11.users.cache.get(owner) || await client11.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : فيدباك\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`feedback`, filtered);
          await client11.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`./handlers/events`)(client11)

  const folderPath = path.join(__dirname, 'slashcommand11');
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



const folderPath2 = path.join(__dirname, 'slashcommand11');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/feedback-commands`)(client11)
require("./handlers/events")(client11)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client11.once(event.name, (...args) => event.execute(...args));
	} else {
		client11.on(event.name, (...args) => event.execute(...args));
	}
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
  if (interaction.isChatInputCommand()) {

    if (interaction.user.bot) return;

    const command = client11.feedbackSlashCommands.get(interaction.commandName);

    if (!command) {
      return;
    }

    if (command.ownersOnly === true) {
      if (owner != interaction.user.id) {
        return interaction.reply({
          content: `❗ ***You cannot use this command***`,
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
      return;
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

    
   client11.login(token)
   .catch(async(err) => {
    const filtered = feedback.filter(bo => bo != data)
      await tokens.set(`feedback` , filtered)
      console.log(`${clientId} Not working and removed `)
   });
});
