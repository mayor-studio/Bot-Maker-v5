
const { Client, Collection, discord,GatewayIntentBits, ChannelType, AuditLogEvent , Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const moment = require('moment');
const ms = require('ms')
const { Database } = require("st.db")
const taxDB = new Database("/Json-db/Bots/taxDB.json")
const { PermissionsBitField } = require('discord.js')
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const autolineDB = new Database("/Json-db/Bots/autolineDB.json")
const suggestionsDB = new Database("/Json-db/Bots/suggestionsDB.json")
const feedbackDB = new Database("/Json-db/Bots/feedbackDB.json")
const giveawayDB = new Database("/Json-db/Bots/giveawayDB.json")
const systemDB = new Database("/Json-db/Bots/systemDB.json")
const shortcutDB = new Database("/Json-db/Others/shortcutDB.json")
const protectDB = new Database("/Json-db/Bots/protectDB.json")
const db = new Database("/Json-db/Bots/BroadcastDB")
const logsDB = new Database("/Json-db/Bots/logsDB.json")
const nadekoDB = new Database("/Json-db/Bots/nadekoDB.json")
const one4allDB = new Database("/Json-db/Bots/one4allDB.json")
const ticketDB = new Database("/Json-db/Bots/ticketDB.json")


let one4all = tokens.get('one4all')
if(!one4all) return;

const path = require('path');
const { readdirSync } = require("fs");
let theowner;
one4all.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client27 = new Client({intents: 131071 , shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client27.commands = new Collection();
  require(`./handlers/events`)(client27);
  client27.events = new Collection();
  require(`../../events/requireBots/One4all-Commands`)(client27);
  const rest = new REST({ version: '10' }).setToken(token);
  client27.setMaxListeners(1000)

  client27.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client27.user.id),
          { body: one4allSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client27.once('ready', () => {
    client27.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`one4all bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client27.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`one4all`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client27.users.cache.get(owner) || await client27.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : واحد للكل\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`one4all`, filtered);
          await client27.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`../one4all/handlers/events`)(client27)
    require("./handlers/suggest")(client27)
    require('./handlers/tax4bot')(client27)
    require("./handlers/autorole")(client27)
    require(`./handlers/events`)(client27);
    require(`./handlers/claim`)(client27);
    require(`./handlers/close`)(client27);
    require(`./handlers/create`)(client27);
    require(`./handlers/reset`)(client27);
    require(`./handlers/support-panel`)(client27);
    require(`./handlers/events`)(client27)
    require(`./handlers/applyCreate`)(client27)
    require(`./handlers/applyResult`)(client27)
    require(`./handlers/applySubmit`)(client27)
    require(`./handlers/events`)(client27)
    require(`./handlers/info`)(client27)

  const folderPath = path.join(__dirname, 'slashcommand27');
  client27.one4allSlashCommands = new Collection();
  const one4allSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("one4all commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          one4allSlashCommands.push(command.data.toJSON());
          client27.one4allSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand27');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/One4all-Commands`)(client27)
require("./handlers/events")(client27)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client27.once(event.name, (...args) => event.execute(...args));
	} else {
		client27.on(event.name, (...args) => event.execute(...args));
	}
	}
    

  client27.on("messageCreate" , async(message) => {
    if(message.content == "test"){
      message.reply(`works fine`)
    }
  })

client27.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {

        if (interaction.user.bot) return;

        const command = client27.one4allSlashCommands.get(interaction.commandName);

        if (!command) return;

        if (command.ownersOnly === true) {
            if (interaction.user.id !== owner) {
                return interaction.reply({
                    content: `❗ ***You are not allowed to use this command***`,
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
            console.log("🔴 | Error in one4all bot", error);
        }
    }
});
  //-------------------------- جميع الاكواد هنا ----------------------//


 client27.on('messageReactionAdd', async (reaction, user) => {
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

client27.on('messageReactionRemove', async (reaction, user) => {
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

client27.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.user.bot) return;

    const command = client27.giveawaySlashCommands.get(interaction.commandName);

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

client27.on("messageCreate", async (message) => {
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
/////////// TAX CODE
    
    
client27.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  let roomid = taxDB.get(`tax_room_${message.guild.id}`);
  let taxLine = taxDB.get(`tax_line_${message.guild.id}`);

  if (!roomid || message.channel.id !== roomid) return;

  let input = message.content;
  if (input.endsWith("k") || input.endsWith("K")) input = input.replace(/k/gi, "") * 1000;
  else if (input.endsWith("m") || input.endsWith("M")) input = input.replace(/m/gi, "") * 1000000;

  if (isNaN(input) || input == 0) return message.delete();

  let amount = parseInt(input);                  // Original amount
  let tax = Math.floor(amount * 20 / 19 + 1);    // Taxed amount
  let full = Math.floor(tax * 20 / 19 + 1);      // Full amount with 2x tax
  let mediatorFee = Math.floor(amount * 0.02);   // Mediator fee (2%)
  let total = Math.floor(full + mediatorFee);    // Full with mediator

  let result = `🪙 Amount: **${amount}**
📊 Tax: **${tax - amount}**
💰 Total with Tax: **${tax}**`;

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`copy_${tax}`)
      .setLabel(`Copy`)
      .setStyle(ButtonStyle.Primary)
  );

  await message.reply({ content: result, components: [buttons] });

  if (taxLine) {
    await message.channel.send({ files: [taxLine] });
  }
});

    client27.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith('copy_')) {
    const amount = interaction.customId.split('_')[1];
    await interaction.reply({ content: `${amount}`, ephemeral: true });
  }
});
    
client27.on("messageCreate", async (message) => {
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
  
client27.on("messageCreate", async (message) => {
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

client27.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const line = suggestionsDB.get(`line_${message.guild.id}`);
  const chan = suggestionsDB.get(`suggestions_room_${message.guild.id}`);
  const suggestionMode = suggestionsDB.get(`suggestion_mode_${message.guild.id}`) || 'buttons'; // Default to buttons
  const threadMode = suggestionsDB.get(`thread_mode_${message.guild.id}`) || 'enabled'; // Default to enabled

  if (chan) {
    if (message.channel.id !== chan) return;

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTimestamp()
      .setTitle(`** > ${message.content} **`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    if (suggestionMode === 'buttons') {
      const button1 = new ButtonBuilder()
        .setCustomId(`ok_button`)
        .setLabel(`0`)
        .setEmoji("✔️")
        .setStyle(ButtonStyle.Success);

      const button2 = new ButtonBuilder()
        .setCustomId(`no_button`)
        .setLabel(`0`)
        .setEmoji("✖️")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(button1, button2);

      let send = await message.channel.send({ embeds: [embed], components: [row] }).catch(() => { return; });

      if (threadMode === 'enabled') {
        await send.startThread({
          name: `Comments`
        }).then(async (thread) => {
          thread.send(`**This thread is for discussing the suggestion:** \`${message.content}\``);
        });
      }

      if (line) {
        await message.channel.send({ files: [line] }).catch(() => { return; });
      }

      await suggestionsDB.set(`${send.id}_ok`, 0);
      await suggestionsDB.set(`${send.id}_no`, 0);

      return message.delete();
    } else if (suggestionMode === 'reactions') {
      let send = await message.channel.send({ embeds: [embed] }).catch(() => { return; });

      await send.react('✔️');
      await send.react('❌');

      if (threadMode === 'enabled') {
        await send.startThread({
          name: `Comments`
        }).then(async (thread) => {
          thread.send(`**This thread is for discussing the suggestion:** \`${message.content}\``);
        });
      }

      if (line) {
        await message.channel.send({ files: [line] }).catch(() => { return; });
      }

      return message.delete();
    }
  }
});

client27.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const line = feedbackDB.get(`line_${message.guild.id}`);
  const chan = feedbackDB.get(`feedback_room_${message.guild.id}`);
  const feedbackMode = feedbackDB.get(`feedback_mode_${message.guild.id}`) || 'embed';
  const feedbackEmoji = feedbackDB.get(`feedback_emoji_${message.guild.id}`) || "❤";

  if (chan) {
    if (message.channel.id !== chan) return;

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTimestamp()
      .setTitle(`** > ${message.content} **`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    if (feedbackMode === 'embed') {
      await message.delete();
      const themsg = await message.channel.send({
        content: `**<@${message.author.id}> Thank you for sharing your feedback! 🌷**`,
        embeds: [embed]
      });
      await themsg.react("❤");
      await themsg.react("❤️‍🔥");

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

client27.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content === `${prefix}close`) {
    const ticketData = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);
    if (!ticketData) return;

    const supportRoleID = ticketData?.Support;

    // Uncomment if you want to restrict this command to support members only:
    /*
    if (!message.member.roles.cache.has(supportRoleID)) {
      return message.reply({
        content: ':x: You do not have permission to close this ticket.',
        ephemeral: true
      });
    }
    */

    // Hide the channel from the ticket owner
    await message.channel.permissionOverwrites.edit(ticketData.author, {
      ViewChannel: false
    });

    const embedConfirmation = new EmbedBuilder()
      .setDescription(`This ticket was closed by ${message.author}`)
      .setColor("Yellow");

    const embedPanel = new EmbedBuilder()
      .setDescription("```Support team panel.```")
      .setColor("DarkButNotBlack");

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('delete')
          .setLabel('Delete')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('Open')
          .setLabel('Reopen')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('Tran')
          .setLabel('Transcript')
          .setStyle(ButtonStyle.Secondary)
      );

    await message.reply({ embeds: [embedConfirmation, embedPanel], components: [row] });

    // Logging
    const logsRoomId = ticketDB.get(`LogsRoom_${message.guild.id}`);
    const logChannel = message.guild.channels.cache.get(logsRoomId);

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setTitle('Ticket Closed')
        .addFields(
          { name: 'Ticket Name', value: `${message.channel.name}` },
          { name: 'Ticket Owner', value: `<@${ticketData.author}>` },
          { name: 'Closed By', value: `${message.author}` }
        )
        .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() });

      logChannel.send({ embeds: [logEmbed] });
    }
  }
});

client27.on('messageCreate', async message => {
    const supportRoleId = ticketDB.get(`TICKET-PANEL_${message.channel.id}`)?.Support;
    if (message.author.bot) return;
  if(message.content == `${prefix}delete`) {
        if (!message.member.roles.cache.has(supportRoleId)) {
            message.reply({ content: ':x: Only Support', ephemeral: true });
            return;
        }

        if (!ticketDB.has(`TICKET-PANEL_${message.channel.id}`)) {
            message.reply({ content: 'This channel isn\'t a ticket', ephemeral: true });
            return;
        }
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('Ticket will be deleted in a few seconds');
        await message.reply({ embeds: [embed] });

        setTimeout(() => {
            message.channel.delete();
        }, 4500);

        const Logs = ticketDB.get(`LogsRoom_${message.guild.id}`);
        const Log = message.guild.channels.cache.get(Logs);
        const Ticket = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTitle('Delete Ticket')
            .addFields(
                { name: 'Name Ticket', value: `${message.channel.name}` },
                { name: 'Owner Ticket', value: `${Ticket.author}` },
                { name: 'Deleted By', value: `${message.author}` },
            )
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() });

        Log?.send({ embeds: [logEmbed] });
        ticketDB.delete(`TICKET-PANEL_${message.channel.id}`);
    }
});

client27.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(`${prefix}rename`)) return;

    // Check if channel is a ticket
    const ticketData = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);
    if (!ticketData) {
        return message.reply('This command can only be used in ticket channels!');
    }

    // Get new name from arguments
    const newName = message.content.split(' ').slice(1).join('-').toLowerCase();
    if (!newName) {
        return message.reply('Please provide a new name for the ticket!');
    }

    try {
        // Rename the channel
        await message.channel.setName(`ticket-${newName}`);
        
        // Send confirmation
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`✅ Ticket renamed to: ticket-${newName}`);
        message.reply({ embeds: [embed] });

        // Log the change
        const logsRoomId = ticketDB.get(`LogsRoom_${message.guild.id}`);
        const logChannel = message.guild.channels.cache.get(logsRoomId);
        
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setTitle('Ticket Renamed')
                .addFields(
                    { name: 'Old Name', value: message.channel.name },
                    { name: 'New Name', value: `ticket-${newName}` },
                    { name: 'Changed By', value: `${message.author}` }
                )
                .setTimestamp();
            
            logChannel.send({ embeds: [logEmbed] });
        }
    } catch (error) {
        message.reply('Failed to rename the ticket. Please try again.');
        console.error('Ticket rename error:', error);
    }
});

client27.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.content.startsWith(`${prefix}add`)) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('Please mention a user to add to the ticket');

        const supportRoleID = ticketDB.get(`TICKET-PANEL_${message.channel.id}`)?.Support;

        if (!message.member.roles.cache.has(supportRoleID)) {
            return message.reply(':x: You do not have permission to add users to this ticket.');
        }

        if (!ticketDB.has(`TICKET-PANEL_${message.channel.id}`)) {
            return message.reply('> This channel isn\'t a ticket');
        }

        await message.channel.permissionOverwrites.edit(member.user.id, {
            ViewChannel: true,
            SendMessages: true
        });

        return message.reply(`${member} has been added to the ticket ${message.channel}.`);
    }
});

client27.on(Events.ChannelCreate, async channel => {
    try {
        const ticketSettings = await db.get(`TicketMessage_${channel.guild.id}`);
        if (!ticketSettings) return;
        
        if (channel.parentId === ticketSettings.category && channel.name.startsWith('ticket-')) {
            setTimeout(async () => {
                // Get ticket author from database
                const ticketData = await db.get(`TICKET-PANEL_${channel.id}`);
                if (!ticketData) return;

                // Send mention first
                await channel.send(`<@${ticketData.author}>`);

                // Then send the configured message
                if (ticketSettings.type === 'embed') {
                    const embed = new EmbedBuilder()
                        .setColor('Random')
                        .setDescription(ticketSettings.message)
                        .setTimestamp();
                    
                    await channel.send({ embeds: [embed] });
                } else {
                    await channel.send({ content: ticketSettings.message });
                }
            }, 10000);
        }
    } catch (error) {
        console.error('Error in ticket message event:', error);
    }
});

client27.on('messageCreate', async message => {
    const cmd = await shortcutDB.get(`say_cmd_${message.guild.id}`) || null;  

    if (message.author.bot) return;

    if (message.content.startsWith(`${prefix}say`) || message.content.startsWith(`${cmd}`)) {
        // Permission check
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

        const content = message.content.slice(`${prefix}say`.length).trim();
        if (!content) {
            message.channel.send("Please write something after the command.");
            return;
        }

        let image = null;
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            image = attachment.url;
        }

        await message.delete();

        await message.channel.send({ 
            content: content, 
            files: image ? [image] : [] 
        });
    }
});


client27.on('messageCreate', async message => {
  const cmd = shortcutDB.get(`clear_cmd_${message.guild.id}`) || null;
    if (message.author.bot) return;
    if (message.content.startsWith(`${prefix}clear`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const args = message.content.split(' ').slice(1);
        const amount = args[0] ? parseInt(args[0]) : 99;
        if (isNaN(amount) || amount <= 0 || amount > 100) return;
        try {
            const fetchedMessages = await message.channel.messages.fetch({ limit: amount });
            const messagesToDelete = fetchedMessages.filter(msg => {
                const fourteenDays = 14 * 24 * 60 * 60 * 1000;
                return (Date.now() - msg.createdTimestamp) < fourteenDays;
            });
            await message.channel.bulkDelete(messagesToDelete);
        } catch (error) {
        }
    }
});


client27.on('messageCreate', async message => {
    const cmd = await shortcutDB.get(`tax_cmd_${message.guild.id}`) || null; 

    if (message.content.startsWith(`${prefix}tax`) || message.content.startsWith(`${cmd}`)) {
        const args = message.content.startsWith(`${prefix}tax`) 
            ? message.content.slice(`${prefix}tax`.length).trim() 
            : message.content.slice(`${cmd}`.length).trim();

        let number = args;
        if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
        else if (number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
        else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
        else if (number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;

        let number2 = parseFloat(number);

        if (isNaN(number2)) {
            return message.reply('Please enter a valid number after the command.');
        }

        let tax = Math.floor(number2 * (20) / (19) + 1); // tax amount
        let tax2 = Math.floor(tax - number2); // amount with tax

        await message.reply(`${tax}`);
    }
});


client27.on('messageCreate', async message => {
    const cmd = await shortcutDB.get(`come_cmd_${message.guild.id}`) || null;  

    if (message.content.startsWith(`${prefix}come`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('You must have the Manage Messages (MANAGE_MESSAGES) permission.');
        }

        const mentionOrID = message.content.split(/\s+/)[1];
        const targetMember = message.mentions.members.first() || message.guild.members.cache.get(mentionOrID);

        if (!targetMember) {
            return message.reply('Please mention someone or provide their user ID.');
        }

        const directMessageContent = `**You have been summoned by: ${message.author}\nin: ${message.channel}**`;

        try {
            await targetMember.send(directMessageContent);
            await message.reply('**Message successfully sent to the user.**');
        } catch (error) {
            await message.reply('**Could not send the message to the user.**');
        }
    }
});

client27.on("messageCreate", async (message) => {
  const cmd = await shortcutDB.get(`lock_cmd_${message.guild.id}`) || null;
  if (message.content === `${prefix}lock` || message.content === `${cmd}`) {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply({ content: `**You don't have permission to do that.**` });
      }
      await message.channel.permissionOverwrites.edit(
        message.channel.guild.roles.everyone,
        { SendMessages: false }
      );
      
      return message.reply({ content: `**${message.channel} has been locked.**` });
    } catch (error) {
      message.reply({ content: `An error occurred, please contact the developers.` });
      console.log(error);
    }
  }
});


client27.on("messageCreate", async (message) => {
  const cmd = await shortcutDB.get(`unlock_cmd_${message.guild.id}`) || null;
  if (message.content === `${prefix}unlock` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**You don't have permission to do that.**` });
    }
    await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone,
      { SendMessages: true }
    );
    return message.reply({ content: `**${message.channel} has been unlocked.**` });
  }
});

client27.on("messageCreate", async (message) => {
  const cmd = await shortcutDB.get(`hide_cmd_${message.guild.id}`) || null;
  if (message.content === `${prefix}hide` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**You don't have permission to do that.**` });
    }
    await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone,
      { ViewChannel: false }
    );
    return message.reply({ content: `**${message.channel} has been hidden.**` });
  }
});

client27.on("messageCreate", async (message) => {
  const cmd = await shortcutDB.get(`unhide_cmd_${message.guild.id}`) || null;
  if (message.content === `${prefix}unhide` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**You don't have permission to do that.**` });
    }
    await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone,
      { ViewChannel: true }
    );
    return message.reply({ content: `**${message.channel} has been unhidden.**` });
  }
});


client27.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const cmd = await shortcutDB.get(`server_cmd_${message.guild.id}`) || null;
    if (message.content !== `${prefix}server` && message.content !== `${cmd}`) return;

    const guild = message.guild;

    // URLs for icon and banner
    const iconURL = guild.iconURL({ dynamic: true, size: 512 });
    const bannerURL = guild.bannerURL({ size: 1024, extension: 'png' });

    // Verification Levels map for user-friendly text
    const verificationLevels = {
      NONE: 'None',
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: 'High',
      VERY_HIGH: 'Very High',
    };

    // Member counts by type
    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter(member => member.user.bot).size;
    const humanCount = totalMembers - botCount;

    // Channel counts by type
    const channelCounts = {
      text: guild.channels.cache.filter(ch => ch.type === ChannelType.GuildText).size,
      voice: guild.channels.cache.filter(ch => ch.type === ChannelType.GuildVoice).size,
      categories: guild.channels.cache.filter(ch => ch.type === ChannelType.GuildCategory).size,
      news: guild.channels.cache.filter(ch => ch.type === ChannelType.GuildNews).size,
      stage: guild.channels.cache.filter(ch => ch.type === ChannelType.GuildStageVoice).size,
    };

    // Boost info
    const boosts = guild.premiumSubscriptionCount || 0;
    const boostTier = guild.premiumTier ? `Tier ${guild.premiumTier}` : 'None';

    // Roles list, mention format with truncation if too many roles
    let roles = guild.roles.cache
      .filter(role => role.id !== guild.id) // exclude @everyone role
      .sort((a, b) => b.position - a.position)
      .map(role => `<@&${role.id}>`)
      .join(' ');

    if (roles.length > 1024) { // Discord field limit
      roles = roles.slice(0, 1020) + '...';
    }

    const embed = new EmbedBuilder()
      .setTitle(`Server Information: ${guild.name}`)
      .setColor('Blue')
      .setThumbnail(iconURL || undefined)
      .setImage(bannerURL || undefined)
      .addFields(
        { name: '🆔 Server ID', value: guild.id, inline: true },
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '🔗 Vanity URL', value: guild.vanityURLCode ? `discord.gg/${guild.vanityURLCode}` : 'None', inline: true },

        { name: '👥 Members', value: `Total: ${totalMembers}\nHumans: ${humanCount}\nBots: ${botCount}`, inline: true },
        {
          name: '📅 Created',
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>\n<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
          inline: true
        },
        { name: '🛡️ Verification Level', value: verificationLevels[guild.verificationLevel] || 'Unknown', inline: true },

        {
          name: '💎 Boosts & Tier',
          value: `${boosts} Boost${boosts === 1 ? '' : 's'}\n${boostTier}`,
          inline: true
        },
        {
          name: '📚 Channels',
          value: `Text: ${channelCounts.text}\nVoice: ${channelCounts.voice}\nCategories: ${channelCounts.categories}\nNews: ${channelCounts.news}\nStage: ${channelCounts.stage}`,
          inline: true
        },
        { name: `🎭 Roles [${guild.roles.cache.size - 1}]`, value: roles || 'No roles', inline: false },
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    await message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('Error fetching server info:', error);
    await message.reply('❌ An error occurred while fetching the server information.');
  }
});
    
client27.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const cmd = await shortcutDB.get(`avatar_cmd_${message.guild.id}`) || null;
    if (message.content !== `${prefix}avatar` && message.content !== `${cmd}`) return;

    const user = message.mentions.users.first() || message.author;

    // Avatar URL (max size is 4096)
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(avatarURL)
      .setColor("Blue")
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Download 4K")
        .setStyle(ButtonStyle.Link)
        .setURL(avatarURL),
      new ButtonBuilder()
        .setLabel("Download HD")
        .setStyle(ButtonStyle.Link)
        .setURL(user.displayAvatarURL({ dynamic: true, size: 1024 }))
    );

    await message.reply({ embeds: [embed], components: [row] });

  } catch (error) {
    console.error("Error fetching avatar:", error);
    await message.reply("❌ An error occurred while fetching the avatar.");
  }
});

client27.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const cmd = await shortcutDB.get(`banner_cmd_${message.guild.id}`) || null;
    if (message.content !== `${prefix}banner` && message.content !== `${cmd}`) return;

    const target = message.mentions.users.first() || message.author;

    // Fetch full user object to get banner
    const user = await client27.users.fetch(target.id, { force: true });

    if (!user.banner) {
      return message.reply(`❌ ${target.username} does not have a banner.`);
    }

    const bannerFormat = user.banner.startsWith("a_") ? "gif" : "png";
    const bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${bannerFormat}?size=4096`;

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Banner`)
      .setImage(bannerURL)
      .setColor("Blue")
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Download 4K")
        .setStyle(ButtonStyle.Link)
        .setURL(bannerURL),
      new ButtonBuilder()
        .setLabel("Download HD")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${bannerFormat}?size=1024`)
    );

    await message.reply({ embeds: [embed], components: [row] });

  } catch (error) {
    console.error("Error fetching banner:", error);
    await message.reply("❌ An error occurred while fetching the banner.");
  }
});
    
    client27.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const cmd = await shortcutDB.get(`user_cmd_${message.guild.id}`) || null;
    if (message.content !== `${prefix}user` && message.content !== `${cmd}`) return;

    const target = message.mentions.members.first() || message.member;

    const user = await client27.users.fetch(target.id, { force: true });
    const banner = user.banner;
    const bannerFormat = banner?.startsWith("a_") ? "gif" : "png";
    const bannerURL = banner
      ? `https://cdn.discordapp.com/banners/${user.id}/${banner}.${bannerFormat}?size=4096`
      : null;

    // Avatar
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });

    // Roles (excluding @everyone)
    let roles = target.roles.cache
      .filter(r => r.id !== message.guild.id)
      .map(r => `<@&${r.id}>`)
      .join(', ');
    if (!roles) roles = '*No roles*';

    // Flags / badges
    const flags = user.flags?.toArray().map(flag => flag.replace(/([A-Z])/g, ' $1')) || [];
    const badges = flags.length ? flags.join(', ') : 'None';

    // Boosting
    const isBoosting = target.premiumSince ? 'Yes' : 'No';

    // Buttons (avatar & banner if available)
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Avatar")
        .setStyle(ButtonStyle.Link)
        .setURL(avatarURL)
    );
    if (bannerURL) {
      buttons.addComponents(
        new ButtonBuilder()
          .setLabel("Banner")
          .setStyle(ButtonStyle.Link)
          .setURL(bannerURL)
      );
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: user.tag, iconURL: avatarURL })
      .setThumbnail(avatarURL)
      .setColor("Blue")
      .addFields(
        { name: "🆔 User ID", value: user.id, inline: true },
        { name: "👤 Username", value: user.username, inline: true },
        { name: "📅 Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
        { name: "📌 Joined Server", value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:F>`, inline: true },
        { name: "🚀 Boosting Server", value: isBoosting, inline: true },
        { name: "🎖️ Badges", value: `\`${badges}\``, inline: false },
        { name: `🎭 Roles [${target.roles.cache.size - 1}]`, value: roles, inline: false }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    if (bannerURL) {
      embed.setImage(bannerURL);
    }

    await message.reply({ embeds: [embed], components: [buttons] });

  } catch (err) {
    console.error("User command error:", err);
    message.reply("❌ An error occurred while fetching the user info.");
  }
});
    
client27.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const cmd = await shortcutDB.get(`ban_cmd_${message.guild.id}`) || null;
    if (!message.content.startsWith(`${prefix}ban`) && message.content !== cmd) return;

    if (!message.member.permissions.has("Administrator")) return message.reply("❌ You need `Administrator` permission.");

    const target = message.mentions.members.first();
    const reason = message.content.split(" ").slice(2).join(" ") || "No reason provided";

    if (!target) return message.reply("❌ Mention a user to ban.");

    await target.ban({ reason });

    message.reply(`✅ **${target.user.tag}** has been banned.`);
  } catch (err) {
    console.error("Ban error:", err);
    message.reply("❌ Failed to ban the user.");
  }
});

    client27.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const cmd = await shortcutDB.get(`kick_cmd_${message.guild.id}`) || null;
    if (!message.content.startsWith(`${prefix}kick`) && message.content !== cmd) return;

    if (!message.member.permissions.has("Administrator")) return message.reply("❌ You need `Administrator` permission.");

    const target = message.mentions.members.first();
    const reason = message.content.split(" ").slice(2).join(" ") || "No reason provided";

    if (!target) return message.reply("❌ Mention a user to kick.");

    await target.kick(reason);

    message.reply(`✅ **${target.user.tag}** has been kicked.`);
  } catch (err) {
    console.error("Kick error:", err);
    message.reply("❌ Failed to kick the user.");
  }
});

    client27.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const cmd = await shortcutDB.get(`mute_cmd_${message.guild.id}`) || null;
    if (!message.content.startsWith(`${prefix}mute`) && message.content !== cmd) return;

    if (!message.member.permissions.has("Administrator")) return message.reply("❌ You need `Administrator` permission.");

    const target = message.mentions.members.first();
    const args = message.content.split(" ");
    const duration = args[2];
    const reason = args.slice(3).join(" ") || "No reason provided";

    if (!target) return message.reply("❌ Mention a user to mute.");
    if (!duration || !ms(duration)) return message.reply("❌ Provide a valid duration like `10m`, `1h`, etc.");

    await target.timeout(ms(duration), reason);

    message.reply(`🔇 **${target.user.tag}** has been muted `);
  } catch (err) {
    console.error("Mute error:", err);
    message.reply("❌ Failed to mute the user.");
  }
});
    
    
    client27.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const cmd = await shortcutDB.get(`unmute_cmd_${message.guild.id}`) || null;
    if (!message.content.startsWith(`${prefix}unmute`) && message.content !== cmd) return;

    if (!message.member.permissions.has("Administrator")) return message.reply("❌ You need `Administrator` permission.");

    const target = message.mentions.members.first();
    if (!target) return message.reply("❌ Mention a user to unmute.");

    await target.timeout(null);

    message.reply(`🔊 **${target.user.tag}** has been unmuted.`);
  } catch (err) {
    console.error("Unmute error:", err);
    message.reply("❌ Failed to unmute the user.");
  }
});
    
    client27.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const cmd = await shortcutDB.get(`unban_cmd_${message.guild.id}`) || null;
    if (!message.content.startsWith(`${prefix}unban`) && message.content !== cmd) return;

    if (!message.member.permissions.has("Administrator")) return message.reply("❌ You need `Administrator` permission.");

    const args = message.content.split(" ");
    const userId = args[1];
    const reason = args.slice(2).join(" ") || "No reason provided";

    if (!userId) return message.reply("❌ Provide a valid user ID to unban.");

    await message.guild.members.unban(userId, reason);

    message.reply(`♻️ Unbanned user with ID **${userId}**.`);
  } catch (err) {
    console.error("Unban error:", err);
    message.reply("❌ Failed to unban the user. Make sure the ID is valid and the user is banned.");
  }
});

    client27.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const cmd = await shortcutDB.get(`timeout_cmd_${message.guild.id}`) || null;
    if (!message.content.startsWith(`${prefix}timeout`) && message.content !== cmd) return;

    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ You need `Administrator` permission to use this command.");
    }

    const target = message.mentions.members.first();
    const args = message.content.split(" ");
    const duration = args[2];
    const reason = args.slice(3).join(" ") || "No reason provided";

    if (!target) return message.reply("❌ Mention a user to timeout.");
    if (!duration || !ms(duration)) return message.reply("❌ Provide a valid duration like `10m`, `1h`, etc.");

    await target.timeout(ms(duration), reason);
    message.reply(`🔇 **${target.user.tag}** has been timed out`);
  } catch (err) {
    console.error("Timeout error:", err);
    message.reply("❌ Failed to timeout the user.");
  }
});
    
    client27.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const cmd = await shortcutDB.get(`untimeout_cmd_${message.guild.id}`) || null;
    if (!message.content.startsWith(`${prefix}untimeout`) && message.content !== cmd) return;

    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ You need `Administrator` permission to use this command.");
    }

    const target = message.mentions.members.first();
    if (!target) return message.reply("❌ Mention a user to remove timeout.");

    await target.timeout(null);
    message.reply(`🔊 **${target.user.tag}** has been unmuted (timeout removed).`);
  } catch (err) {
    console.error("Untimeout error:", err);
    message.reply("❌ Failed to remove timeout from the user.");
  }
});
    
    
// نهاية الحماية من البوتات

//-

// بداية الحماية من حذف الرومات
client27.on('ready' , async() => {
  const guild = client27.guilds.cache.first()
  if(!guild) return;
  const guildid = guild.id
  let status = protectDB.get(`antideleterooms_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  setInterval(() => {
  const users = protectDB.get(`roomsdelete_users_${guildid}`)
    if(!users) return;
    if(users.length > 0) {
      users.forEach(async(user) => {
        const { userid , limit , newReset } = user;
        const currentTime = moment().format('YYYY-MM-DD');
        if(moment(currentTime).isSame(newReset) || moment(currentTime).isAfter(newReset)) {
          const newResetDate = moment().add(1 , 'day').format('YYYY-MM-DD')
          executordb = {userid:userid,limit:0,newReset:newResetDate}
          const index = users.findIndex(user => user.userid === userid);
      users[index] = executordb;
      await protectDB.set(`roomsdelete_users_${guildid}` , users)
        }
        let limitrooms = protectDB.get(`antideleterooms_limit_${guildid}`)
      if(limit > limitrooms) {
        let member = guild.members.cache.find(m => m.id == userid)
       try {
         member.kick()
       } catch  {
        return;
       }
      }
      })
      
    } 
  }, 6 * 1000);
})

client27.on('channelDelete', async (channel) => {
  let guildId = channel.guild.id;
  let status = protectDB.get(`antideleterooms_status_${guildId}`);
  if (!status) return;
  if (status === "off") return;

  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelDelete
  });

  const channelDeleteLog = fetchedLogs.entries.first();
  const { executor } = channelDeleteLog;

  const users = protectDB.get(`roomsdelete_users_${guildId}`);
  const endTime = moment().add(1, 'day').format('YYYY-MM-DD');

  if (!users || users.length <= 0) {
    await protectDB.push(`roomsdelete_users_${guildId}`, { userid: executor.id, limit: 1, newReset: endTime });
    return;
  }

  let executorDB = users.find(user => user.userid === executor.id);
  if (!executorDB) {
    await protectDB.push(`roomsdelete_users_${guildId}`, { userid: executor.id, limit: 1, newReset: endTime });
    return;
  }

  let oldExecutorLimit = executorDB.limit;
  let newExecutorLimit = oldExecutorLimit + 1;
  executorDB = { userid: executor.id, limit: newExecutorLimit, newReset: endTime };
  const index = users.findIndex(user => user.userid === executor.id);
  users[index] = executorDB;

  let deleteLimit = protectDB.get(`antideleterooms_limit_${guildId}`);
  if (newExecutorLimit > deleteLimit) {
    let guild = client27.guilds.cache.find(g => g.id === guildId);
    let member = guild.members.cache.find(m => m.id === executor.id);

    try {
      const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`);
      if (logRoom) {
        const theLogRoom = member.guild.channels.cache.find(ch => ch.id === logRoom);
        theLogRoom.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('Protection System')
              .addFields(
                { name: `User:`, value: `${member.user.username} \`${member.id}\`` },
                { name: `Reason:`, value: `Deleted channels` },
                { name: `Punishment:`, value: `User kicked` }
              )
          ]
        });
      }
      member.kick();
    } catch {
      return;
    }

    let filtered = users.filter(u => u.userid !== executor.id);
    await protectDB.set(`roomsdelete_users_${guildId}`, filtered);
  } else {
    await protectDB.set(`roomsdelete_users_${guildId}`, users);
  }
});

// نهاية الحماية من حذف الرومات

//-

// بداية الحماية من حذف الرتب
client27.on('ready' , async() => {
  const guild = client27.guilds.cache.first()
  if(!guild) return;
  const guildid = guild.id
  let status = protectDB.get(`antideleteroles_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  setInterval(() => {
  const users = protectDB.get(`rolesdelete_users_${guildid}`)
    if(!users) return;
    if(users.length > 0) {
      users.forEach(async(user) => {
        const { userid , limit , newReset } = user;
        const currentTime = moment().format('YYYY-MM-DD');
        if(moment(currentTime).isSame(newReset) || moment(currentTime).isAfter(newReset)) {
          const newResetDate = moment().add(1 , 'day').format('YYYY-MM-DD')
          executordb = {userid:userid,limit:0,newReset:newResetDate}
          const index = users.findIndex(user => user.userid === userid);
      users[index] = executordb;
      await protectDB.set(`rolesdelete_users_${guildid}` , users)
        }
        let limitrooms = protectDB.get(`antideleteroles_limit_${guildid}`)
      if(limit > limitrooms) {
        let member = guild.members.cache.find(m => m.id == userid)
       try {
         member.kick()
       } catch  {
        return;
       }
      }
      })
      
    } 
  }, 6 * 1000);
})

client27.on('roleDelete', async (role) => {
  let guildId = role.guild.id;
  let status = protectDB.get(`antideleteroles_status_${guildId}`);
  if (!status) return;
  if (status === "off") return;

  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.RoleDelete
  });

  const roleDeleteLog = fetchedLogs.entries.first();
  const { executor } = roleDeleteLog;

  const users = protectDB.get(`rolesdelete_users_${guildId}`);
  const endTime = moment().add(1, 'day').format('YYYY-MM-DD');

  if (!users || users.length <= 0) {
    await protectDB.push(`rolesdelete_users_${guildId}`, { userid: executor.id, limit: 1, newReset: endTime });
    return;
  }

  let executorDB = users.find(user => user.userid === executor.id);
  if (!executorDB) {
    await protectDB.push(`rolesdelete_users_${guildId}`, { userid: executor.id, limit: 1, newReset: endTime });
    return;
  }

  let oldExecutorLimit = executorDB.limit;
  let newExecutorLimit = oldExecutorLimit + 1;
  executorDB = { userid: executor.id, limit: newExecutorLimit, newReset: endTime };
  const index = users.findIndex(user => user.userid === executor.id);
  users[index] = executorDB;

  let deleteLimit = protectDB.get(`antideleteroles_limit_${guildId}`);
  if (newExecutorLimit > deleteLimit) {
    let guild = client27.guilds.cache.find(g => g.id === guildId);
    let member = guild.members.cache.find(m => m.id === executor.id);

    try {
      const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`);
      if (logRoom) {
        const theLogRoom = member.guild.channels.cache.find(ch => ch.id === logRoom);
        theLogRoom.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('Protection System')
              .addFields(
                { name: `User:`, value: `${member.user.username} \`${member.id}\`` },
                { name: `Reason:`, value: `Deleted roles` },
                { name: `Punishment:`, value: `User kicked` }
              )
          ]
        });
      }
      member.kick();
    } catch {
      return;
    }

    let filtered = users.filter(u => u.userid !== executor.id);
    await protectDB.set(`rolesdelete_users_${guildId}`, filtered);
  } else {
    await protectDB.set(`rolesdelete_users_${guildId}`, users);
  }
});

// نهاية الحماية من حذف الرتب

//-

// بداية الحماية من البان
client27.on('ready' , async() => {
  const guild = client27.guilds.cache.first()
  if(!guild) return;
  const guildid = guild.id
  let status = protectDB.get(`ban_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  setInterval(() => {
  const users = protectDB.get(`ban_users_${guildid}`)
    if(!users) return;
    if(users.length > 0) {
      users.forEach(async(user) => {
        const { userid , limit , newReset } = user;
        const currentTime = moment().format('YYYY-MM-DD');
        if(moment(currentTime).isSame(newReset) || moment(currentTime).isAfter(newReset)) {
          const newResetDate = moment().add(1 , 'day').format('YYYY-MM-DD')
          executordb = {userid:userid,limit:0,newReset:newResetDate}
          const index = users.findIndex(user => user.userid === userid);
      users[index] = executordb;
      await protectDB.set(`ban_users_${guildid}` , users)
        }
        let limitrooms = protectDB.get(`ban_limit_${guildid}`)
      if(limit > limitrooms) {
        let member = guild.members.cache.find(m => m.id == userid)
       try {
         member.kick()
       } catch  {
        return;
       }
      }
      })
      
    } 
  }, 6 * 1000);
})

client27.on('guildBanAdd', async (member) => {
  let guildId = member.guild.id;
  let status = protectDB.get(`ban_status_${guildId}`);
  if (!status) return;
  if (status === "off") return;

  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberBanAdd
  });

  const banLog = fetchedLogs.entries.first();
  const { executor } = banLog;

  const users = protectDB.get(`ban_users_${guildId}`);
  const endTime = moment().add(1, 'day').format('YYYY-MM-DD');

  if (!users || users.length <= 0) {
    await protectDB.push(`ban_users_${guildId}`, { userid: executor.id, limit: 1, newReset: endTime });
    return;
  }

  let executorDB = users.find(user => user.userid === executor.id);
  if (!executorDB) {
    await protectDB.push(`ban_users_${guildId}`, { userid: executor.id, limit: 1, newReset: endTime });
    return;
  }

  let oldExecutorLimit = executorDB.limit;
  let newExecutorLimit = oldExecutorLimit + 1;
  executorDB = { userid: executor.id, limit: newExecutorLimit, newReset: endTime };
  const index = users.findIndex(user => user.userid === executor.id);
  users[index] = executorDB;

  let banLimit = protectDB.get(`ban_limit_${guildId}`);
  if (newExecutorLimit > banLimit) {
    let guild = client27.guilds.cache.find(g => g.id === guildId);
    let modMember = guild.members.cache.find(m => m.id === executor.id);

    try {
      const logRoomId = await protectDB.get(`protectLog_room_${guild.id}`);
      if (logRoomId) {
        const logChannel = guild.channels.cache.find(ch => ch.id === logRoomId);
        if (logChannel) {
          logChannel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle('Protection System')
                .addFields(
                  { name: `User:`, value: `${modMember.user.username} \`${modMember.id}\`` },
                  { name: `Reason:`, value: `Banned members` },
                  { name: `Punishment:`, value: `User kicked` }
                )
            ]
          });
        }
      }
      modMember.kick();
    } catch {
      return;
    }

    let filtered = users.filter(u => u.userid !== executor.id);
    await protectDB.set(`ban_users_${guildId}`, filtered);
  } else {
    await protectDB.set(`ban_users_${guildId}`, users);
  }
});

client27.on('guildMemberRemove', async (member) => {
  let guildId = member.guild.id;
  let status = protectDB.get(`ban_status_${guildId}`);
  if (!status) return;
  if (status === "off") return;
  if (member.id === client27.user.id) return;

  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberKick
  });

  const kickLog = fetchedLogs.entries.first();
  const { executor } = kickLog;

  const users = protectDB.get(`ban_users_${guildId}`);
  const endTime = moment().add(1, 'day').format('YYYY-MM-DD');

  if (!users || users.length <= 0) {
    await protectDB.push(`ban_users_${guildId}`, { userid: executor.id, limit: 1, newReset: endTime });
    return;
  }

  let executorDB = users.find(user => user.userid === executor.id);
  if (!executorDB) {
    await protectDB.push(`ban_users_${guildId}`, { userid: executor.id, limit: 1, newReset: endTime });
    return;
  }

  let oldExecutorLimit = executorDB.limit;
  let newExecutorLimit = oldExecutorLimit + 1;
  executorDB = { userid: executor.id, limit: newExecutorLimit, newReset: endTime };
  const index = users.findIndex(user => user.userid === executor.id);
  users[index] = executorDB;

  let kickLimit = protectDB.get(`ban_limit_${guildId}`);
  if (newExecutorLimit > kickLimit) {
    let guild = client27.guilds.cache.find(g => g.id === guildId);
    let modMember = guild.members.cache.find(m => m.id === executor.id);

    try {
      const logRoomId = await protectDB.get(`protectLog_room_${guild.id}`);
      if (logRoomId) {
        const logChannel = guild.channels.cache.find(ch => ch.id === logRoomId);
        if (logChannel) {
          logChannel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle('Protection System')
                .addFields(
                  { name: `User:`, value: `${modMember.user.username} \`${modMember.id}\`` },
                  { name: `Reason:`, value: `Kicked members` },
                  { name: `Punishment:`, value: `User kicked` }
                )
            ]
          });
        }
      }
      modMember.kick();
    } catch {
      return;
    }

    let filtered = users.filter(u => u.userid !== executor.id);
    await protectDB.set(`ban_users_${guildId}`, filtered);
  } else {
    await protectDB.set(`ban_users_${guildId}`, users);
  }
});


// نهاية الحماية من البان

client27.on('messageDelete', async (message) => {
  if (!message) return;
  if (!message.author) return;
  if (message.author.bot) return;

  if (!logsDB.has(`log_messagedelete_${message.guild.id}`)) return;
  let logChannelId = logsDB.get(`log_messagedelete_${message.guild.id}`);
  let logChannel = message.guild.channels.cache.get(logChannelId);

  const fetchedLogs = await message.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MessageDelete
  });

  const deletionLog = fetchedLogs.entries.first();
  const { executor } = deletionLog;

  let deleteEmbed = new EmbedBuilder()
    .setTitle(`**Message Deleted**`)
    .addFields(
      {
        name: `**Message Author:**`,
        value: `**\`\`\`${message.author.tag} - (${message.author.id})\`\`\`**`,
        inline: false
      },
      {
        name: `**Deleted By:**`,
        value: `**\`\`\`${executor.username} - (${executor.id})\`\`\`**`,
        inline: false
      },
      {
        name: `**Message Content:**`,
        value: message.content
          ? `**\`\`\`${message.content}\`\`\`**`
          : `**\`\`\`[No content: possibly an embed or attachment]\`\`\`**`,
        inline: false
      },
      {
        name: `**Channel:**`,
        value: `${message.channel}`,
        inline: false
      }
    )
    .setTimestamp();

  await logChannel.send({ embeds: [deleteEmbed] });
});

    
client27.on('messageUpdate', async (oldMessage, newMessage) => {
  if (!oldMessage.author) return;
  if (oldMessage.author.bot) return;
  if (!logsDB.has(`log_messageupdate_${oldMessage.guild.id}`)) return;

  const fetchedLogs = await oldMessage.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MessageUpdate
  });

  let logChannelId = logsDB.get(`log_messageupdate_${oldMessage.guild.id}`);
  let logChannel = oldMessage.guild.channels.cache.get(logChannelId);

  const updateLog = fetchedLogs.entries.first();
  const { executor } = updateLog;

  const updateEmbed = new EmbedBuilder()
    .setTitle(`**Message Edited**`)
    .addFields(
      {
        name: "**Message Author:**",
        value: `**\`\`\`${oldMessage.author.tag} (${oldMessage.author.id})\`\`\`**`,
        inline: false
      },
      {
        name: "**Old Content:**",
        value: oldMessage.content
          ? `**\`\`\`${oldMessage.content}\`\`\`**`
          : "**```[No content]```**",
        inline: false
      },
      {
        name: "**New Content:**",
        value: newMessage.content
          ? `**\`\`\`${newMessage.content}\`\`\`**`
          : "**```[No content]```**",
        inline: false
      },
      {
        name: "**Channel:**",
        value: `${oldMessage.channel}`,
        inline: false
      }
    )
    .setTimestamp();

  await logChannel.send({ embeds: [updateEmbed] });
});

    
    
client27.on('roleCreate', async (role) => {
  if (!logsDB.has(`log_rolecreate_${role.guild.id}`)) return;

  let logChannelId = logsDB.get(`log_rolecreate_${role.guild.id}`);
  let logChannel = role.guild.channels.cache.get(logChannelId);

  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.RoleCreate
  });

  const roleCreateLog = fetchedLogs.entries.first();
  const { executor } = roleCreateLog;

  let roleCreateEmbed = new EmbedBuilder()
    .setTitle('**Role Created**')
    .addFields(
      { name: 'Role Name:', value: `\`\`\`${role.name}\`\`\``, inline: true },
      { name: 'Created By:', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: true }
    )
    .setTimestamp();

  await logChannel.send({ embeds: [roleCreateEmbed] });
});

    
client27.on('roleDelete', async (role) => {
  if (!logsDB.has(`log_roledelete_${role.guild.id}`)) return;

  let logChannelId = logsDB.get(`log_roledelete_${role.guild.id}`);
  let logChannel = role.guild.channels.cache.get(logChannelId);

  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.RoleDelete
  });

  const roleDeleteLog = fetchedLogs.entries.first();
  const { executor } = roleDeleteLog;

  let roleDeleteEmbed = new EmbedBuilder()
    .setTitle('**Role Deleted**')
    .addFields(
      { name: 'Role Name:', value: `\`\`\`${role.name}\`\`\``, inline: true },
      { name: 'Deleted By:', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: true }
    )
    .setTimestamp();

  await logChannel.send({ embeds: [roleDeleteEmbed] });
});




client27.on('channelCreate', async (channel) => {
  if (logsDB.has(`log_channelcreate_${channel.guild.id}`)) {
    let logChannelId = logsDB.get(`log_channelcreate_${channel.guild.id}`);
    let logChannel = channel.guild.channels.cache.get(logChannelId);

    const fetchedLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelCreate
    });

    const channelCreateLog = fetchedLogs.entries.first();
    const { executor } = channelCreateLog;

    let channelCategory = channel.parent ? channel.parent.name : 'None';

    let channelCreateEmbed = new EmbedBuilder()
      .setTitle('**Channel Created**')
      .addFields(
        { name: 'Channel Name:', value: `\`\`\`${channel.name}\`\`\``, inline: true },
        { name: 'Channel Category:', value: `\`\`\`${channelCategory}\`\`\``, inline: true },
        { name: 'Created By:', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: true }
      )
      .setTimestamp();

    await logChannel.send({ embeds: [channelCreateEmbed] });
  }
});




client27.on('channelDelete', async (channel) => {
  if (logsDB.has(`log_channeldelete_${channel.guild.id}`)) {
    let logChannelId = logsDB.get(`log_channeldelete_${channel.guild.id}`);
    let logChannel = channel.guild.channels.cache.get(logChannelId);

    const fetchedLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelDelete
    });

    const channelDeleteLog = fetchedLogs.entries.first();
    const { executor } = channelDeleteLog;

    let channelDeleteEmbed = new EmbedBuilder()
      .setTitle('**Channel Deleted**')
      .addFields(
        { name: 'Channel Name:', value: `\`\`\`${channel.name}\`\`\``, inline: true },
        { name: 'Deleted By:', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: true }
      )
      .setTimestamp();

    await logChannel.send({ embeds: [channelDeleteEmbed] });
  }
});


client27.on('guildMemberUpdate', async (oldMember, newMember) => {
  const guild = oldMember.guild;

  // Roles added to the member
  const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
  // Roles removed from the member
  const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

  // Handle role additions
  if (addedRoles.size > 0 && logsDB.has(`log_rolegive_${guild.id}`)) {
    const logChannelId = logsDB.get(`log_rolegive_${guild.id}`);
    const logChannel = guild.channels.cache.get(logChannelId);

    const fetchedLogs = await guild.fetchAuditLogs({
      limit: addedRoles.size,
      type: AuditLogEvent.MemberRoleUpdate,
    });

    addedRoles.forEach(role => {
      // Find the audit log entry for this role added
      const auditEntry = fetchedLogs.entries.find(log =>
        log.target.id === newMember.id &&
        log.changes.some(change =>
          change.key === "$add" && change.new.some(r => r.id === role.id)
        )
      );
      const executor = auditEntry ? auditEntry.executor : null;
      const executorName = executor ? `${executor.username} (${executor.id})` : 'UNKNOWN';

      const embed = new EmbedBuilder()
        .setTitle('**Role Added to Member**')
        .addFields(
          { name: 'Role Name:', value: `\`\`\`${role.name}\`\`\``, inline: true },
          { name: 'Added By:', value: `\`\`\`${executorName}\`\`\``, inline: true },
          { name: 'Member:', value: `\`\`\`${newMember.user.tag} (${newMember.user.id})\`\`\``, inline: true }
        )
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });
  }

  // Handle role removals
  if (removedRoles.size > 0 && logsDB.has(`log_roleremove_${guild.id}`)) {
    const logChannelId = logsDB.get(`log_roleremove_${guild.id}`);
    const logChannel = guild.channels.cache.get(logChannelId);

    const fetchedLogs = await guild.fetchAuditLogs({
      limit: removedRoles.size,
      type: AuditLogEvent.MemberRoleUpdate,
    });

    removedRoles.forEach(role => {
      // Find the audit log entry for this role removed
      const auditEntry = fetchedLogs.entries.find(log =>
        log.target.id === newMember.id &&
        log.changes.some(change =>
          change.key === "$remove" && change.old.some(r => r.id === role.id)
        )
      );
      const executor = auditEntry ? auditEntry.executor : null;
      const executorName = executor ? `${executor.username} (${executor.id})` : 'UNKNOWN';

      const embed = new EmbedBuilder()
        .setTitle('**Role Removed from Member**')
        .addFields(
          { name: 'Role Name:', value: `\`\`\`${role.name}\`\`\``, inline: true },
          { name: 'Removed By:', value: `\`\`\`${executorName}\`\`\``, inline: true },
          { name: 'Member:', value: `\`\`\`${newMember.user.tag} (${newMember.user.id})\`\`\``, inline: true }
        )
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });
  }
});

client27.on('guildMemberAdd', async (member) => {
  const guild = member.guild;
  if (!member.user.bot) return;  // Only proceed if the new member is a bot

  const fetchedLogs = await guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.BotAdd
  });

  const botAddLog = fetchedLogs.entries.first();
  if (!botAddLog) return; // Safeguard if no log found
  const { executor, target } = botAddLog;

  if (target && target.bot) {
    let logChannelId = logsDB.get(`log_botadd_${guild.id}`);
    let logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel) return; // Safeguard if no log channel set

    let botAddEmbed = new EmbedBuilder()
      .setTitle('**New Bot Added to Server**')
      .addFields(
        { name: 'Bot Name:', value: `\`\`\`${member.user.username}\`\`\``, inline: true },
        { name: 'Bot ID:', value: `\`\`\`${member.user.id}\`\`\``, inline: true },
        { 
          name: 'Has Administrator Permission?:', 
          value: member.permissions.has('Administrator') ? '```Yes```' : '```No```', 
          inline: true 
        },
        { name: 'Added By:', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: false }
      )
      .setTimestamp();

    logChannel.send({ embeds: [botAddEmbed] });
  }
});





client27.on('guildBanAdd', async (guild, user) => {
  if (logsDB.has(`log_banadd_${guild.id}`)) {
    let banAddLog1 = logsDB.get(`log_banadd_${guild.id}`);
    let banAddLog2 = guild.channels.cache.get(banAddLog1);
    if (!banAddLog2) return; // Check if the channel exists

    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd
    });

    const banAddLog = fetchedLogs.entries.first();
    const banner = banAddLog ? banAddLog.executor : null;
    const bannerUsername = banner ? `\`\`\`${banner.username} (${banner.id})\`\`\`` : '```UNKNOWN```';

    let banAddEmbed = new EmbedBuilder()
      .setTitle('**Member Banned**')
      .addFields(
        { name: 'Banned Member:', value: `\`\`\`${user.tag} (${user.id})\`\`\`` },
        { name: 'Banned By:', value: bannerUsername }
      )
      .setTimestamp();

    banAddLog2.send({ embeds: [banAddEmbed] });
  }
});





client27.on('guildBanRemove', async (guild, user) => {
  if (logsDB.has(`log_bandelete_${guild.id}`)) {
    let banRemoveLog1 = logsDB.get(`log_bandelete_${guild.id}`);
    let banRemoveLog2 = guild.channels.cache.get(banRemoveLog1);
    if (!banRemoveLog2) return; // Check if the log channel exists

    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanRemove
    });

    const banRemoveLog = fetchedLogs.entries.first();
    const unbanner = banRemoveLog ? banRemoveLog.executor : null;
    const unbannerUsername = unbanner ? `\`\`\`${unbanner.username} (${unbanner.id})\`\`\`` : '```UNKNOWN```';

    let banRemoveEmbed = new EmbedBuilder()
      .setTitle('**Member Unbanned**')
      .addFields(
        { name: 'Unbanned Member:', value: `\`\`\`${user.tag} (${user.id})\`\`\`` },
        { name: 'Unbanned By:', value: unbannerUsername }
      )
      .setTimestamp();

    banRemoveLog2.send({ embeds: [banRemoveEmbed] });
  }
});


client27.on('guildMemberRemove', async (member) => {
  const guild = member.guild;
  if (logsDB.has(`log_kickadd_${guild.id}`)) {
    const kickLogChannelId = logsDB.get(`log_kickadd_${guild.id}`);
    const kickLogChannel = guild.channels.cache.get(kickLogChannelId);
    if (!kickLogChannel) return; // check channel exists

    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberKick,
    });

    const kickLog = fetchedLogs.entries.first();
    const kicker = kickLog ? kickLog.executor : null;
    const kickerUsername = kicker ? `\`\`\`${kicker.username} (${kicker.id})\`\`\`` : 'Unknown';

    const kickEmbed = new EmbedBuilder()
      .setTitle('**Member Kicked**')
      .addFields(
        { name: 'Kicked Member:', value: `\`\`\`${member.user.tag} (${member.user.id})\`\`\`` },
        { name: 'Kicked By:', value: kickerUsername },
      )
      .setTimestamp();

    kickLogChannel.send({ embeds: [kickEmbed] });
  }
});


let invites = {}; 
const getInviteCounts = async (guild) => {
    return new Map(guild.invites.cache.map(invite => [invite.code, invite.uses]));
};

client27.on('inviteCreate', async invite => {
    if (!invites[invite.guild.id]) {
        invites[invite.guild.id] = new Map();
    }
    invites[invite.guild.id].set(invite.code, invite.uses);
});

client27.on('inviteDelete', async invite => {
    if (invites[invite.guild.id]) {
        invites[invite.guild.id].delete(invite.code);
    }
});

client27.on('guildMemberAdd', async member => {
    try {
        const welcomeChannelId = await systemDB.get(`welcome_channel_${member.guild.id}`);
        const welcomeRoleId = await systemDB.get(`welcome_role_${member.guild.id}`);
        const welcomeImage = await systemDB.get(`welcome_image_${member.guild.id}`);

        if (welcomeRoleId) {
            const role = member.guild.roles.cache.get(welcomeRoleId);
            if (role) {
                await member.roles.add(role);
            }
        }

        const newInvites = await member.guild.invites.fetch();
        const oldInvites = invites[member.guild.id] || new Map();

        const usedInvite = newInvites.find(inv => {
            const prevUses = oldInvites.get(inv.code) || 0;
            return inv.uses > prevUses;
        });

        let inviterMention = 'Unknown';
        if (usedInvite && usedInvite.inviter) {
            inviterMention = `<@${usedInvite.inviter.id}>`;
        }

        const fullUser = await client27.users.fetch(member.user.id, { force: true });

        const welcomeEmbed = new EmbedBuilder()
            .setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) })
            .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) })
            .setColor('#787575')
            .setTitle('Welcome to the Server!')
            .setDescription(`Hello ${member}, welcome to **${member.guild.name}**! Enjoy your stay.`)
            .addFields(
                { name: 'Username', value: member.user.tag, inline: true },
                { name: 'Invited By', value: inviterMention, inline: true },
                { name: 'Invite Used', value: usedInvite ? `||${usedInvite.code}||` : 'Direct Join', inline: true },
                { name: 'You\'re Member', value: `${member.guild.memberCount}`, inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();
        
        if (welcomeImage) {
            welcomeEmbed.setImage(welcomeImage);
        }

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (welcomeChannel) {
            await welcomeChannel.send({ embeds: [welcomeEmbed] });
        }

        invites[member.guild.id] = new Map(newInvites.map(invite => [invite.code, invite.uses]));
    } catch (error) {
        console.error('Error handling guildMemberAdd event:', error);
    }
});


client27.on("guildMemberAdd" , async(member) => {
  const theeGuild = member.guild
  let rooms = nadekoDB.get(`rooms_${theeGuild.id}`)
  const message = nadekoDB.get(`message_${theeGuild.id}`)
  if(!rooms) return;
  if(rooms.length <= 0) return;
  if(!message) return;
  await rooms.forEach(async(room) => {
    const theRoom = await theeGuild.channels.cache.find(ch => ch.id == room)
    if(!theRoom) return;
    await theRoom.send({content:`${member} - ${message}`}).then(async(msg) => {
      setTimeout(() => {
        msg.delete();
      }, 3000);
    })
  })
})

  client27.on("messageCreate" ,  async(message) => {
    if(message.author.bot) return;
    const autoReplys = one4allDB.get(`replys_${message.guild.id}`);
    if(!autoReplys) return;
    const data = autoReplys.find((r) => r.word == message.content);
    if(!data) return;
    message.reply(`${data.reply}`)
  })



  //-------------------------- جميع الاكواد هنا ----------------------//

   client27.login(token)
   .catch(async(err) => {
    const filtered = one4all.filter(bo => bo != data)
			await tokens.set(`one4all` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
