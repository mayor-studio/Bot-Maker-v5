  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, ChatInputCommandInteraction, StringSelectMenuBuilder, SlashCommandBuilder, PermissionsBitField  } = require("discord.js");
const { Database } = require("st.db")
const inviterDB = new Database("/Json-db/Bots/inviterDB.json");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let invites = tokens.get('invites')
if(!invites) return;

const path = require('path');
const { readdirSync } = require("fs");
let theowner;
invites.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client15 =new Client({intents: 131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client15.commands = new Collection();
  require(`./handlers/events`)(client15);
  client15.events = new Collection();
  client15.setMaxListeners(1000)

  require(`../../events/requireBots/invites-commands`)(client15);
  const rest = new REST({ version: '10' }).setToken(token);
  client15.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client15.user.id),
          { body: invitesSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client15.once('ready', () => {
    client15.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`apply bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client15.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`invites`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client15.users.cache.get(owner) || await client15.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : دعوات\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`invites`, filtered);
          await client15.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`../invites/handlers/events`)(client15)

  const folderPath = path.join(__dirname, 'slashcommand15');
  client15.invitesSlashCommands = new Collection();
  const invitesSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("invites commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          invitesSlashCommands.push(command.data.toJSON());
          client15.invitesSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand15');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/invites-commands`)(client15)
require("./handlers/events")(client15)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client15.once(event.name, (...args) => event.execute(...args));
	} else {
		client15.on(event.name, (...args) => event.execute(...args));
	}
	}




    client15.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const command = client15.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    await interaction.reply({ content: "❌ An error occurred while executing the command", ephemeral: true });
  }
});
    
const guildInvites = new Map();

client15.on('inviteCreate', async invite => {
  const invites = await invite.guild.invites.fetch();
  guildInvites.set(invite.guild.id, new Map(invites.map(i => [i.code, i.uses])));
});

client15.on('inviteDelete', async invite => {
  const invites = await invite.guild.invites.fetch();
  guildInvites.set(invite.guild.id, new Map(invites.map(i => [i.code, i.uses])));
});

client15.on('guildMemberAdd', async member => {
  if (member.user.bot) return;

  try {
    const newInvites = await member.guild.invites.fetch();
    const oldInvites = guildInvites.get(member.guild.id) || new Map();

    const usedInvite = newInvites.find(inv => {
      const oldUses = oldInvites.get(inv.code) || 0;
      return inv.uses > oldUses;
    });

    guildInvites.set(member.guild.id, new Map(newInvites.map(i => [i.code, i.uses])));

    if (!usedInvite || !usedInvite.inviter) return;
    
    const inviterId = usedInvite.inviter.id;

    // Track invitedBy
    inviterDB.set(`invitedBy_${member.id}`, inviterId);

    // Increment invite points
    const currentPoints = inviterDB.get(`invitePoints_${inviterId}`) || 0;
    inviterDB.set(`invitePoints_${inviterId}`, currentPoints + 1);

    // Track joined users
    const joinedUsers = inviterDB.get(`joinedUsers_${inviterId}`) || [];
    joinedUsers.push({
      id: member.id,
      username: member.user.tag,
      joinedAt: new Date().toISOString()
    });
    inviterDB.set(`joinedUsers_${inviterId}`, joinedUsers);

    // Optional welcome
    const welcomeChannelId = inviterDB.get(`welcomeChannel_${member.guild.id}`);
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
    if (welcomeChannel) {
      welcomeChannel.send(`🎉 <@${member.id}> joined using invite from <@${inviterId}>!`);
    }

  } catch (err) {
    console.error('Error in guildMemberAdd:', err);
  }
});

client15.on('guildMemberRemove', async member => {
  if (member.user.bot) return;

  try {
    const inviterId = inviterDB.get(`invitedBy_${member.id}`);
    if (!inviterId) return;

    // Remove invite point
    const points = inviterDB.get(`invitePoints_${inviterId}`) || 0;
    inviterDB.set(`invitePoints_${inviterId}`, Math.max(0, points - 1));

    // Increment left count
    const left = inviterDB.get(`leftUsers_${inviterId}`) || 0;
    inviterDB.set(`leftUsers_${inviterId}`, left + 1);

    // Track left user
    const leftUsersData = inviterDB.get(`leftUsersData_${inviterId}`) || [];
    leftUsersData.push({
      id: member.id,
      username: member.user.tag,
      leftAt: new Date().toISOString()
    });
    inviterDB.set(`leftUsersData_${inviterId}`, leftUsersData);

    // Remove link
    inviterDB.delete(`invitedBy_${member.id}`);

  } catch (err) {
    console.error('Error in guildMemberRemove:', err);
  }
});
    
     client15.on("interactionCreate", async (interaction) => {
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
{name: `\`/invites-room\``, value: `Set the invite channel`},
{name: `\`/invites\``, value: `Show the number of invites for a user`},
{name: `\`/add-invites\``, value: `Add invites to a user`},
{name: `\`/remove-room\``, value: `Remove the invite channel`},
{name: `\`/reset-all-invites\``, value: `Reset invites for all users`},
{name: `\`/reset-invites\``, value: `Reset invites for a user`},
{name: `\`/change-avatar\``, value: `Change the bot's avatar`},
{name: `\`/change-name\``, value: `Change the bot's name`},

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
    
  client15.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client15.invitesSlashCommands.get(interaction.commandName);
	    
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



   client15.login(token)
   .catch(async(err) => {
    const filtered = invites.filter(bo => bo != data)
			await tokens.set(`invites` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
