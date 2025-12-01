
  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, ChatInputCommandInteraction, StringSelectMenuBuilder, SlashCommandBuilder  } = require("discord.js");
const { Database } = require("st.db")
const applyDB = new Database("/Json-db/Bots/applyDB.json")
const tokens = new Database("/tokens/tokens")
const { PermissionsBitField } = require('discord.js')
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let apply = tokens.get('apply')
if(!apply) return;

const path = require('path');
const { readdirSync } = require("fs");
let theowner;
apply.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client13 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client13.commands = new Collection();
  require(`./handlers/events`)(client13);
  client13.events = new Collection();
  require(`../../events/requireBots/apply-commands`)(client13);
  const rest = new REST({ version: '10' }).setToken(token);
  client13.setMaxListeners(1000)
  client13.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client13.user.id),
          { body: applySlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
    client13.once('ready', () => {
    client13.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`apply bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client13.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`apply`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client13.users.cache.get(owner) || await client13.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : تقديمات\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`apply`, filtered);
          await client13.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`../apply/handlers/events`)(client13)
    require(`../apply/handlers/applyCreate`)(client13)
    require(`../apply/handlers/applyResult`)(client13)
    require(`../apply/handlers/applySubmit`)(client13)

  const folderPath = path.join(__dirname, 'slashcommand13');
  client13.applySlashCommands = new Collection();
  const applySlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("apply commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          applySlashCommands.push(command.data.toJSON());
          client13.applySlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand13');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/apply-commands`)(client13)
require("./handlers/events")(client13)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client13.once(event.name, (...args) => event.execute(...args));
	} else {
		client13.on(event.name, (...args) => event.execute(...args));
	}
	}




          client13.on("interactionCreate", async (interaction) => {
            if (interaction.isChatInputCommand()) {
              if (interaction.user.bot) return;

              const command = client13.applySlashCommands.get(interaction.commandName);

              if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
              }

              if (command.ownersOnly === true) {
                if (owner != interaction.user.id) {
                  return interaction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor('Red')
                        .setDescription("❗ You cannot use this command.")
                    ],
                    ephemeral: true
                  });
                }
              }
              if (command.adminsOnly === true) {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                  return interaction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor('Red')
                        .setDescription("❗ You must have Administrator permission to use this command.")
                    ],
                    ephemeral: true
                  });
                }
              }

              try {
                await command.execute(interaction);
              } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
              }
            }
          });

          client13.on("interactionCreate", async (interaction) => {
            if (!interaction.isStringSelectMenu()) return;

            if (interaction.customId === "help_menu") {
              let embed;

              if (interaction.values[0] === "general") {
                embed = new EmbedBuilder()
                  .setAuthor({
                    name: interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                  })
                  .setTitle('Bot Command List')
                  .addFields(
                    { name: "/help", value: "Show the command list" },
                    { name: "/support", value: "Join the support server" },
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                  })
                  .setColor('DarkButNotBlack');
              }

              if (interaction.values[0] === "owner") {
                embed = new EmbedBuilder()
                  .setAuthor({
                    name: interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                  })
                  .setTitle('Owner-Only Commands')
                  .addFields(
                    { name: "/setup-apply", value: "Setup the apply system" },
                    { name: "/new-apply", value: "Create a new application" },
                    { name: "/dm-mode", value: "Send DM to applicant upon accept/deny" },
                    { name: "/close-apply", value: "Close an open application" },
                    { name: "/set-slogan", value: "Set application slogan" },
                    { name: "/change-avatar", value: "Change bot avatar" },
                    { name: "/change-name", value: "Change bot name" },
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                  })
                  .setColor('DarkButNotBlack');
              }

              const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("help_menu")
                .setPlaceholder("Choose a command category")
                .addOptions([
                  {
                    label: "General",
                    value: "general",
                    description: "General bot commands",
                    emoji: "🌐",
                    default: interaction.values[0] === "general",
                  },
                  {
                    label: "Owner",
                    value: "owner",
                    description: "Owner-only commands",
                    emoji: "👑",
                    default: interaction.values[0] === "owner",
                  },
                ]);

              const row = new ActionRowBuilder().addComponents(selectMenu);

              await interaction.update({ embeds: [embed], components: [row] });
            }
          });


   client13.login(token)
   .catch(async(err) => {
    const filtered = apply.filter(bo => bo != data)
			await tokens.set(`apply` , filtered)
      console.log(`${clientId} Not working and removed `)
   });

  });