const { Client, Collection,ChannelType ,SlashCommandBuilder, GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder , ButtonStyle , Message, Embed,PermissionsBitField } = require("discord.js")
const { Database } = require("st.db")
const privateRoomsDB = new Database("/Json-db/Bots/privateRoomsDB.json")
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const shortcutDB = new Database("/Json-db/Others/shortcutDB.json")

const rooms = new Database("/Json-db/Bots/privateRoomsDB.json")
const db = new Database("/Json-db/Bots/privateRoomsDB.json")
let moment = require('moment');
const ms = require("ms")
const buyCooldown = new Collection()
let privateRooms = tokens.get('privateRooms')
if(!privateRooms) return;

const path = require('path');
const { readdirSync } = require("fs");
const client = require("../../index.js")
let theowner;
privateRooms.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client22 = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client22.commands = new Collection();
  client22.setMaxListeners(1000)

  require(`./handlers/events.js`)(client22);
  client22.events = new Collection();
  require(`../../events/requireBots/privateRooms-commands.js`)(client22);
  const rest = new REST({ version: '10' }).setToken(token);
  client22.on("ready" , async() => {
      try {
          const commandFiles = readdirSync(path.join(__dirname, 'slashcommand22/admin')).filter(file => file.endsWith('.js'));
          const commands = [];
          
          for (const file of commandFiles) {
              const command = require(`./slashcommand22/admin/${file}`);
              commands.push(command.data.toJSON());
              client22.privateRoomsSlashCommands.set(command.data.name, command);
          }

          await rest.put(
              Routes.applicationCommands(client22.user.id),
              { body: commands },
          );
          
          console.log(`✅ Loaded ${commands.length} slash commands for Prison Bot`);
      } catch (error) {
          console.error('Failed to load slash commands:', error);
      }
  });

        client22.once('ready', () => {
    client22.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`privateRoom bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client22.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`privateRooms`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client22.users.cache.get(owner) || await client22.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : رومات خاصة\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`privateRooms`, filtered);
          await client22.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`../privateRooms/handlers/events.js`)(client22)
  const folderPath = path.join(__dirname, 'slashcommand22');
  client22.privateRoomsSlashCommands = new Collection();
  const privateRoomsSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("privateRooms commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          privateRoomsSlashCommands.push(command.data.toJSON());
          client22.privateRoomsSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}

let commandsDir2 = path.join(__dirname);
client22.commands = new Collection()
const commands = [];
const table2 = new ascii('Prefix Commands').setJustify();
for (let folder of readdirSync(commandsDir2+`/commands22`).filter(f => f.endsWith(`.js`))) {
	  let command = require(`${commandsDir2}/commands22/${folder}`);
	  if(command) {
		commands.push(command);
  client22.commands.set(command.name, command);
		  if(command.name) {
			  table2.addRow(`${prefix}${command.name}` , '🟢 Working')
		  }
		  if(!command.name) {
			  table2.addRow(`${prefix}${command.name}` , '🔴 Not Working')
		  }
	  }
}


require(`../../events/requireBots/privateRooms-commands.js`)(client22)
require("./handlers/events.js")(client22)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client22.once(event.name, (...args) => event.execute(...args));
	} else {
		client22.on(event.name, (...args) => event.execute(...args));
	}
	}

client22.on("messageCreate" , async(message) => {
  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;

  const prisonAlias = await shortcutDB.get(`prison_cmd_${message.guild.id}`);
  const unprisonAlias = await shortcutDB.get(`unprison_cmd_${message.guild.id}`);
  
  // Check for aliases first
  if(prisonAlias && message.content.startsWith(prisonAlias)) {
      const args = message.content.slice(prisonAlias.length).trim().split(/ +/g);
      const prisonCmd = client22.commands.get('prison');
      if(prisonCmd) prisonCmd.run(client22, message, args);
      return; // Prevent further command processing
  }
  
  if(unprisonAlias && message.content.startsWith(unprisonAlias)) {
      const args = message.content.slice(unprisonAlias.length).trim().split(/ +/g);
      const unprisonCmd = client22.commands.get('unprison');
      if(unprisonCmd) unprisonCmd.run(client22, message, args);
      return; // Prevent further command processing
  }

  // If no alias was used, continue with normal prefix command handling
  if(!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/g); 
  const cmd = args.shift().toLowerCase();
  if(cmd.length == 0 ) return;
    if(!client22.commands.has(cmd)) return;
  let command = client22.commands.get(cmd)
  if(!command) command = client22.commands.get(client22.commandaliases.get(cmd));

  if(command) {
    if(command.cooldown) {
        
      if(cooldown.has(`${command.name}${message.author.id}`)) return message.reply({ embeds:[{description:`**عليك الانتظار\`${ms(cooldown.get(`${command.name}${message.author.id}`) - Date.now(), {long : true}).replace("minutes", `دقيقة`).replace("seconds", `ثانية`).replace("second", `ثانية`).replace("ms", `ملي ثانية`)}\` لكي تتمكن من استخدام الامر مجددا.**`}]}).then(msg => setTimeout(() => msg.delete(), cooldown.get(`${command.name}${message.author.id}`) - Date.now()))
      command.run(client, message, args)
      cooldown.set(`${command.name}${message.author.id}`, Date.now() + command.cooldown)
      setTimeout(() => {
        cooldown.delete(`${command.name}${message.author.id}`)
      }, command.cooldown);
  } else {
    command.run(client, message, args)
  }
}});


client22.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId === 'prison_duration') {
        const pendingData = db.get(`prison_pending_${interaction.guild.id}`);
        if (!pendingData) return interaction.reply({ content: "❌ **Something went wrong.**", ephemeral: true });

        const target = interaction.guild.members.cache.get(pendingData.targetId);
        if (!target) return interaction.reply({ content: "❌ **Member not found.**", ephemeral: true });

        let prisonRole = interaction.guild.roles.cache.find(r => r.name === "prison");
        if (!prisonRole) {
            prisonRole = await interaction.guild.roles.create({
                name: "prison",
                color: "#000000",
                permissions: [],
                reason: "Prison System Role Creation"
            });

            // Restrict permissions for prison role in all channels
            interaction.guild.channels.cache.forEach(async (channel) => {
                await channel.permissionOverwrites.create(prisonRole, {
                    ViewChannel: false,
                    SendMessages: false,
                    AddReactions: false,
                    Connect: false,
                    Speak: false
                }).catch(() => {});
            });

            // Allow access in prison channel (if set)
            const prisonChannelId = await db.get(`prison_channel_${interaction.guild.id}`);
            if (prisonChannelId) {
                const prisonChannel = interaction.guild.channels.cache.get(prisonChannelId);
                if (prisonChannel) {
                    await prisonChannel.permissionOverwrites.edit(prisonRole, {
                        ViewChannel: true,
                        SendMessages: true,
                        AddReactions: true,
                        AttachFiles: false,
                        EmbedLinks: false
                    });
                }
            }
        }

        const originalRoles = target.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.id);
        await target.roles.remove(originalRoles).catch(console.error);
        await target.roles.add(prisonRole).catch(console.error);

        const durations = {
            '1h': '1 hour',
            '10h': '10 hours',
            '1d': '1 day',
            '5d': '5 days',
            '7d': '7 days'
        };

        const duration = interaction.values[0];
        const releaseTime = Date.now() + ms(duration);

        db.set(`prison_${interaction.guild.id}_${target.id}`, {
            roles: originalRoles,
            releaseTime: releaseTime
        });

        // DM the prisoner
        const dmEmbed = new EmbedBuilder()
            .setTitle("🔒 You Have Been Imprisoned")
            .setDescription(`**You have been imprisoned in ${interaction.guild.name}.\nDuration: ${durations[duration]}\nRelease time: <t:${Math.floor(releaseTime / 1000)}:R>**`)
            .setColor("Red")
            .setTimestamp();

        await target.send({ embeds: [dmEmbed] }).catch(() => {
            interaction.channel.send(`❌ **Couldn't send DM to ${target}**`);
        });

        await interaction.reply({ 
            content: `✅ **${target.user.tag} has been imprisoned for ${durations[duration]}.**`,
            ephemeral: true 
        });

        // Delete the select menu message
        if (interaction.message) {
            await interaction.message.delete().catch(() => {});
        }

        // Public message
        await interaction.channel.send(`🔒 **${target.user.tag} has been imprisoned for ${durations[duration]}.**`);

        // Auto-release after duration
        setTimeout(async () => {
            const prisonData = db.get(`prison_${interaction.guild.id}_${target.id}`);
            if (prisonData && prisonData.releaseTime === releaseTime) {
                const prisonRole = interaction.guild.roles.cache.find(r => r.name === "prison");
                if (prisonRole && target.roles.cache.has(prisonRole.id)) {
                    await target.roles.remove(prisonRole).catch(() => {});
                }
                if (prisonData.roles && prisonData.roles.length > 0) {
                    await target.roles.add(prisonData.roles).catch(() => {});
                }

                // DM on release
                const releaseDmEmbed = new EmbedBuilder()
                    .setTitle("🔓 You Have Been Released")
                    .setDescription(`**You have been automatically released from prison in ${interaction.guild.name}.\nYour previous roles have been restored.**`)
                    .setColor("Green")
                    .setTimestamp();

                await target.send({ embeds: [releaseDmEmbed] }).catch(() => {
                    interaction.channel.send(`❌ **Couldn't send DM to ${target}**`);
                });

                db.delete(`prison_${interaction.guild.id}_${target.id}`);
                interaction.channel.send(`✅ **${target.user.tag} has been automatically released.**`);
            }
        }, ms(duration));

        // Cleanup
        db.delete(`prison_pending_${interaction.guild.id}`);
    }
});

// Slash command handler
client22.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client22.privateRoomsSlashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ 
            content: '❌ An error occurred while executing the command.',
            ephemeral: true 
        });
    }
});

   client22.on("interactionCreate" , async(interaction) => {
    if(interaction.customId === "help_general"){
      const embed = new EmbedBuilder()
          .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
          .setTitle('قائمة اوامر البوت')
          .addFields(

          )
          .setTimestamp()
          .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
          .setColor('DarkButNotBlack');
      const btns = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐').setDisabled(true),
          new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Primary).setEmoji('👑'),
      )
  
      await interaction.update({embeds : [embed] , components : [btns]})
    }else if(interaction.customId === "help_owner"){
      const embed = new EmbedBuilder()
      .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
      .setTitle('قائمة اوامر البوت')
      .addFields(
            {name : `\`${prefix}prison\`` , value : `لسجن عضو`},
            {name : `\`${prefix}unprison\`` , value : `لاخراج عضو من السجن`},
            {name : `\`/prisoners\`` , value : `عرض قائمة المسجونين`},
      )
      .setTimestamp()
      .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
      .setColor('DarkButNotBlack');
  const btns = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
      new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Primary).setEmoji('👑').setDisabled(true),
  )
  
  await interaction.update({embeds : [embed] , components : [btns]})
    }
  })

   client22.login(token)
   .catch(async(err) => {
    const filtered = privateRooms.filter(bo => bo != data)
			await tokens.set(`privateRooms` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
