  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, Attachment, ChatInputCommandInteraction, StringSelectMenuBuilder, SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db")
const giveawayDB = new Database("/Json-db/Bots/giveawayDB.json")
const afkDB = new Database("/Json-db/Bots/afkDB.json")
const nadekoDB = new Database("/Json-db/Bots/nadekoDB.json")
const systemDB = new Database('/Json-db/Bots/systemDB.json'); 
const tokens = new Database("/tokens/tokens")
const { PermissionsBitField } = require('discord.js')
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let giveaway = tokens.get('giveaway')
if(!giveaway) return;

const path = require('path');
const { readdirSync } = require("fs");
let theowner;
giveaway.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client14 = new Client({intents: 131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client14.commands = new Collection();
  client14.setMaxListeners(1000)

  require(`./handlers/events`)(client14);
  client14.events = new Collection();
  require(`../../events/requireBots/giveaway-commands`)(client14);
  const rest = new REST({ version: '10' }).setToken(token);
  client14.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client14.user.id),
          { body: giveawaySlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client14.once('ready', () => {
    client14.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`giveaway bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client14.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`giveaway`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client14.users.cache.get(owner) || await client14.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : جيف اوي\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`giveaway`, filtered);
          await client14.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`../giveaway/handlers/events`)(client14)
   

  client14.on("ready" , async() => {

})
  const folderPath = path.join(__dirname, 'slashcommand14');
  client14.giveawaySlashCommands = new Collection();
  const giveawaySlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("giveaway commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          giveawaySlashCommands.push(command.data.toJSON());
          client14.giveawaySlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand14');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/giveaway-commands`)(client14)
require("./handlers/events")(client14)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client14.once(event.name, (...args) => event.execute(...args));
	} else {
		client14.on(event.name, (...args) => event.execute(...args));
	}
	}

client14.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const giveawayData = await giveawayDB.get(`giveaway_${reaction.message.id}`);
  if (!giveawayData || giveawayData.ended) return;

  const giveawayEmoji = giveawayData.emoji || '🎉';

  if (reaction.emoji.name === giveawayEmoji || reaction.emoji.toString() === giveawayEmoji) {
    if (!giveawayData.participants) giveawayData.participants = [];
    if (!giveawayData.participants.includes(user.id)) {
      giveawayData.participants.push(user.id);
      await giveawayDB.set(`giveaway_${reaction.message.id}`, giveawayData);
    }
  }
});

client14.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const giveawayData = await giveawayDB.get(`giveaway_${reaction.message.id}`);
  if (!giveawayData || giveawayData.ended) return;

  const giveawayEmoji = giveawayData.emoji || '🎉';

  if (reaction.emoji.name === giveawayEmoji || reaction.emoji.toString() === giveawayEmoji) {
    if (giveawayData.participants && giveawayData.participants.includes(user.id)) {
      giveawayData.participants = giveawayData.participants.filter(id => id !== user.id);
      await giveawayDB.set(`giveaway_${reaction.message.id}`, giveawayData);
    }
  }
});

client14.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.user.bot) return;

    const command = client14.giveawaySlashCommands.get(interaction.commandName);

    if (!command) return;

    if (command.ownersOnly === true && interaction.user.id !== owner) {
      return interaction.reply({ content: `❗ ***You can't use this command***`, ephemeral: true });
    }

    if (command.adminsOnly === true) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: `❗ ***You must have Administrator permission to use this command***`, ephemeral: true });
      }
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "There was an error executing this command!",
        ephemeral: true
      });
    }
  }
});

client14.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'drop') {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('**❌ You must have Administrator permission to use this.**');
      }

      const prize = args.join(' ');
      if (!prize) {
        return message.reply('**❌ Please specify the prize. Example: `!drop Nitro`**');
      }

      const dropEmbed = new EmbedBuilder()
        .setTitle('**🎉 New Drop 🎉**')
        .setDescription(`**Prize: \`${prize}\`\nClick the button to win!**`)
        .setColor('#0099ff')
        .setTimestamp()
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL({ dynamic: true }) });

      const button = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('drop_enter')
            .setLabel('Click to Win!')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🎉')
        );

      const msg = await message.channel.send({
        embeds: [dropEmbed],
        components: [button]
      });

      const collector = msg.createMessageComponentCollector({
        filter: i => !i.user.bot,
        time: 30000,
        max: 1
      });

      collector.on('collect', async (i) => {
        const winner = i.user;
        const endEmbed = new EmbedBuilder()
          .setTitle('**🎉 Drop Ended 🎉**')
          .setDescription(`**Prize: \`${prize}\`\nWinner: ${winner}**`)
          .setColor('#0099ff')
          .setTimestamp()
          .setThumbnail(winner.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL({ dynamic: true }) });

        await msg.edit({
          embeds: [endEmbed],
          components: []
        });

        await i.reply(`**🎊 Congratulations! You won \`${prize}\`!**`);

        try {
          await winner.send(`**🎉 Congratulations! You won \`${prize}\` in ${message.guild.name}!**`);
        } catch (err) {
          console.error('Could not DM winner');
        }
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          const endEmbed = new EmbedBuilder()
            .setTitle('**🎉 Drop Ended 🎉**')
            .setDescription(`**Prize: \`${prize}\`\nNo one won!**`)
            .setColor('#ff0000')
            .setTimestamp()
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL({ dynamic: true }) });

          await msg.edit({
            embeds: [endEmbed],
            components: []
          });
        }
      });
    } catch (error) {
      console.error(error);
      message.channel.send('**❌ An error occurred while creating the drop.**');
    }
  }
});

client14.on("interactionCreate", async (interaction) => {
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
      {name : `\`${prefix}drop\`` , value : `Send a drop giveaway to win`},
      {name : `\`/gstart\`` , value : `Start a Giveaway`},
      {name : `\`/gend\`` , value : `End a Giveaway by the id`},
      {name : `\`/greroll\`` , value : `Re roll a Giveaway`},
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
    
   client14.login(token)
   .catch(async(err) => {
    const filtered = giveaway.filter(bo => bo != data)
			await tokens.set(`giveaway` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
