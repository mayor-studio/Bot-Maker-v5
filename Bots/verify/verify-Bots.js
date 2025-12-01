const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const verifyDB = new Database("/Json-db/Bots/verifyDB.json")
const tokens = new Database("/tokens/tokens")
const { PermissionsBitField } = require('discord.js')
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let verify = tokens.get('verify')
if(!verify) return;

const path = require('path');
const { readdirSync } = require("fs");
verify.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client4 = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences
    ],
    partials: [
      Partials.Message,
      Partials.Channel,
      Partials.Reaction,
      Partials.GuildMember,
      Partials.User
    ]
  });
  client4.commands = new Collection();
  require(`./handlers/events`)(client4);
  client4.events = new Collection();
  require(`../../events/requireBots/Verify-commands`)(client4);
  const rest = new REST({ version: '10' }).setToken(token);
  client4.setMaxListeners(1000)

  client4.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client4.user.id),
          { body: verifySlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client4.once('ready', () => {
    client4.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`verify bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client4.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`verify`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client4.users.cache.get(owner) || await client4.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : تشهير نصابين\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`verify`, filtered);
          await client4.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`./handlers/events`)(client4)
  const folderPath = path.join(__dirname, 'slashcommand4');
  client4.verifySlashCommands = new Collection();
  const verifySlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("verify commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          verifySlashCommands.push(command.data.toJSON());
          client4.verifySlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand4');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/Verify-commands`)(client4)
require("./handlers/events")(client4)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client4.once(event.name, (...args) => event.execute(...args));
	} else {
		client4.on(event.name, (...args) => event.execute(...args));
	}
	}

client4.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    try {
        // Fetch reaction and message if partial
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        const guild = reaction.message.guild;
        if (!guild) return;

        const reactionRoles = await verifyDB.get(`reaction_roles_${guild.id}`);
        if (!reactionRoles?.length) return;

        const reactionRole = reactionRoles.find(r => 
            r.messageId === reaction.message.id && 
            (r.emoji === reaction.emoji.toString() || r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id)
        );

        if (!reactionRole) return;

        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) return;

        const role = await guild.roles.fetch(reactionRole.roleId).catch(() => null);
        if (!role) return;

        // Check bot permissions
        const botMember = guild.members.me;
        if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            console.error('Bot missing MANAGE_ROLES permission');
            return;
        }

        // Check if bot can manage the role
        if (role.position >= botMember.roles.highest.position) {
            console.error('Bot cannot manage this role - role is higher than bot\'s highest role');
            return;
        }

        await member.roles.add(role).catch(err => {
            console.error('Failed to add role:', err);
        });

    } catch (error) {
        console.error('Error in messageReactionAdd:', error);
    }
});

client4.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;

    try {
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        const reactionRoles = await verifyDB.get(`reaction_roles_${reaction.message.guild.id}`);
        if (!reactionRoles) return;

        const reactionRole = reactionRoles.find(r => 
            r.messageId === reaction.message.id && r.emoji === reaction.emoji.toString()
        );

        if (!reactionRole) return;

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        const role = await guild.roles.fetch(reactionRole.roleId);

        if (!role || !guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) return;

        await member.roles.remove(role);
        console.log(`Successfully removed role ${role.name} from ${member.user.tag}`);

    } catch (error) {
        console.error('Error in messageReactionRemove:', error);
    }
});

  client4.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client4.verifySlashCommands.get(interaction.commandName);
	    
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


  client4.on("interactionCreate" , async(interaction) => {
    //--
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
            new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Danger).setEmoji('👑'),
        )
  
      await interaction.update({embeds : [embed] , components : [btns]})
    //--
    }else if(interaction.customId === "help_owner"){
      const embed = new EmbedBuilder()
      .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
      .setTitle('قائمة اوامر البوت')
      .addFields(
      )
      .setTimestamp()
      .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
      .setColor('DarkButNotBlack');
      const btns = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
        new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Danger).setEmoji('👑').setDisabled(true),
    )
  await interaction.update({embeds : [embed] , components : [btns]})
    }
  })



   client4.login(token)
   .catch(async(err) => {
    const filtered = verify.filter(bo => bo != data)
			await tokens.set(`verify` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})