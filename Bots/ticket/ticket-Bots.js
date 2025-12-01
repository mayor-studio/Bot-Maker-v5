const { Client,Discord, Collection, AuditLogEvent,discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, Embed } = require("discord.js");
const { Database } = require("st.db")
const ticketDB = new Database("/Json-db/Bots/ticketDB.json")
const db = new Database('/Json-db/Bots/ticketDB');
const { PermissionsBitField } = require('discord.js')
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


  let ticket = tokens.get('ticket')
if(!ticket) return;
const path = require('path');
const { readdirSync } = require("fs");
let theowner;
ticket.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client7 =new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client7.commands = new Collection();
  require(`./handlers/events`)(client7);
  require(`./handlers/claim`)(client7);
  require(`./handlers/close`)(client7);
  require(`./handlers/create`)(client7);
  require(`./handlers/reset`)(client7);
  require(`./handlers/support-panel`)(client7);
  client7.events = new Collection();
  require(`../../events/requireBots/ticket-commands`)(client7);
  const rest = new REST({ version: '10' }).setToken(token);
  client7.setMaxListeners(1000)

  client7.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client7.user.id),
          { body: ticketSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client7.once('ready', () => {
    client7.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`ticket bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client7.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`ticket`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client7.users.cache.get(owner) || await client7.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : تكت\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`ticket`, filtered);
          await client7.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });

    require(`./handlers/events`)(client7)

  const folderPath = path.join(__dirname, 'slashcommand7');
  client7.ticketSlashCommands = new Collection();
  const ticketSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("ticket commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          ticketSlashCommands.push(command.data.toJSON());
          client7.ticketSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand7');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/ticket-commands`)(client7)
require("./handlers/events")(client7)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client7.once(event.name, (...args) => event.execute(...args));
	} else {
		client7.on(event.name, (...args) => event.execute(...args));
	}
	}




  client7.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client7.ticketSlashCommands.get(interaction.commandName);
	    
      if (!command) {
        return;
      }
      if (command.ownersOnly === true) {
        if (owner != interaction.user.id) {
          return interaction.reply({content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true});
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
			return
		}
    }
  } )

client7.on('messageCreate', async message => {
    if (message.author.bot) return;
  if(message.content == `${prefix}close`) {
        const supportRoleID = ticketDB.get(`TICKET-PANEL_${message.channel.id}`)?.Support;

   /*     if (!message.member.roles.cache.has(supportRoleID)) {
            return message.reply({ content: ':x: You do not have permission to close this ticket.', ephemeral: true });
        }*/

        const ticket = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);

        await message.channel.permissionOverwrites.edit(ticket.author, { ViewChannel: false });

        const embed2 = new EmbedBuilder()
            .setDescription(`تم اغلاق تذكرة بواسطة ${message.author}`)
            .setColor("Yellow");

        const embed = new EmbedBuilder()
            .setDescription("```لوحة فريق الدعم.```")
            .setColor("DarkButNotBlack");

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('Open').setLabel('Open').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('Tran').setLabel('Transcript').setStyle(ButtonStyle.Secondary)
            );

        await message.reply({ embeds: [embed2, embed], components: [row] });

        const logsRoomId = ticketDB.get(`LogsRoom_${message.guild.id}`);
        const logChannel = message.guild.channels.cache.get(logsRoomId);

        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setTitle('Close Ticket')
                .addFields(
                    { name: 'Name Ticket', value: `${message.channel.name}` },
                    { name: 'Owner Ticket', value: `${ticket.author}` },
                    { name: 'Closed By', value: `${message.author}` },
                )
                .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() });

            logChannel.send({ embeds: [logEmbed] });
        }
    }
});


client7.on('messageCreate', async message => {
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

client7.on('messageCreate', async message => {
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

client7.on('messageCreate', async message => {
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

client7.on(Events.ChannelCreate, async channel => {
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

   client7.login(token)
   .catch(async(err) => {
    const filtered = ticket.filter(bo => bo != data)
			await tokens.set(`ticket` , filtered)
      console.log(`${clientId} Not working and removed `)
   });
})
