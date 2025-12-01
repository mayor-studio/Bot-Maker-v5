  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, ChatInputCommandInteraction, StringSelectMenuBuilder, SlashCommandBuilder, PermissionsBitField  } = require("discord.js");
const { Database } = require("st.db")
const colorDB = new Database("/Json-db/Bots/colorDB.json")
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")

const moment = require('moment-timezone');
moment.tz.setDefault('Africa/Cairo');

let color = tokens.get('color')
if(!color) return;

const path = require('path');
const { readdirSync } = require("fs");
color.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client25 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client25.commands = new Collection();
  require(`./handlers/events`)(client25);
  client25.events = new Collection();
  require(`../../events/requireBots/color-commands`)(client25);
  const rest = new REST({ version: '10' }).setToken(token);
  client25.setMaxListeners(1000)

  client25.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client25.user.id),
          { body: colorSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client25.once('ready', () => {

    client25.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`color bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client25.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`color`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client25.users.cache.get(owner) || await client25.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : بيع ألوان\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`color`, filtered);
          await client26.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`./handlers/events`)(client25)
  const folderPath = path.join(__dirname, 'slashcommand25');
  client25.colorSlashCommands = new Collection();
  const colorSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("color commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          colorSlashCommands.push(command.data.toJSON());
          client25.colorSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand25');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/color-commands`)(client25)
require("./handlers/events")(client25)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client25.once(event.name, (...args) => event.execute(...args));
	} else {
		client25.on(event.name, (...args) => event.execute(...args));
	}
	}




 client25.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.user.bot) return;

    const command = client25.colorSlashCommands.get(interaction.commandName);

    if (!command) return;

    // Owners-only check
    if (command.ownersOnly === true) {
      if (interaction.user.id !== owner) {
        return interaction.reply({
          content: `❗ ***You are not allowed to use this command***`,
          ephemeral: true,
        });
      }
    }

    // Admins-only check
    if (command.adminsOnly === true) {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      ) {
        return interaction.reply({
          content: `❗ ***You must have Administrator permission to use this command***`,
          ephemeral: true,
        });
      }
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.log("Error running command:", error);
    }
  }
});

// Color select menu
client25.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'color_select') return;

  try {
    const member = interaction.member;
    const selectedRole = interaction.guild.roles.cache.get(interaction.values[0]);

    if (!selectedRole) {
      return interaction.reply({
        content: '❌ The selected color role no longer exists.',
        ephemeral: true
      });
    }

    // Remove any existing color roles
    const existingColors = member.roles.cache.filter(role => role.name.startsWith('Color #'));
    if (existingColors.size > 0) {
      await member.roles.remove(existingColors);
    }

    // Add the selected new color role
    await member.roles.add(selectedRole);

    await interaction.reply({
      content: `✅ Your color has been changed to ${selectedRole.name}`,
      ephemeral: true
    });
  } catch (error) {
    console.error('Color selection error:', error);
    await interaction.reply({
      content: '❌ An error occurred while changing your color.',
      ephemeral: true
    });
  }
});

client25.on("interactionCreate", async (interaction) => {
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
        { name: `\`/create-colors\``, value: `Create color roles.` },
        { name: `\`/delete-colors\``, value: `Delete all color roles.` },
        { name: `\`/color-panel\``, value: `Send the color selection panel.` },
        { name: '`/change-avatar`', value: 'Change the bot avatar' },
        { name: '`/change-name`', value: 'Change the bot username' },

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



   client25.login(token)
   .catch(async(err) => {
    const filtered = color.filter(bo => bo != data)
			await tokens.set(`color` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
