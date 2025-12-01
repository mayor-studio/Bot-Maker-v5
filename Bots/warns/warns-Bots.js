const { Client, Collection, discord, GatewayIntentBits, Partials, EmbedBuilder, ApplicationCommandOptionType, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } = require("discord.js");
const { Database } = require("st.db");
const warnsDB = new Database("/Json-db/Bots/warnsDB.json");
const tokens = new Database("/tokens/tokens");
const { PermissionsBitField } = require('discord.js');
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");

let warns = tokens.get('warns');
if (!warns) return;

const path = require('path');
const { readdirSync } = require("fs");
warns.forEach(async (data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix, token, clientId, owner } = data;
  theowner = owner;
  const client50 = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent],
    shards: "auto",
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]
  });
  client50.commands = new Collection();
  require(`./handlers/events`)(client50);
  client50.events = new Collection();
  require(`../../events/requireBots/Warns-commands`)(client50);
  const rest = new REST({ version: '10' }).setToken(token);
  client50.setMaxListeners(1000);

  client50.on("ready", async () => {
    try {
      await rest.put(
        Routes.applicationCommands(client50.user.id),
        { body: warnsSlashCommands },
      );
    } catch (error) {
      console.error(error);
    }
  });

  client50.once('ready', () => {
    client50.guilds.cache.forEach(guild => {
      guild.members.fetch().then(members => {
        if (members.size < 10) {
          console.log(`warns bot : Guild: ${guild.name} has less than 10 members`);
        }
      }).catch(console.error);
    });
  });

  client50.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`warns`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client50.users.cache.get(owner) || await client50.users.fetch(owner);
          const embed = new EmbedBuilder()
            .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : تحذيرات\nالاشتراك انتهى**`)
            .setColor("DarkerGrey")
            .setTimestamp();
          await user.send({ embeds: [embed] }).catch((err) => { console.log(err) });

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`warns`, filtered);
          await client50.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });

  require(`../warns/handlers/events`)(client50);
  const folderPath = path.join(__dirname, 'slashcommand50');
  client50.warnsSlashCommands = new Collection();
  const warnsSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("warns commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
  )) {
    for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
    )) {
      let command = require(`${folderPath}/${folder}/${file}`);
      if (command) {
        warnsSlashCommands.push(command.data.toJSON());
        client50.warnsSlashCommands.set(command.data.name, command);
        if (command.data.name) {
          table.addRow(`/${command.data.name}`, "🟢 Working");
        } else {
          table.addRow(`/${command.data.name}`, "🔴 Not Working");
        }
      }
    }
  }

  const folderPath2 = path.join(__dirname, 'slashcommand50');
  for (let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
    for (let fiee of (readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
      const commander = require(`${folderPath2}/${foldeer}/${fiee}`);
    }
  }

  require(`../../events/requireBots/Warns-commands`)(client50);
  require("./handlers/events")(client50);

  for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
    const event = require(`./events/${file}`);
    if (event.once) {
      client50.once(event.name, (...args) => event.execute(...args));
    } else {
      client50.on(event.name, (...args) => event.execute(...args));
    }
  }

  client50.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
      if (interaction.user.bot) return;
      const command = client50.warnsSlashCommands.get(interaction.commandName);
      if (!command) {
        return;
      }
      if (command.ownersOnly === true) {
        if (owner != interaction.user.id) {
          return interaction.reply({ content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true });
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
  });

  client50.on("interactionCreate", async (interaction) => {
    if (interaction.customId === "help_general") {
      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTitle('قائمة اوامر البوت')
        .addFields(
          { name: `\`/check\``, value: `لفحص شخص محذر او لا` },
          { name: `\`/proves\``, value: `لرؤية ادلة التحذير` },
        )
        .setTimestamp()
        .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor('DarkButNotBlack');
      const btns = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐').setDisabled(true),
        new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Danger).setEmoji('👑')
      );
      await interaction.update({ embeds: [embed], components: [btns] });
    } else if (interaction.customId === "help_owner") {
      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTitle('قائمة اوامر البوت')
        .addFields(
          { name: `\`/select-admin-role\``, value: `لتحديد رتبة مسؤول التحذيرات` }
        )
        .setTimestamp()
        .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor('DarkButNotBlack');
      const btns = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
        new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Danger).setEmoji('👑').setDisabled(true)
      );
      await interaction.update({ embeds: [embed], components: [btns] });
    }
  });

  client50.login(token)
    .catch(async (err) => {
      const filtered = warns.filter(bo => bo != data);
      await tokens.set(`warns`, filtered);
      console.log(`${clientId} Not working and removed `);
    });
});