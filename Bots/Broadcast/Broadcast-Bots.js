  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, Attachment, ChatInputCommandInteraction, StringSelectMenuBuilder, SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db")
const BcDB = new Database("/Json-db/Bots/BcDB.json")
const db = new Database("/Json-db/Bots/BroadcastDB")
const { PermissionsBitField } = require('discord.js')
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")



  let Bc = tokens.get('Bc')
  if(!Bc) return;

const path = require('path');
const { readdirSync } = require("fs");
let theowner;
Bc.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client2 = new Client({intents: 131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client2.commands = new Collection();
  require(`./handlers/events`)(client2);
  client2.events = new Collection();
  client2.setMaxListeners(1000)
  require(`../../events/requireBots/Broadcast-commands`)(client2);
  const rest = new REST({ version: '10' }).setToken(token);
  client2.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client2.user.id),
          { body: BcSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client2.once('ready', () => {
    client2.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`broadcast bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client2.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`Bc`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client2.users.cache.get(owner) || await client2.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : برودكاست مطور\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`Bc`, filtered);
          await client2.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`../Broadcast/handlers/events`)(client2)
    require(`../Broadcast/handlers/addToken`)(client2)
    require(`../Broadcast/handlers/sendBroadcast`)(client2)
    require(`../Broadcast/handlers/setBroadcastMessage`)(client2)

  const folderPath = path.join(__dirname, 'slashcommand2');
  client2.BcSlashCommands = new Collection();
  const BcSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("Bc commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          BcSlashCommands.push(command.data.toJSON());
          client2.BcSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand2');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/Broadcast-commands`)(client2)
require("./handlers/events")(client2)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client2.once(event.name, (...args) => event.execute(...args));
	} else {
		client2.on(event.name, (...args) => event.execute(...args));
	}
	}



client2.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith(`${prefix}obc`) || message.content.startsWith(`${prefix}bc`)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ You do not have the required permissions to use this command.');
    }

    const args = message.content.split(' ').slice(1);
    const broadcastMsg = args.join(' ');
    if (!broadcastMsg) {
      return message.reply('Please type a message after the command.');
    }

    await message.guild.members.fetch();
    let allMembers = message.guild.members.cache.filter(member => !member.user.bot);

    if (message.content.startsWith(`${prefix}obc`)) {
      allMembers = allMembers.filter(mem =>
        mem.presence?.status === 'online' ||
        mem.presence?.status === 'dnd' ||
        mem.presence?.status === 'idle' ||
        mem.presence?.activities.some(activity => activity.type === ActivityType.Streaming)
      );
    }

    allMembers = allMembers.map(mem => mem.user.id);

    const thetokens = db.get(`tokens_${message.guild.id}`) || [];
    const botsNum = thetokens.length;
    const membersPerBot = Math.floor(allMembers.length / botsNum);
    const submembers = [];
    for (let i = 0; i < allMembers.length; i += membersPerBot) {
      submembers.push(allMembers.slice(i, i + membersPerBot));
    }
    if (submembers.length > botsNum) {
      submembers.pop();
    }

    let sentCount = 0;
    let failedCount = 0;

    const embed = new EmbedBuilder()
      .setTitle('📢 Broadcast Started')
      .setColor('Aqua')
      .setDescription(`**⚫ Total members: \`${allMembers.length}\`\n🟢 Sent: \`${sentCount}\`\n🔴 Failed: \`${failedCount}\`**`);

    const msg = await message.channel.send({ embeds: [embed] });

    for (let i = 0; i < submembers.length; i++) {
      const token = thetokens[i];
      let clienter = new Client({ intents: 131071 });
      await clienter.login(token);

      submembers[i].forEach(async (sub) => {
        try {
          const user = await clienter.users.fetch(sub);
          await user.send(`${broadcastMsg}\n<@${sub}>`);
          sentCount++;
        } catch (error) {
          failedCount++;
        }

        const progressEmbed = new EmbedBuilder()
          .setTitle('📢 Broadcast Status Update')
          .setColor('Aqua')
          .setDescription(`**⚫ Total members: \`${allMembers.length}\`\n🟢 Sent: \`${sentCount}\`\n🔴 Failed: \`${failedCount}\`**`);

        await msg.edit({ embeds: [progressEmbed] });

        if (sentCount + failedCount >= allMembers.length) {
          const finalEmbed = new EmbedBuilder()
            .setTitle('✅ Broadcast Finished')
            .setColor('Green')
            .setDescription(`**⚫ Total members: \`${allMembers.length}\`\n🟢 Sent: \`${sentCount}\`\n🔴 Failed: \`${failedCount}\`**`);

          await msg.edit({ embeds: [finalEmbed] });
        }
      });
    }
  }
});


client2.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {

    if (interaction.user.bot) return;

    const command = client2.BcSlashCommands.get(interaction.commandName);

    if (!command) {
      return;
    }
    if (command.ownersOnly === true) {
      if (owner != interaction.user.id) {
        return interaction.reply({ content: `❗ ***You cannot use this command***`, ephemeral: true });
      }
    }
    if (command.adminsOnly === true) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: `❗ ***You must have Administrator permissions to use this command***`, ephemeral: true });
      }
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      // Optionally log the error here
      return;
    }
  }
});


 
 client2.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === "help_select") {
    const selected = interaction.values[0]; // the selected option value

    if (selected === "help_general") {
      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTitle('قائمة اوامر البوت')
        .addFields(
          { name: '`/help`', value: 'لعرض قائمة الاوامر' },
          { name: '`/support`', value: 'للانضمام للسيرفر الداعم' },
        )
        .setTimestamp()
        .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor('DarkButNotBlack');

      // Keep the select menu with the selected option disabled to indicate current selection
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder('اختر القسم')
        .addOptions([
          { label: 'General', description: 'General bot commands', value: 'help_general', emoji: '🌐', default: true },
          { label: 'Owner', description: 'Owner-only commands', value: 'help_owner', emoji: '👑' },
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.update({ embeds: [embed], components: [row] });
    }

    else if (selected === "help_owner") {

      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTitle('قائمة اوامر البوت')
        .addFields(
          { name: '`/send-panel`', value: 'ارسال بانل التحكم في البرودكاست' },
          { name: `\`${prefix}obc\``, value: 'لارسال رسالة للأعضاء الأونلاين' },
          { name: `\`${prefix}bc\``, value: 'ارسال رسالة للكل' },
          { name: '`/remove-token`', value: 'ازالة توكن محدد من بوتات البرودكاست' },
          { name: '`/remove-all-tokens`', value: 'ازالة جميع توكنات البرودكاست' },
          { name: '`/change-avatar`', value: 'تغيير صورة البوت' },
          { name: '`/change-name`', value: 'تغيير اسم البوت' },
        )
        .setTimestamp()
        .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor('DarkButNotBlack');

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder('اختر القسم')
        .addOptions([
          { label: 'General', description: 'General bot commands', value: 'help_general', emoji: '🌐' },
          { label: 'Owner', description: 'Owner-only commands', value: 'help_owner', emoji: '👑', default: true },
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.update({ embeds: [embed], components: [row] });
    }
  }
});








   client2.login(token)
   .catch(async(err) => {
    const filtered = Bc.filter(bo => bo != data)
			await tokens.set(`Bc` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
