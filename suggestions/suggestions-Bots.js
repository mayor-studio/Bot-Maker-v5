
  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, Attachment } = require("discord.js");
const { Database } = require("st.db")
const suggestionsDB = new Database("/Json-db/Bots/suggestionsDB.json")
const tokens = new Database("/tokens/tokens")
const { PermissionsBitField } = require('discord.js')
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let suggestions = tokens.get('suggestions')
if(!suggestions) return;

const path = require('path');
const { readdirSync } = require("fs");
let theowner;
suggestions.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client12 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client12.commands = new Collection();
  require(`./handlers/events`)(client12);
  client12.events = new Collection();
  require(`../../events/requireBots/suggestions-commands`)(client12);
  const rest = new REST({ version: '10' }).setToken(token);
  client12.setMaxListeners(1000)

  client12.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client12.user.id),
          { body: suggestionsSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client12.once('ready', () => {
    client12.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`suggestions bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client12.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`suggestions`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client12.users.cache.get(owner) || await client12.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : اقتراحات\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`suggestions`, filtered);
          await client12.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`./handlers/events`)(client12)

  const folderPath = path.join(__dirname, 'slashcommand12');
  client12.suggestionsSlashCommands = new Collection();
  const suggestionsSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("suggestions commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          suggestionsSlashCommands.push(command.data.toJSON());
          client12.suggestionsSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand12');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/suggestions-commands`)(client12)
require("./handlers/events")(client12)
require("./handlers/suggest")(client12)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client12.once(event.name, (...args) => event.execute(...args));
	} else {
		client12.on(event.name, (...args) => event.execute(...args));
	}
	}


client12.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const line = suggestionsDB.get(`line_${message.guild.id}`);
  const chan = suggestionsDB.get(`suggestions_room_${message.guild.id}`);
  const suggestionMode = suggestionsDB.get(`suggestion_mode_${message.guild.id}`) || 'buttons'; // Default to buttons if not set
  const threadMode = suggestionsDB.get(`thread_mode_${message.guild.id}`) || 'enabled'; // Default to enabled if not set

  if (chan) {
    if (message.channel.id !== chan) return;
    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTimestamp()
      .setTitle(`** > ${message.content} **`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    if (suggestionMode === 'buttons') {
      const button1 = new ButtonBuilder()
        .setCustomId(`ok_button`)
        .setLabel(`0`)
        .setEmoji("✔️")
        .setStyle(ButtonStyle.Success);
      const button2 = new ButtonBuilder()
        .setCustomId(`no_button`)
        .setLabel(`0`)
        .setEmoji("✖️")
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(button1, button2);
      let send = await message.channel.send({ embeds: [embed], components: [row] }).catch(() => { return; });

      if (threadMode === 'enabled') {
        await send.startThread({
          name: `Comments - تعليقات`
        }).then(async (thread) => {
          thread.send(`** - هذا المكان مخصص لمشاركة رايك حول هذا الاقتراح : \`${message.content}\` **`);
        });
      }

      if (line) {
        await message.channel.send({ files: [line] }).catch((err) => { return; });
      }
      await suggestionsDB.set(`${send.id}_ok`, 0);
      await suggestionsDB.set(`${send.id}_no`, 0);
      return message.delete();
    } else if (suggestionMode === 'reactions') {
      let send = await message.channel.send({ embeds: [embed] }).catch(() => { return; });
      await send.react('✔️');
      await send.react('❌');

      if (threadMode === 'enabled') {
        await send.startThread({
          name: `Comments - تعليقات`
        }).then(async (thread) => {
          thread.send(`** - هذا المكان مخصص لمشاركة رايك حول هذا الاقتراح : \`${message.content}\` **`);
        });
      }

      if (line) {
        await message.channel.send({ files: [line] }).catch((err) => { return; });
      }
      return message.delete();
    }
  }
});


client12.on("interactionCreate" , async(interaction) => {
  if(interaction.customId === "help_general"){
    const embed = new EmbedBuilder()
        .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
        .setTitle('قائمة اوامر البوت')
        .addFields(
          {name : `\`/help\`` , value : `لعرض قائمة الاوامر`},
          {name : `\`/support\`` , value : `للانضمام للسيرفر الداعم`},
        )        .setTimestamp()
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
      {name : `\`/set-line\`` , value : `لتحديد خط الاقتراحات`},
      {name : `\`/set-suggestions-room\`` , value : `لتحديد روم الاقتراحات`},
      {name : `\`/suggestions-mode\`` , value : `أزرار أو رياكشنات`},
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
  client12.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client12.suggestionsSlashCommands.get(interaction.commandName);
	    
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



   client12.login(token)
   .catch(async(err) => {
    const filtered = suggestions.filter(bo => bo != data)
			await tokens.set(`suggestions` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
