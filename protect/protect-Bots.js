const { Client, Collection,AuditLogEvent, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")

const protectDB = new Database("/Json-db/Bots/protectDB.json")
const moment = require('moment')
  let protect = tokens.get('protect')
  if(!protect) return;

const path = require('path');
const { readdirSync } = require("fs");
let theowner;
protect.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client19 = new Client({intents: 131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client19.commands = new Collection();
  require(`./handlers/events`)(client19);
  client19.events = new Collection();
  require(`../../events/requireBots/protect-commands`)(client19);
  const rest = new REST({ version: '10' }).setToken(token);
  client19.setMaxListeners(1000)

  client19.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client19.user.id),
          { body: protectSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client19.once('ready', () => {
    client19.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`protect bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client19.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`protect`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client19.users.cache.get(owner) || await client19.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : حماية\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`protect`, filtered);
          await client19.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`../protect/handlers/events`)(client19)

  const folderPath = path.join(__dirname, 'slashcommand19');
  client19.protectSlashCommands = new Collection();
  const protectSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("protect commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          protectSlashCommands.push(command.data.toJSON());
          client19.protectSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}

// بداية الحماية من البوتات
client19.on("guildMemberAdd", async (member) => {
  try {
    // Check if antibots protection is enabled for this guild
    if (protectDB.has(`antibots_status_${member.guild.id}`)) {
      const antibotsStatus = protectDB.get(`antibots_status_${member.guild.id}`);

      if (antibotsStatus === "on" && member.user.bot) {
        // Get the protection logs channel ID
        const logRoomId = protectDB.get(`protectLog_room_${member.guild.id}`);

        // Kick the bot member
        await member.kick();

        // If a logs channel is set, send an embed log message
        if (logRoomId) {
          const logChannel = member.guild.channels.cache.get(logRoomId);
          if (logChannel) {
            const embed = new EmbedBuilder()
              .setTitle('Protection System')
              .addFields(
                { name: 'Member', value: `${member.user.tag} \`${member.id}\`` },
                { name: 'Reason', value: 'Anti-bots protection system' },
                { name: 'Action', value: 'Kicked the bot' }
              )
              .setColor('Red');

            await logChannel.send({ embeds: [embed] });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in anti-bot protection:', error);
  }
});

// نهاية الحماية من البوتات

//-

// بداية الحماية من حذف الرومات
client19.on('ready' , async() => {
  const guild = client19.guilds.cache.first()
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

client19.on('channelDelete', async (channel) => {
  try {
    const guildId = channel.guild.id;
    const status = protectDB.get(`antideleterooms_status_${guildId}`);
    if (!status || status === 'off') return;

    // Fetch audit logs for the channel delete action
    const fetchedLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelDelete,
    });

    const channelDeleteLog = fetchedLogs.entries.first();
    if (!channelDeleteLog) return; // no audit log found

    const { executor } = channelDeleteLog;
    if (!executor || executor.id === client19.user.id) return; // ignore bot actions or missing executor

    // Get tracked users who have deleted rooms
    let users = protectDB.get(`roomsdelete_users_${guildId}`) || [];

    // Calculate reset date (end of day or 24h window)
    const resetDate = moment().add(1, 'day').format('YYYY-MM-DD');

    // Find executor record or create new
    let userRecord = users.find(u => u.userid === executor.id);

    if (!userRecord) {
      // New user record, add with limit 1 and reset date
      users.push({ userid: executor.id, limit: 1, newReset: resetDate });
    } else {
      // Check if reset date passed, if so, reset limit
      if (moment().isAfter(moment(userRecord.newReset))) {
        userRecord.limit = 1;
        userRecord.newReset = resetDate;
      } else {
        userRecord.limit += 1;
      }
    }

    // Update user record in users array
    const idx = users.findIndex(u => u.userid === executor.id);
    if (idx !== -1) users[idx] = userRecord;

    const deleteLimit = protectDB.get(`antideleterooms_limit_${guildId}`) || Infinity;

    if (userRecord.limit > deleteLimit) {
      // Exceeded limit: kick user and log

      const guild = client19.guilds.cache.get(guildId);
      if (!guild) return;

      const member = guild.members.cache.get(executor.id);
      if (!member) return;

      // Kick the member
      await member.kick('Exceeded channel delete limit in protection system');

      // Send log if log room exists
      const logRoomId = protectDB.get(`protectLog_room_${guildId}`);
      if (logRoomId) {
        const logChannel = guild.channels.cache.get(logRoomId);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('Protection System')
            .setColor('Red')
            .addFields(
              { name: 'Member', value: `${member.user.tag} \`${member.id}\`` },
              { name: 'Reason', value: 'Deleting channels beyond allowed limit' },
              { name: 'Action', value: 'Member kicked' }
            );
          await logChannel.send({ embeds: [embed] });
        }
      }

      // Remove user from the tracking list after action
      users = users.filter(u => u.userid !== executor.id);
    }

    // Save updated users list back to DB
    await protectDB.set(`roomsdelete_users_${guildId}`, users);
  } catch (error) {
    console.error('Error in channelDelete protection:', error);
  }
});
// نهاية الحماية من حذف الرومات

//-

// بداية الحماية من حذف الرتب
client19.on('ready' , async() => {
  const guild = client19.guilds.cache.first()
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

client19.on('roleDelete', async (role) => {
  try {
    const guildId = role.guild.id;
    const status = protectDB.get(`antideleteroles_status_${guildId}`);
    if (!status || status === 'off') return;

    // Fetch audit log for role delete (correct type: RoleDelete)
    const fetchedLogs = await role.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleDelete,
    });

    const roleDeleteLog = fetchedLogs.entries.first();
    if (!roleDeleteLog) return;

    const { executor } = roleDeleteLog;
    if (!executor || executor.id === client19.user.id) return; // ignore bot actions

    let users = protectDB.get(`rolesdelete_users_${guildId}`) || [];
    const resetDate = moment().add(1, 'day').format('YYYY-MM-DD');

    let userRecord = users.find(u => u.userid === executor.id);

    if (!userRecord) {
      users.push({ userid: executor.id, limit: 1, newReset: resetDate });
    } else {
      if (moment().isAfter(moment(userRecord.newReset))) {
        userRecord.limit = 1;
        userRecord.newReset = resetDate;
      } else {
        userRecord.limit += 1;
      }
    }

    const idx = users.findIndex(u => u.userid === executor.id);
    if (idx !== -1) users[idx] = userRecord;

    const deleteLimit = protectDB.get(`antideleteroles_limit_${guildId}`) || Infinity;

    if (userRecord.limit > deleteLimit) {
      const guild = client19.guilds.cache.get(guildId);
      if (!guild) return;

      const member = guild.members.cache.get(executor.id);
      if (!member) return;

      // Kick user
      await member.kick('Exceeded role delete limit in protection system');

      // Log to protectLog channel if set
      const logRoomId = protectDB.get(`protectLog_room_${guildId}`);
      if (logRoomId) {
        const logChannel = guild.channels.cache.get(logRoomId);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('Protection System')
            .setColor('Red')
            .addFields(
              { name: 'Member', value: `${member.user.tag} \`${member.id}\`` },
              { name: 'Reason', value: 'Deleting roles beyond allowed limit' },
              { name: 'Action', value: 'Member kicked' }
            );
          await logChannel.send({ embeds: [embed] });
        }
      }

      // Remove user from tracking
      users = users.filter(u => u.userid !== executor.id);
    }

    await protectDB.set(`rolesdelete_users_${guildId}`, users);
  } catch (error) {
    console.error('Error in roleDelete protection:', error);
  }
});
// نهاية الحماية من حذف الرتب

//-

// بداية الحماية من البان
client19.on('ready' , async() => {
  const guild = client19.guilds.cache.first()
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

client19.on('guildBanAdd', async (ban) => {
  try {
    const guildId = ban.guild.id;
    const status = protectDB.get(`ban_status_${guildId}`);
    if (!status || status === 'off') return;

    const fetchedLogs = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd,
    });

    const banLog = fetchedLogs.entries.first();
    if (!banLog) return;

    const { executor } = banLog;
    if (!executor || executor.id === client19.user.id) return; // Ignore bot's own actions

    let users = protectDB.get(`ban_users_${guildId}`) || [];
    const resetDate = moment().add(1, 'day').format('YYYY-MM-DD');

    let userRecord = users.find(u => u.userid === executor.id);

    if (!userRecord) {
      users.push({ userid: executor.id, limit: 1, newReset: resetDate });
    } else {
      if (moment().isAfter(moment(userRecord.newReset))) {
        userRecord.limit = 1;
        userRecord.newReset = resetDate;
      } else {
        userRecord.limit += 1;
      }
    }

    const idx = users.findIndex(u => u.userid === executor.id);
    if (idx !== -1) users[idx] = userRecord;

    const banLimit = protectDB.get(`ban_limit_${guildId}`) || Infinity;

    if (userRecord.limit > banLimit) {
      const guild = client19.guilds.cache.get(guildId);
      if (!guild) return;

      const member = guild.members.cache.get(executor.id);
      if (!member) return;

      // Kick the member for exceeding ban limit
      await member.kick('Exceeded ban limit in protection system');

      // Send log to log channel if set
      const logRoomId = protectDB.get(`protectLog_room_${guildId}`);
      if (logRoomId) {
        const logChannel = guild.channels.cache.get(logRoomId);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('Protection System')
            .setColor('Red')
            .addFields(
              { name: 'User', value: `${member.user.tag} \`${member.id}\`` },
              { name: 'Reason', value: 'Excessive bans' },
              { name: 'Punishment', value: 'Member kicked' }
            );
          await logChannel.send({ embeds: [embed] });
        }
      }

      // Remove user from tracking after punishment
      users = users.filter(u => u.userid !== executor.id);
    }

    await protectDB.set(`ban_users_${guildId}`, users);
  } catch (error) {
    console.error('Error in guildBanAdd protection:', error);
  }
});

client19.on('guildMemberRemove', async (member) => {
  try {
    const guildId = member.guild.id;
    const status = protectDB.get(`ban_status_${guildId}`);
    if (!status || status === 'off') return;
    if (member.id === client19.user.id) return;

    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberKick,
    });

    const kickLog = fetchedLogs.entries.first();
    if (!kickLog) return;

    const { executor } = kickLog;
    if (!executor || executor.id === client19.user.id) return; // Ignore bot's own actions

    let users = protectDB.get(`ban_users_${guildId}`) || [];
    const resetDate = moment().add(1, 'day').format('YYYY-MM-DD');

    let userRecord = users.find(u => u.userid === executor.id);

    if (!userRecord) {
      users.push({ userid: executor.id, limit: 1, newReset: resetDate });
    } else {
      if (moment().isAfter(moment(userRecord.newReset))) {
        userRecord.limit = 1;
        userRecord.newReset = resetDate;
      } else {
        userRecord.limit += 1;
      }
    }

    const idx = users.findIndex(u => u.userid === executor.id);
    if (idx !== -1) users[idx] = userRecord;

    const kickLimit = protectDB.get(`ban_limit_${guildId}`) || Infinity;

    if (userRecord.limit > kickLimit) {
      const guild = client19.guilds.cache.get(guildId);
      if (!guild) return;

      const executorMember = guild.members.cache.get(executor.id);
      if (!executorMember) return;

      // Kick the executor for exceeding the kick limit
      await executorMember.kick('Exceeded kick limit in protection system');

      // Send log to log channel if set
      const logRoomId = protectDB.get(`protectLog_room_${guildId}`);
      if (logRoomId) {
        const logChannel = guild.channels.cache.get(logRoomId);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('Protection System')
            .setColor('Red')
            .addFields(
              { name: 'User', value: `${executorMember.user.tag} \`${executorMember.id}\`` },
              { name: 'Reason', value: 'Excessive member kicks' },
              { name: 'Punishment', value: 'Member kicked' }
            );
          await logChannel.send({ embeds: [embed] });
        }
      }

      // Remove executor from tracking after punishment
      users = users.filter(u => u.userid !== executor.id);
    }

    await protectDB.set(`ban_users_${guildId}`, users);
  } catch (error) {
    console.error('Error in guildMemberRemove protection:', error);
  }
});
// نهاية الحماية من البان

// بداية الحماية من الروابط
client19.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  // Skip if user has ADMINISTRATOR permission
  if (message.member.permissions.has("Administrator")) return;

  // Link patterns to detect Discord invites and URLs
  const linkPatterns = [
    /discord\.gg\/\w+/gi,
    /discord\.com\/invite\/\w+/gi,
    /https?:\/\/[^\s]+/gi
  ];

  // Check if the message contains any link pattern
  const hasLink = linkPatterns.some(pattern => pattern.test(message.content));

  if (hasLink) {
    try {
      // Delete the offending message
      await message.delete();

      // Send a warning embed to the channel
      const warningMessage = await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(`⛔ ${message.author}, links are not allowed in this server!`)
        ]
      });

      // Delete the warning after 3 seconds
      setTimeout(() => warningMessage.delete().catch(() => {}), 3000);

      // Log to the protection log channel if set
      const logChannelId = await protectDB.get(`protectLog_room_${message.guild.id}`);
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle("Protection System")
            .addFields(
              { name: "User:", value: `${message.author.tag} \`${message.author.id}\`` },
              { name: "Reason:", value: "Posting links" },
              { name: "Content:", value: message.content }
            )
            .setColor("Red");
          await logChannel.send({ embeds: [embed] });
        }
      }
    } catch (err) {
      console.error("Anti-link error:", err);
    }
  }
});

// نهاية الحماية من الروابط

client19.on("interactionCreate" , async(interaction) => {
  if(interaction.customId === "help_general"){
    const embed = new EmbedBuilder()
        .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
        .setTitle('قائمة اوامر البوت')
        .addFields(
        {name : `\`/help\`` , value : `لعرض قائمة الاوامر`},
        {name : `\`/support\`` , value : `للانضمام للسيرفر الداعم`},
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
      {name : `\`/anti-ban\`` , value : `لتسطيب نظام الحماية من الباند`},
      {name : `\`/anti-bots\`` , value : `لتسطيب نظام الحماية من البوتات`},
      {name : `\`/anti-delete-roles\`` , value : `لتسطيب نظام الحماية من حذف الرتب`},
      {name : `\`/anti-delete-rooms\`` , value : `لتسطيب نظام الحماية من حذف الرومات`},
      {name : `\`/protection-status\`` , value : `للاستعلام عن حالة نظام الحماية`},
      {name : `\`/set-protect-logs\`` , value : `لتحديد روم لوج الحماية`},
      {name : `\`/bot- avatar\`` , value : `تغيير صورة البوت`},
      {name : `\`/bot- name\`` , value : ` تغيير اسم البوت`},
      {name : `\`/set-straming\`` , value : `تغيير حالة البوت`},
      {name : `\`/join-voice\`` , value : `الانضمام الى روم صوتي`},
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

const folderPath2 = path.join(__dirname, 'slashcommand19');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/protect-commands`)(client19)
require("./handlers/events")(client19)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client19.once(event.name, (...args) => event.execute(...args));
	} else {
		client19.on(event.name, (...args) => event.execute(...args));
	}
	}





  client19.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client19.protectSlashCommands.get(interaction.commandName);
	    
      if (!command) {

        return;
      }
      if (command.ownersOnly === true) {
        if (owner != interaction.user.id) {
          return interaction.reply({content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true});
        }
      }
      try {

        await command.execute(interaction);
      } catch (error) {
			return
		}
    }
  } )

   client19.login(token)
   .catch(async(err) => {
    const filtered = protect.filter(bo => bo != data)
			await tokens.set(`protect` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
