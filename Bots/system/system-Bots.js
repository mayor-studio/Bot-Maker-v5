const { Client, Collection, discord,GatewayIntentBits,ChannelType, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, Attachment } = require("discord.js");
const { Database } = require("st.db")
const systemDB = new Database("/Json-db/Bots/systemDB.json")
const shortcutDB = new Database("/Json-db/Others/shortcutDB.json")
const tokens = new Database("/tokens/tokens")
const { PermissionsBitField } = require('discord.js')
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let system = tokens.get('system')
if(!system) return;
const path = require('path');
const { readdirSync } = require("fs");
let theowner;
let thetoken;
system.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  thetoken = token;
  const client17 = new Client({intents:131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client17.commands = new Collection();
  require(`./handlers/events`)(client17);
  client17.events = new Collection();
  require(`../../events/requireBots/system-commands`)(client17);
  const rest = new REST({ version: '10' }).setToken(token);
  client17.setMaxListeners(1000)

  client17.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client17.user.id),
          { body: systemSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
          
        }

    });
        client17.once('ready', () => {
    client17.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`system bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client17.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`system`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client17.users.cache.get(owner) || await client17.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : سيستم\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`system`, filtered);
          await client17.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`../system/handlers/events`)(client17)

  const folderPath = path.join(__dirname, 'slashcommand17');
  client17.systemSlashCommands = new Collection();
  const systemSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("system commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          systemSlashCommands.push(command.data.toJSON());
          client17.systemSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand17');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/system-commands`)(client17)
require("./handlers/events")(client17)
require("./handlers/autorole")(client17)
require("./handlers/info")(client17)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client17.once(event.name, (...args) => event.execute(...args));
	} else {
		client17.on(event.name, (...args) => event.execute(...args));
	}
	}




  client17.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client17.systemSlashCommands.get(interaction.commandName);
	    
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
        return;
		}
    }
  } )


client17.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`say_cmd_${message.guild.id}`) || null;  
    if (message.author.bot) return;
    if (message.content.startsWith(`${prefix}say`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const content = message.content.slice(`${prefix}say`.length).trim();
        if (!content) {
            message.channel.send("من فضلك اكتب شيئا بعد الأمر.");
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

client17.on('messageCreate', async message => {
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

client17.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`come_cmd_${message.guild.id}`) || null;  
    if (message.content.startsWith(`${prefix}come`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('يجب أن تملك صلاحية إدارة الرسائل (MANAGE_MESSAGES).');
        }

        const mentionOrID = message.content.split(/\s+/)[1];
        const targetMember = message.mentions.members.first() || message.guild.members.cache.get(mentionOrID);

        if (!targetMember) {
            return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
        }

        const directMessageContent = `**تم استدعائك بواسطة : ${message.author}\nفي : ${message.channel}**`;

        try {
            await targetMember.send(directMessageContent);
            await message.reply('**تم الارسال للشخص بنجاح**');
        } catch (error) {
            await message.reply('**لم استطع الارسال للشخص**');
        }
    }
});

client17.on('messageCreate', async message => {
  const cmd = await shortcutDB.get(`ban_cmd_${message.guild.id}`) || null;
  const commandUsed = message.content.startsWith(`${prefix}ban`) || (cmd && message.content.startsWith(cmd));
  
  if (!commandUsed || message.author.bot) return;

  // Check bot permissions first
  if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
    return message.reply('❌ لا املك صلاحية الحظر');
  }

  // Check user permissions
  if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
    return message.reply('❌ انت لا تملك صلاحية الحظر');
  }

  // Get user and reason
  const args = message.content.split(/\s+/);
  args.shift(); // Remove command name
  
  if (!args[0]) {
    return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
  }

  let userId = args[0].replace(/[<@!>]/g, '');
  let reason = args.slice(1).join(' ') || 'لا يوجد سبب';

  try {
    // Try to get member
    const member = await message.guild.members.fetch(userId).catch(() => null);
    
    if (!member) {
      return message.reply('❌ لم استطع العثور على هذا الشخص في السيرفر.');
    }

    // Additional checks
    if (member.id === message.guild.ownerId) {
      return message.reply('❌ لا يمكن حظر مالك السيرفر.');
    }

    if (member.id === client17.user.id) {
      return message.reply('❌ لا يمكنني حظر نفسي.');
    }

    if (member.id === message.author.id) {
      return message.reply('❌ لا يمكنك حظر نفسك.');
    }

    if (!member.bannable) {
      return message.reply('❌ لا يمكنني حظر هذا الشخص. ربما لديه صلاحيات أعلى مني.');
    }

    if (message.member.roles.highest.position <= member.roles.highest.position) {
      return message.reply('❌ لا يمكنك حظر شخص لديه رتبة أعلى أو مساوية لك.');
    }

    // Execute ban
    await member.ban({ reason: `Banned by ${message.author.tag} | Reason: ${reason}` });
    
    // Send confirmation
    const banEmbed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('حظر عضو')
      .setDescription(`✅ تم حظر العضو **${member.user.tag}** بنجاح`)
      .addFields(
        { name: 'بواسطة', value: message.author.tag, inline: true },
        { name: 'السبب', value: reason || 'لا يوجد سبب', inline: true }
      )
      .setTimestamp();

    return message.reply({ embeds: [banEmbed] });

  } catch (error) {
    console.error('Ban command error:', error);
    return message.reply('❌ حدث خطأ أثناء محاولة الحظر.');
  }
});

client17.on('messageCreate', async message => {
  const cmd = await shortcutDB.get(`kick_cmd_${message.guild.id}`) || null;
  const commandUsed = message.content.startsWith(`${prefix}kick`) || (cmd && message.content.startsWith(cmd));
  
  if (!commandUsed || message.author.bot) return;

  // Check bot permissions
  if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
    return message.reply('❌ لا املك صلاحية الطرد');
  }

  // Check user permissions
  if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
    return message.reply('❌ انت لا تملك صلاحية الطرد');
  }

  const args = message.content.split(/\s+/);
  args.shift();
  
  if (!args[0]) {
    return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
  }

  const userId = args[0].replace(/[<@!>]/g, '');
  const reason = args.slice(1).join(' ') || 'لا يوجد سبب';

  try {
    const member = await message.guild.members.fetch(userId).catch(() => null);
    
    if (!member) {
      return message.reply('❌ لم استطع العثور على هذا الشخص في السيرفر.');
    }

    // Additional checks
    if (member.id === message.guild.ownerId) {
      return message.reply('❌ لا يمكن طرد مالك السيرفر.');
    }

    if (member.id === client17.user.id) {
      return message.reply('❌ لا يمكنني طرد نفسي.');
    }

    if (member.id === message.author.id) {
      return message.reply('❌ لا يمكنك طرد نفسك.');
    }

    if (!member.kickable) {
      return message.reply('❌ لا يمكنني طرد هذا الشخص. ربما لديه صلاحيات أعلى مني.');
    }

    if (message.member.roles.highest.position <= member.roles.highest.position) {
      return message.reply('❌ لا يمكنك طرد شخص لديه رتبة أعلى أو مساوية لك.');
    }

    // Execute kick
    await member.kick(`Kicked by ${message.author.tag} | Reason: ${reason}`);
    
    const kickEmbed = new EmbedBuilder()
      .setColor('Yellow')
      .setTitle('طرد عضو')
      .setDescription(`✅ تم طرد العضو **${member.user.tag}** بنجاح`)
      .addFields(
        { name: 'بواسطة', value: message.author.tag, inline: true },
        { name: 'السبب', value: reason || 'لا يوجد سبب', inline: true }
      )
      .setTimestamp();

    return message.reply({ embeds: [kickEmbed] });

  } catch (error) {
    console.error('Kick command error:', error);
    return message.reply('❌ حدث خطأ أثناء محاولة الطرد.');
  }
});

client17.on('messageCreate', async message => {
  const timeout_cmd = await shortcutDB.get(`timeout_cmd_${message.guild.id}`) || null;
  if (message.content.startsWith(`${prefix}timeout`) || (timeout_cmd && message.content.startsWith(timeout_cmd))) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('❌ انت لا تملك صلاحية التايم اوت.');
    }

    const args = message.content.split(/\s+/);
    args.shift();

    if (!args[0]) {
      return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
    }

    const userId = args[0].replace(/[<@!>]/g, '');
    const duration = args[1] || '1h';
    const reason = args.slice(2).join(' ') || 'لا يوجد سبب';

    // Convert duration string to milliseconds
    const timeMap = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const timeRegex = /^(\d+)([smhd])$/;
    const match = duration.match(timeRegex);

    if (!match) {
      return message.reply('⚠️ صيغة المدة غير صحيحة. استخدم رقم + s/m/h/d (مثال: 1h, 30m, 1d)');
    }

    const [, time, unit] = match;
    const milliseconds = parseInt(time) * timeMap[unit];

    if (milliseconds > 2419200000) { // 28 days
      return message.reply('❌ مدة التايم اوت لا يمكن أن تتجاوز 28 يوم.');
    }

    try {
      const member = await message.guild.members.fetch(userId);

      if (!member) {
        return message.reply('❌ لم استطع العثور على هذا الشخص في السيرفر.');
      }

      if (member.id === message.guild.ownerId || !member.moderatable) {
        return message.reply('❌ لا يمكن اعطاء تايم اوت لهذا الشخص.');
      }

      await member.timeout(milliseconds, reason);

      const timeoutEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('تايم اوت')
        .setDescription(`✅ تم اعطاء تايم اوت للعضو **${member.user.tag}** بنجاح`)
        .addFields(
          { name: 'بواسطة', value: message.author.tag, inline: true },
          { name: 'مدة التايم اوت', value: duration, inline: true },
          { name: 'السبب', value: reason || 'لا يوجد سبب', inline: true }
        )
        .setTimestamp();

      return message.reply({ embeds: [timeoutEmbed] });
    } catch (error) {
      console.error('Timeout command error:', error);
      return message.reply('❌ حدث خطأ أثناء محاولة اعطاء التايم اوت.');
    }
  }
});

client17.on('messageCreate', async message => {
  const untimeout_cmd = await shortcutDB.get(`untimeout_cmd_${message.guild.id}`) || null;
  if (message.content.startsWith(`${prefix}untimeout`) || (untimeout_cmd && message.content.startsWith(untimeout_cmd))) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('❌ انت لا تملك صلاحية التايم اوت.');
    }

    const args = message.content.split(/\s+/);
    args.shift();

    if (!args[0]) {
      return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
    }

    const userId = args[0].replace(/[<@!>]/g, '');
    const reason = args.slice(1).join(' ') || 'لا يوجد سبب';

    try {
      const member = await message.guild.members.fetch(userId);

      if (!member) {
        return message.reply('❌ لم استطع العثور على هذا الشخص في السيرفر.');
      }

      if (!member.communicationDisabledUntil) {
        return message.reply('❌ هذا الشخص ليس لديه تايم اوت.');
      }

      await member.timeout(null, reason);

      const untimeoutEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('ازالة تايم اوت')
        .setDescription(`✅ تم ازالة التايم اوت عن العضو **${member.user.tag}** بنجاح`)
        .addFields(
          { name: 'بواسطة', value: message.author.tag, inline: true },
          { name: 'السبب', value: reason || 'لا يوجد سبب', inline: true }
        )
        .setTimestamp();

      return message.reply({ embeds: [untimeoutEmbed] });
    } catch (error) {
      console.error('Untimeout command error:', error);
      return message.reply('❌ حدث خطأ أثناء محاولة ازالة التايم اوت.');
    }
  }
});

client17.on('messageCreate', async message => {
  const mute_cmd = await shortcutDB.get(`mute_cmd_${message.guild.id}`) || null;
  if (message.content.startsWith(`${prefix}mute`) || (mute_cmd && message.content.startsWith(mute_cmd))) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply('❌ انت لا تملك صلاحية ادارة الرتب.');
    }

    const args = message.content.split(/\s+/);
    args.shift();

    if (!args[0]) {
      return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
    }

    const userId = args[0].replace(/[<@!>]/g, '');
    const reason = args.slice(1).join(' ') || 'لا يوجد سبب';

    try {
      const member = await message.guild.members.fetch(userId);
      if (!member) {
        return message.reply('❌ لم استطع العثور على هذا الشخص في السيرفر.');
      }

      let muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
      if (!muteRole) {
        try {
          muteRole = await message.guild.roles.create({
            name: 'Muted',
            permissions: [],
            reason: 'Mute role creation'
          });

          message.guild.channels.cache.forEach(async channel => {
            await channel.permissionOverwrites.create(muteRole, {
              SendMessages: false,
              AddReactions: false,
              Speak: false
            });
          });
        } catch (error) {
          return message.reply('❌ فشل في انشاء رتبة الميوت.');
        }
      }

      await member.roles.add(muteRole);
      
      const muteEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('ميوت')
        .setDescription(`✅ تم اعطاء ميوت للعضو **${member.user.tag}** بنجاح`)
        .addFields(
          { name: 'بواسطة', value: message.author.tag, inline: true },
          { name: 'السبب', value: reason || 'لا يوجد سبب', inline: true }
        )
        .setTimestamp();

      return message.reply({ embeds: [muteEmbed] });
    } catch (error) {
      console.error('Mute command error:', error);
      return message.reply('❌ حدث خطأ أثناء محاولة اعطاء الميوت.');
    }
  }
});

client17.on('messageCreate', async message => {
  const unmute_cmd = await shortcutDB.get(`unmute_cmd_${message.guild.id}`) || null;
  if (message.content.startsWith(`${prefix}unmute`) || (unmute_cmd && message.content.startsWith(unmute_cmd))) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply('❌ انت لا تملك صلاحية ادارة الرتب.');
    }

    const args = message.content.split(/\s+/);
    args.shift();

    if (!args[0]) {
      return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
    }

    const userId = args[0].replace(/[<@!>]/g, '');
    const reason = args.slice(1).join(' ') || 'لا يوجد سبب';

    try {
      const member = await message.guild.members.fetch(userId);
      if (!member) {
        return message.reply('❌ لم استطع العثور على هذا الشخص في السيرفر.');
      }

      const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
      if (!muteRole) {
        return message.reply('❌ لم يتم العثور على رتبة الميوت.');
      }

      if (!member.roles.cache.has(muteRole.id)) {
        return message.reply('❌ هذا الشخص ليس لديه ميوت.');
      }

      await member.roles.remove(muteRole);
      
      const unmuteEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('ازالة ميوت')
        .setDescription(`✅ تم ازالة الميوت عن العضو **${member.user.tag}** بنجاح`)
        .addFields(
          { name: 'بواسطة', value: message.author.tag, inline: true },
          { name: 'السبب', value: reason || 'لا يوجد سبب', inline: true }
        )
        .setTimestamp();

      return message.reply({ embeds: [unmuteEmbed] });
    } catch (error) {
      console.error('Unmute command error:', error);
      return message.reply('❌ حدث خطأ أثناء محاولة ازالة الميوت.');
    }
  }
});

client17.on('messageCreate', async message => {
  const unban_cmd = await shortcutDB.get(`unban_cmd_${message.guild.id}`) || null;
  if (message.content.startsWith(`${prefix}unban`) || (unban_cmd && message.content.startsWith(unban_cmd))) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('❌ انت لا تملك صلاحية الحظر.');
    }

    const args = message.content.split(/\s+/);
    args.shift();

    if (!args[0]) {
      return message.reply('⚠️ من فضلك ضع ايدي الشخص المراد ازالة الحظر عنه.');
    }

    const userId = args[0];
    const reason = args.slice(1).join(' ') || 'لا يوجد سبب';

    try {
      const ban = await message.guild.bans.fetch(userId);
      if (!ban) {
        return message.reply('❌ هذا الشخص ليس لديه حظر.');
      }

      await message.guild.members.unban(userId, `Unbanned by ${message.author.tag} | Reason: ${reason}`);

      const unbanEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('ازالة حظر')
        .setDescription(`✅ تم ازالة الحظر عن العضو **${ban.user.tag}** بنجاح`)
        .addFields(
          { name: 'بواسطة', value: message.author.tag, inline: true },
          { name: 'السبب', value: reason || 'لا يوجد سبب', inline: true }
        )
        .setTimestamp();

      return message.reply({ embeds: [unbanEmbed] });
    } catch (error) {
      console.error('Unban command error:', error);
      return message.reply('❌ حدث خطأ أثناء محاولة ازالة الحظر. تأكد من صحة الايدي.');
    }
  }
});

client17.on("messageCreate", async (message) => {
  const cmd = await shortcutDB.get(`lock_cmd_${message.guild.id}`) || null;
  
  if (message.content === `${prefix}lock` || message.content === `${cmd}`) {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
      }
      await message.channel.permissionOverwrites.edit(
        message.channel.guild.roles.everyone, 
        { SendMessages: false }
      );
      return message.reply({ content: `**تم قفل الروم ${message.channel}**` });
    } catch (error) {
      message.reply({ content: `لقد حدث خطأ، اتصل بالمطورين.` });
      console.log(error);
    }
  }
});


client17.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`unlock_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}unlock` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { SendMessages: true }
    );
    return message.reply({ content: `**تم فتح الروم ${message.channel}**` });
  }
});

client17.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`hide_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}hide` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { ViewChannel: false }
    );
    return message.reply({ content: `**تم اخفاء الروم ${message.channel}**` });
  }
});

client17.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`unhide_cmd_${message.guild.id}`) || null; 
  if (message.content === `${prefix}unhide` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { ViewChannel: true }
    );
    return message.reply({ content: `**تم اظهار الروم ${message.channel}**` });
  }
});

client17.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`server_cmd_${message.guild.id}`) || null;
  if (message.content === `${prefix}server` || message.content === `${cmd}`) {
    const embedser = new EmbedBuilder()
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setColor('Random')
      .addFields(
        {
          name: `**🆔 Server ID:**`, 
          value: message.guild.id, 
          inline: false
        },
        {
          name: `**📆 Created On:**`, 
          value: `**<t:${parseInt(message.guild.createdTimestamp / 1000)}:R>**`, 
          inline: false
        },
        {
          name: `**👑 Owned By:**`, 
          value: `**<@${message.guild.ownerId}>**`, 
          inline: false
        },
        {
          name: `**👥 Members (${message.guild.memberCount})**`, 
          value: `**${message.guild.premiumSubscriptionCount} Boosts ✨**`, 
          inline: false
        },
        {
          name: `**💬 Channels (${message.guild.channels.cache.size})**`, 
          value: `**${message.guild.channels.cache.filter(r => r.type === ChannelType.GuildText).size}** Text | **${
              message.guild.channels.cache.filter(r => r.type === ChannelType.GuildVoice).size
            }** Voice | **${message.guild.channels.cache.filter(r => r.type === ChannelType.GuildCategory).size}** Category`,
          inline: false
        },
        {
          name: '🌍 Others',
          value: `**Verification Level:** ${message.guild.verificationLevel}`,
          inline: false
        }
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }));
    return message.reply({ embeds: [embedser] });
  }
});

client17.on('messageCreate', async message => {
    if (message.content === `${prefix}help`) {
        const embed = new EmbedBuilder()
            .setAuthor({name : message.guild.name , iconURL : message.guild.iconURL({dynamic : true})})
            .setTitle('قائمة اوامر البوت')
            .setDescription(`**يرجى اختيار القسم المراد معرفة اوامره**`)
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({text : `Requested By ${message.author.username}` , iconURL : message.author.displayAvatarURL({dynamic : true})})
            .setColor('DarkButNotBlack');

        const btns = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
            new ButtonBuilder().setCustomId('help_admin').setLabel('ادمن').setStyle(ButtonStyle.Primary).setEmoji('🛠️'),
            new ButtonBuilder().setCustomId('help_owner').setLabel('المالك').setStyle(ButtonStyle.Danger).setEmoji('👑'),
        );

        await message.reply({ embeds: [embed], components: [btns] });
    }
});

let invites = {}; 
const getInviteCounts = async (guild) => {
    return new Map(guild.invites.cache.map(invite => [invite.code, invite.uses]));
};

client17.on('inviteCreate', async invite => {
    if (!invites[invite.guild.id]) {
        invites[invite.guild.id] = new Map();
    }
    invites[invite.guild.id].set(invite.code, invite.uses);
});

client17.on('inviteDelete', async invite => {
    if (invites[invite.guild.id]) {
        invites[invite.guild.id].delete(invite.code);
    }
});

client17.on('guildMemberAdd', async member => {
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

        const fullUser = await client17.users.fetch(member.user.id, { force: true });

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



client17.on("interactionCreate" , async(interaction) => {
  if(interaction.customId === "help_general"){
    const embed = new EmbedBuilder()
        .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
        .setTitle('قائمة اوامر البوت')
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          {name : `\`/avatar\`` , value : `لرؤية افتارك او فتار شخص اخر`},
          {name : `\`/server\` | \`${prefix}server\`` , value : `لرؤية معلومات السرفر`},
          {name : `\`/user\`` , value : `لرؤية معلومات حسابك او حساب شخص اخر`},
          {name : `\`/banner\`` , value : `لرؤية بانرك او بانر شخص اخر`},
          {name : `\`/avatar-server\`` , value : `لاظهار افتار السيرفر`},
          {name : `\`/big-name\`` , value : `كتابة اسم كبير`},
          {name : `\`/fonts\`` , value : `لزخرفة الكلام الى انواع`},
          {name : `\`/help\`` , value : `لعرض قائمة المساعدة`},
        )
        .setTimestamp()
        .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
        .setColor('DarkButNotBlack');
    const btns = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐').setDisabled(true),
        new ButtonBuilder().setCustomId('help_admin').setLabel('ادمن').setStyle(ButtonStyle.Primary).setEmoji('🛠️'),
        new ButtonBuilder().setCustomId('help_owner').setLabel('المالك').setStyle(ButtonStyle.Danger).setEmoji('👑'),
    )

    await interaction.update({embeds : [embed] , components : [btns]})
  }else if(interaction.customId === "help_admin"){
    const embed = new EmbedBuilder()
    .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
    .setTitle('قائمة اوامر البوت')
    .addFields(
      {name : `\`/ban\` | \`${prefix}ban - ${prefix}unban\`` , value : `لاعطاء باند لشخص`},
      {name : `\`/clear\` | \`${prefix}clear\`` , value : `لحذف عدد من الرسائل`},
      {name : `\`/come\` | \`${prefix}come\`` , value : `لاستدعاء شخص`},
      {name : `\`/embed\`` , value : `لقول كلام في ايمبد`},
      {name : `\`/hide\` | \`${prefix}hide\`` , value : `لاخفاء روم`},
      {name : `\`/kick\` | \`${prefix}kick\`` , value : `لاعطاء كيك لشخص`},
      {name : `\`/lock\` | \`${prefix}lock\`` , value : `لقفل روم`},
      {name : `\`/nickname\`` , value : `اعطاء اسم مستعار لشخص او ازالته`},
      {name : `\`/mute\` | \`${prefix}mute - ${prefix}unmute\`` , value : `لاعطاء ميوت لشخص`},
      {name : `\`/role\`` , value : `لاعطاء رتبة لشخص او ازالتها`},
      {name : `\`/roles\`` , value : `للاستعلام عن رتب السيرفر`},
      {name : `\`/say\` | \`${prefix}say\`` , value : `لقول كلام`},
      {name : `\`/send\`` , value : `لارسال رسالة لشخص ما`},
      {name : `\`/timeout\` | \`${prefix}timeout - ${prefix}untimeout\`` , value : `لاعطاء تايم اوت لشخص`},
      {name : `\`/unhide\` | \`${prefix}unhide\`` , value : `لاظهار روم`},
      {name : `\`/unlock\` | \`${prefix}unlock\`` , value : `لفتح روم`},

    )
    .setTimestamp()
    .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
    .setColor('DarkButNotBlack');
const btns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
    new ButtonBuilder().setCustomId('help_admin').setLabel('ادمن').setStyle(ButtonStyle.Primary).setEmoji('🛠️').setDisabled(true),
    new ButtonBuilder().setCustomId('help_owner').setLabel('المالك').setStyle(ButtonStyle.Danger).setEmoji('👑'),
)

await interaction.update({embeds : [embed] , components : [btns]})
  }else if(interaction.customId === "help_owner"){
    const embed = new EmbedBuilder()
    .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
    .setTitle('قائمة اوامر المالك')
    .addFields(
      {name : `\`/change-avatar\`` , value : `تغيير صورة البوت`},
      {name : `\`/change-name\`` , value : `تغيير اسم البوت`},
      {name : `\`/set-streaming\`` , value : `تغيير حالة البوت`},
      {name : `\`/cmd-shortcut\`` , value : `لاضافة اختصار للامر`},
      {name : `\`/new-panel\`` , value : `انشاء بنل رتب جديد`},
      {name : `\`/add-button\`` , value : `اضافة زر جديد للرتبة`},
      {name : `\`/add-info-button\`` , value : `اضافة زر معلومات`},
      {name : `\`/setup-welcome\`` , value : `تسطيب نظام الترحيب`},
      {name : `\`/ban_list\`` , value : `لعرض قائمة الباندات`},
      {name : `\`/role-emoji\`` , value : `لاضافة ايموجي للرتبة`},

    )
    .setTimestamp()
    .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
    .setColor('DarkButNotBlack');

    const btns = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
        new ButtonBuilder().setCustomId('help_admin').setLabel('ادمن').setStyle(ButtonStyle.Primary).setEmoji('🛠️'),
        new ButtonBuilder().setCustomId('help_owner').setLabel('المالك').setStyle(ButtonStyle.Danger).setEmoji('👑').setDisabled(true),
    )

    await interaction.update({embeds : [embed] , components : [btns]})
  }
})

   client17.login(token)
   .catch(async(err) => {
    const filtered = system.filter(bo => bo != data)
			await tokens.set(`system` , filtered)
      console.log(`${clientId} Not working and removed `)
   });
});

