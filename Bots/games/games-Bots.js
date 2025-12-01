
const { Client, Collection,ChannelType ,SlashCommandBuilder, AttachmentBuilder, GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder , ButtonStyle , Message, Embed,PermissionsBitField, ComponentType  } = require("discord.js")
const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')
const { Database } = require("st.db")
const gamesDB = new Database("/Json-db/Bots/gamesDB.json")
const tokens = new Database("/tokens/tokens")
const quiz = JSON.parse(fs.readFileSync('Bots/games/handlers/quiz.json', 'utf8'))
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let moment = require('moment');
const ms = require("ms")
const buyCooldown = new Collection()
let games = tokens.get('games')
if(!games) return;

const path = require('path');
const { readdirSync } = require("fs");
const client = require("../../index.js")
const { connect } = require("http2")
let theowner;
games.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client26 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client26.commands = new Collection();
  client26.setMaxListeners(1000)
  require(`./handlers/events.js`)(client26);
  client26.events = new Collection();
  require(`../../events/requireBots/games-commands.js`)(client26);
  const rest = new REST({ version: '10' }).setToken(token);
  client26.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client26.user.id),
          { body: gamesSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client26.once('ready', () => {
    client26.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`games bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client26.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`games`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client26.users.cache.get(owner) || await client26.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : العاب\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`games`, filtered);
          await client26.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`./handlers/events.js`)(client26)
  const folderPath = path.join(__dirname, 'slashcommand26');
  client26.gamesSlashCommands = new Collection();
  const gamesSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("games commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          gamesSlashCommands.push(command.data.toJSON());
          client26.gamesSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}

let commandsDir2 = path.join(__dirname);
client26.commands = new Collection()
const commands = [];
const table2 = new ascii('Prefix Commands').setJustify();
for (let folder of readdirSync(commandsDir2+`/slashcommand26`).filter(f => f.endsWith(`.js`))) {
	  let command = require(`${commandsDir2}/slashcommand26/${folder}`);
	  if(command) {
		commands.push(command);
  client26.commands.set(command.name, command);
		  if(command.name) {
			  table2.addRow(`${prefix}${command.name}` , '🟢 Working')
		  }
		  if(!command.name) {
			  table2.addRow(`${prefix}${command.name}` , '🔴 Not Working')
		  }
	  }
}


require(`../../events/requireBots/games-commands.js`)(client26)
require("./handlers/events.js")(client26)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client26.once(event.name, (...args) => event.execute(...args));
	} else {
		client26.on(event.name, (...args) => event.execute(...args));
	}
	}

  let gameActive = false;
  let players = [];
  let playerPoints = {};
  let currentRound = 0;
  const maxPlayers = 20; // عدد لاعبين الاقصى للانضمام
  const minPlayers = 4; // عدد لاعبين الادنى للانضمام
  const totalRounds = 15; // مجموع عدد الجولات

client26.on('messageCreate', async message => {
  const gameRoleID = await gamesDB.get(`games_role_${message.guild.id}`);  

  if ((message.content === `${prefix}faster` || message.content === `${prefix}stop`) && !message.member.roles.cache.has(gameRoleID)) {
    return message.reply('ليس لديك الإذن لاستخدام هذا الأمر.');
  }

  if (message.content === `${prefix}faster` && !gameActive) {
    try {
      gameActive = true;
      players = [];
      playerPoints = {};

      const joinButton = new ButtonBuilder()
        .setCustomId('join_bomb_game')
        .setLabel('انضم للعبة')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎮');

      const leaveButton = new ButtonBuilder()
        .setCustomId('leave_bomb_game')
        .setLabel('غادر اللعبة')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌');

      const row = new ActionRowBuilder()
        .addComponents(joinButton, leaveButton);

      let embed = new EmbedBuilder()
        .setTitle('لعبة اسرع!')
        .setDescription('انقر على الأزرار للانضمام أو مغادرة اللعبة.')
        .setColor(0x00FF00)
        .addFields({ name: 'اللاعبين', value: 'لا يوجد لاعبون بعد', inline: true })
        .setFooter({ text: 'الرجاء الانضمام خلال 30 ثانية' })
        .setThumbnail(message.guild.iconURL({ dynamic: true }));

      const gameMessage = await message.channel.send({ embeds: [embed], components: [row] });

      const filter = interaction => ['join_bomb_game', 'leave_bomb_game'].includes(interaction.customId);
      const collector = gameMessage.createMessageComponentCollector({ filter, time: 30000 });

      collector.on('collect', async interaction => {
        try {
          if (!gameActive) {
            await interaction.reply({ content: 'اللعبة قد انتهت بالفعل أو لم تبدأ بعد.', ephemeral: true });
            return;
          }
          if (interaction.customId === 'join_bomb_game') {
            if (players.length >= maxPlayers) {
              await interaction.reply({ content: `عذرًا، لا يمكن الانضمام للعبة. الحد الأقصى لعدد اللاعبين هو ${maxPlayers}.`, ephemeral: true });
              return;
            }
            if (!players.includes(interaction.user.id)) {
              players.push(interaction.user.id);
              playerPoints[interaction.user.id] = 0;
              const playerMentions = players.map(id => `<@${id}>`).join(', ');
              embed.spliceFields(0, 1, { name: 'اللاعبين', value: `${playerMentions || 'لا يوجد لاعبون بعد'}\n\nعدد اللاعبين: ${players.length}/${maxPlayers}`, inline: true });
              await gameMessage.edit({ embeds: [embed] });
              await interaction.reply({ content: `${interaction.user.tag} انضم إلى اللعبة!`, ephemeral: true });
            } else {
              await interaction.reply({ content: `أنت بالفعل في اللعبة!`, ephemeral: true });
            }
          } else if (interaction.customId === 'leave_bomb_game') {
            if (!players.includes(interaction.user.id)) {
              await interaction.reply({ content: 'أنت لست في اللعبة!', ephemeral: true });
              return;
            }
            players = players.filter(id => id !== interaction.user.id);
            delete playerPoints[interaction.user.id];
            const playerMentions = players.map(id => `<@${id}>`).join(', ');
            embed.spliceFields(0, 1, { name: 'اللاعبين', value: `${playerMentions || 'لا يوجد لاعبون بعد'}\n\nعدد اللاعبين: ${players.length}/${maxPlayers}`, inline: true });
            await gameMessage.edit({ embeds: [embed] });
            await interaction.reply({ content: `${interaction.user.tag} غادر اللعبة!`, ephemeral: true });
          }
        } catch (err) {
          console.error('Error handling join/leave interaction:', err);
          interaction.reply({ content: 'حدث خطأ أثناء معالجة الإجراء الخاص بك.', ephemeral: true });
        }
      });

      collector.on('end', async () => {
        try {
          if (players.length >= minPlayers) {
            const startEmbed = new EmbedBuilder()
              .setTitle('اللعبة ستبدأ قريباً!')
              .setDescription('ستبدأ اللعبة في 10 ثواني...')
              .setColor(0xFF0000)
              .setThumbnail(message.guild.iconURL({ dynamic: true }));

            await message.channel.send({ embeds: [startEmbed] });

            setTimeout(() => {
              try {
                startGame(message.channel);
              } catch (err) {
                console.error('Error starting game:', err);
                message.channel.send('حدث خطأ أثناء بدء اللعبة.');
              }
            }, 10000);
          } else {
            gameActive = false;
            await message.channel.send(`لم ينضم عدد كافٍ من اللاعبين إلى اللعبة. تم إلغاء اللعبة. يجب أن ينضم على الأقل ${minPlayers} لاعبين.`);
          }
        } catch (err) {
          console.error('Error ending join/leave collector:', err);
          message.channel.send('حدث خطأ أثناء إنهاء جمع التفاعلات.');
        }
      });
    } catch (err) {
      console.error('Error starting game:', err);
      message.channel.send('حدث خطأ أثناء بدء اللعبة.');
    }
  }

  if (message.content === `${prefix}stop` && !gameActive) {
    try {
      gameActive = false;
      players = [];
      playerPoints = {};
      currentRound = 0;
      await message.channel.send('تم إيقاف اللعبة.');
    } catch (err) {
      console.error('Error stopping game:', err);
      message.channel.send('حدث خطأ أثناء إيقاف اللعبة.');
    }
  }
});

async function startGame(channel) {
  try {
    if (players.length > 0) {
      currentRound = 1;
      askQuestion(channel);
    }
  } catch (err) {
    console.error('Error starting game:', err);
    channel.send('حدث خطأ أثناء بدء اللعبة.');
  }
}

async function askQuestion(channel) {
  try {
    if (currentRound > totalRounds) {
      announceWinners(channel);
      return;
    }

    const word = quiz[Math.floor(Math.random() * quiz.length)];
    const imageBuffer = await generateImage(word);

    const attachment = new AttachmentBuilder(imageBuffer, { name: 'question.png' });

    await channel.send({ files: [attachment] });

    let answered = false;
    const filter = response => players.includes(response.author.id) && response.content.toLowerCase() === word.toLowerCase();
    const collector = channel.createMessageCollector({ filter, time: 15000 });

    collector.on('collect', async response => {
      if (!answered) {
        answered = true;
        playerPoints[response.author.id]++;
        await response.reply('صحيح! حصلت على نقطة.');

        collector.stop();

        setTimeout(() => {
          currentRound++;
          askQuestion(channel);
        }, 3000);
      }
    });

    collector.on('end', async collected => {
      try {
        if (!collected.size) {
          await channel.send('انتهى الوقت ولم يجاوب أحد بشكل صحيح.');
          setTimeout(() => {
            currentRound++;
            askQuestion(channel);
          }, 3000);
        }
      } catch (err) {
        console.error('Error handling incorrect answer or timeout:', err);
        channel.send('حدث خطأ أثناء معالجة الإجابة الخاطئة أو انتهاء الوقت.');
      }
    });
  } catch (err) {
    console.error('Error asking question:', err);
    channel.send('حدث خطأ أثناء طرح السؤال.');
  }
}

async function announceWinners(channel) {
  try {
    gameActive = false;
    const sortedPlayers = Object.entries(playerPoints).sort((a, b) => b[1] - a[1]);
    const topPlayers = sortedPlayers.slice(0, 3);
    const otherPlayers = sortedPlayers.slice(3);
    const winnerMentions = topPlayers.map(([id, points], index) => `${index + 1}. <@${id}> - ${points} نقطة`).join('\n');
    const otherMentions = otherPlayers.map(([id, points]) => `<@${id}> - ${points} نقطة`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🎉 المشاركين في اللعبة! 🎉')
      .setDescription('قائمة لمشاركين في اللعبة')
      .setColor(0xFFD700)
      .setThumbnail(channel.guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '🥇 المركز الأول', value: topPlayers[0] ? `<@${topPlayers[0][0]}> - ${topPlayers[0][1]} نقطة` : 'لا يوجد', inline: true },
        { name: '🥈 المركز الثاني', value: topPlayers[1] ? `<@${topPlayers[1][0]}> - ${topPlayers[1][1]} نقطة` : 'لا يوجد', inline: true },
        { name: '🥉 المركز الثالث', value: topPlayers[2] ? `<@${topPlayers[2][0]}> - ${topPlayers[2][1]} نقطة` : 'لا يوجد', inline: true }
      )
      .addFields(
        { name: 'المشاركون الآخرون', value: otherMentions || 'لا يوجد' }
      )
      .setFooter({ text: channel.guild.name, iconURL: channel.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('Error announcing winners:', err);
    channel.send('حدث خطأ أثناء إعلان الفائزين.');
  }
}

async function generateImage(word) {
  try {
    const canvas = createCanvas(1024, 512);
    const ctx = canvas.getContext('2d');
    const background = await loadImage('Bots/games/handlers/image.png');

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(word, 330, 320);

    return canvas.toBuffer();
  } catch (err) {
    console.error('Error generating image:', err);
    throw new Error('حدث خطأ أثناء إنشاء الصورة.');
  }
}


client26.on("messageCreate", async message => {
  const gameRoleID = await gamesDB.get(`games_role_${message.guild.id}`);  

  if (!message.guild || message.author.bot) return;
  if (!gameRoleID) return;
  let args = message.content.split(" ");
  if (args[0] === prefix + "مافيا") {
    if (!message.member.roles.cache.has(gameRoleID)) return;
    require("./handlers/mafia")(message);
  } else if(args[0] === prefix + "روليت") {
    if (!message.member.roles.cache.has(gameRoleID)) return;
    require("./handlers/roulette")(message);
  }
});

const flags = [
  { name: "بنما", en: "panama", img: "https://flagcdn.com/w320/pa.png" },
  { name: "مصر", en: "egypt", img: "https://flagcdn.com/w320/eg.png" },
  { name: "العراق", en: "iraq", img: "https://flagcdn.com/w320/iq.png" },
  { name: "السعودية", en: "saudi arabia", img: "https://flagcdn.com/w320/sa.png" },
  { name: "تركيا", en: "turkey", img: "https://flagcdn.com/w320/tr.png" },
  { name: "الإمارات", en: "uae", img: "https://flagcdn.com/w320/ae.png" },
  { name: "الأردن", en: "jordan", img: "https://flagcdn.com/w320/jo.png" },
  { name: "الجزائر", en: "algeria", img: "https://flagcdn.com/w320/dz.png" },
  { name: "المغرب", en: "morocco", img: "https://flagcdn.com/w320/ma.png" },
  { name: "فلسطين", en: "palestine", img: "https://flagcdn.com/w320/ps.png" },
  { name: "تونس", en: "tunisia", img: "https://flagcdn.com/w320/tn.png" },
  { name: "سوريا", en: "syria", img: "https://flagcdn.com/w320/sy.png" },
  { name: "لبنان", en: "lebanon", img: "https://flagcdn.com/w320/lb.png" },
  { name: "اليمن", en: "yemen", img: "https://flagcdn.com/w320/ye.png" },
  { name: "الكويت", en: "kuwait", img: "https://flagcdn.com/w320/kw.png" },
  { name: "قطر", en: "qatar", img: "https://flagcdn.com/w320/qa.png" },
  { name: "عمان", en: "oman", img: "https://flagcdn.com/w320/om.png" },
  { name: "البحرين", en: "bahrain", img: "https://flagcdn.com/w320/bh.png" },
  { name: "ليبيا", en: "libya", img: "https://flagcdn.com/w320/ly.png" },
  { name: "السودان", en: "sudan", img: "https://flagcdn.com/w320/sd.png" },
  { name: "الصومال", en: "somalia", img: "https://flagcdn.com/w320/so.png" },
  { name: "موريتانيا", en: "mauritania", img: "https://flagcdn.com/w320/mr.png" },
  { name: "جيبوتي", en: "djibouti", img: "https://flagcdn.com/w320/dj.png" },
  { name: "جزر القمر", en: "comoros", img: "https://flagcdn.com/w320/km.png" },
  { name: "فرنسا", en: "france", img: "https://flagcdn.com/w320/fr.png" },
  { name: "ألمانيا", en: "germany", img: "https://flagcdn.com/w320/de.png" },
  { name: "إيطاليا", en: "italy", img: "https://flagcdn.com/w320/it.png" },
  { name: "إسبانيا", en: "spain", img: "https://flagcdn.com/w320/es.png" },
  { name: "بريطانيا", en: "uk", img: "https://flagcdn.com/w320/gb.png" },
  { name: "روسيا", en: "russia", img: "https://flagcdn.com/w320/ru.png" },
  { name: "الصين", en: "china", img: "https://flagcdn.com/w320/cn.png" },
  { name: "اليابان", en: "japan", img: "https://flagcdn.com/w320/jp.png" },
  { name: "كوريا الجنوبية", en: "south korea", img: "https://flagcdn.com/w320/kr.png" },
  { name: "الهند", en: "india", img: "https://flagcdn.com/w320/in.png" },
  { name: "باكستان", en: "pakistan", img: "https://flagcdn.com/w320/pk.png" },
  { name: "أمريكا", en: "usa", img: "https://flagcdn.com/w320/us.png" },
  { name: "كندا", en: "canada", img: "https://flagcdn.com/w320/ca.png" },
  { name: "البرازيل", en: "brazil", img: "https://flagcdn.com/w320/br.png" },
  { name: "الأرجنتين", en: "argentina", img: "https://flagcdn.com/w320/ar.png" },
  { name: "المكسيك", en: "mexico", img: "https://flagcdn.com/w320/mx.png" },
  { name: "أستراليا", en: "australia", img: "https://flagcdn.com/w320/au.png" },
  { name: "نيوزيلندا", en: "new zealand", img: "https://flagcdn.com/w320/nz.png" },
  { name: "جنوب أفريقيا", en: "south africa", img: "https://flagcdn.com/w320/za.png" },
  { name: "نيجيريا", en: "nigeria", img: "https://flagcdn.com/w320/ng.png" },
  { name: "إندونيسيا", en: "indonesia", img: "https://flagcdn.com/w320/id.png" },
  { name: "ماليزيا", en: "malaysia", img: "https://flagcdn.com/w320/my.png" },
  { name: "الفلبين", en: "philippines", img: "https://flagcdn.com/w320/ph.png" },
  { name: "تايلاند", en: "thailand", img: "https://flagcdn.com/w320/th.png" }
];

module.exports = flags;

client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;

    if (
    message.content.startsWith(`${prefix}wins`) ||
    message.content.startsWith(`${prefix}اعلام`)  ) {
    const flag = flags[Math.floor(Math.random() * flags.length)];

    const embed = new EmbedBuilder()
      .setTitle("اعلام")
      .setDescription(`**اسرع شخص يكتب اسم العلم (بالعربي أو بالانجليزي) خلال 10 ثواني!**`)
      .setColor("Random")
      .setImage(flag.img)
      .setFooter({ text: "اكتب اسم العلم الصحيح!" });

    await message.channel.send({ embeds: [embed] });

    const filter = (m) => {
      if (m.author.bot) return false;
      let answer = m.content.trim().toLowerCase();
      return answer === flag.name.toLowerCase() || answer === flag.en.toLowerCase();
    };

    const collector = message.channel.createMessageCollector({ filter, time: 15_000, max: 1 });

    collector.on('collect', (m) => {
      message.channel.send({
        content: `🎉 مبروك <@${m.author.id}> الإجابة الصحيحة!`
      });
    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        message.channel.send(`لم يجب أحد بشكل صحيح في الوقت المحدد!`);
      }
    });
  }
});
    
client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith(`${prefix}زر`)) return;

  // Create 16 buttons, each with customId b0...b15, all disabled at first
  const buttons = [];
  for (let i = 0; i < 16; i++) {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`b${i}`)
        .setLabel((i + 1).toString())
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true)
    );
  }

  // Group into 4 ActionRows (4 buttons per row)
  const rows = [];
  for (let i = 0; i < 4; i++) {
    rows.push(new ActionRowBuilder().addComponents(buttons.slice(i * 4, i * 4 + 4)));
  }

  // Send initial embed with all buttons disabled
  const embed = new EmbedBuilder()
    .setTitle("⚡ تحدي الأزرار! ⚡")
    .setDescription("بعد 10 ثواني سيتم تفعيل زر عشوائي، أول شخص يضغط عليه يفوز!")
    .setColor("Random");

  const sentMsg = await message.channel.send({ embeds: [embed], components: rows });

  // Wait 10 seconds
  setTimeout(async () => {
    // Choose random button to enable
    const winnerIndex = Math.floor(Math.random() * 16);
    for (let i = 0; i < 16; i++) {
      buttons[i].setDisabled(i !== winnerIndex);
    }
    // Update rows with only one enabled button
    for (let i = 0; i < 4; i++) {
      rows[i] = new ActionRowBuilder().addComponents(buttons.slice(i * 4, i * 4 + 4));
    }
    await sentMsg.edit({ embeds: [embed.setDescription("اضغط الزر الصحيح بسرعة! أول شخص يضغط يفوز 🎉")], components: rows });

    // Set up collector for 10s or until pressed
    const collector = sentMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 10000 });

    let winner = false;
    collector.on('collect', async (i) => {
      if (i.customId === `b${winnerIndex}`) {
        winner = true;
        collector.stop();
        // Disable all buttons after win
        for (let btn of buttons) btn.setDisabled(true);
        for (let j = 0; j < 4; j++) {
          rows[j] = new ActionRowBuilder().addComponents(buttons.slice(j * 4, j * 4 + 4));
        }
        await i.update({ embeds: [embed.setDescription(`🏆 مبروك <@${i.user.id}> فاز باللعبة!`)], components: rows });
      } else {
        await i.reply({ content: "❌ هذا ليس الزر الصحيح! حاول مرة أخرى إذا أمكن.", ephemeral: true });
      }
    });

    collector.on('end', async () => {
      if (!winner) {
        // Disable all buttons if no one won
        for (let btn of buttons) btn.setDisabled(true);
        for (let j = 0; j < 4; j++) {
          rows[j] = new ActionRowBuilder().addComponents(buttons.slice(j * 4, j * 4 + 4));
        }
        await sentMsg.edit({ embeds: [embed.setDescription("⏱️ انتهى الوقت! لم يضغط أحد الزر الصحيح.")], components: rows });
      }
    });
  }, 10000);
});
    
    const words = [
  "قطة","كلب","تفاحة","موز","سيارة","منزل","حاسوب","هاتف","كتاب","باب","ماء","موسيقى","قمر","شمس","نجمة","شجرة","زهرة","نهر","جبل","بحر",
  "طائر","سمكة","سحابة","مطر","ثلج","ريح","نار","أرض","سماء","طريق","شارع","مدرسة","صديق","لعبة","حب","ابتسامة","ضحك","حلم","نوم","عمل",
  "طعام","شراب","فيلم","أغنية","رقص","نور","ظلام","سعيد","حزين","سريع","بطيء","كبير","صغير","حار","بارد","قديم","جديد","قوي","ضعيف",
  "سهل","صعب","عالٍ","منخفض","طويل","قصير","غني","فقير","نظيف","متسخ","مبكر","متأخر","مفتوح","مغلق","يسار","يمين","فوق","تحت","داخل","خارج",
  "فوز","خسارة","بداية","نهاية","أعلى","أسفل","شمال","جنوب","شرق","غرب","أحمر","أزرق","أخضر","أصفر","أسود","أبيض","برتقالي","بنفسجي","وردي","بني",
  "ذهب","فضة","رمادي","دائرة","مربع","مثلث","قلب","ملك","ملكة","ولد","بنت","رجل","امرأة","طفل","رضيع","عائلة","فريق","مجموعة","جمع","صوت",
  "هدوء","سلام","حرب","شجار","جري","مشي","قفز","طيران","قيادة","ركوب","طبخ","خبز","قراءة","كتابة","رسم","تلوين","بناء","قطع","كسر",
  "إصلاح","دفع","سحب","إمساك","رمي","إسقاط","إيجاد","إخفاء","شراء","بيع","دفع","تكلفة","توفير","صرف","إرسال","إحضار","أخذ","إعطاء",
  "اتصال","لقاء","حديث","استماع","رؤية","مشاهدة","نظر","إحساس","لمس","تذوق","شم","تحريك","بقاء","تغيير","نمو","سقوط","ارتفاع","تغطية",
  "كشف","انضمام","مغادرة","دخول","خروج","اختيار","انتقاء","تخطيط","أمل","تمني","محاولة","حاجة","رغبة","إعجاب","كره","حب","حقد"
];
module.exports = words;

client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(`${prefix}اسرع`)) return;

  const word = words[Math.floor(Math.random() * words.length)];

  // إعداد صورة شفافة وكتابة الكلمة باللون الأبيض
  const fontSize = 60;
  const padding = 40;

  // نحدد العرض حسب طول الكلمة
  const canvas = createCanvas(20 + word.length * fontSize, fontSize + padding * 2);
  const ctx = canvas.getContext('2d');

  // بدون خلفية (شفافة)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF'; // أبيض

  // رسم النص في وسط الصورة
  ctx.fillText(word, canvas.width / 2, canvas.height / 2);

  const buffer = canvas.toBuffer('image/png');
  const attachment = new AttachmentBuilder(buffer, { name: 'word.png' });

  const embed = new EmbedBuilder()
    .setTitle("⏱️ أسرع واحد!")
    .setDescription(`أول شخص يكتب الكلمة كما في الصورة خلال 10 ثواني يفوز!`)
    .setColor("Random")
    .setImage('attachment://word.png')
    .setFooter({ text: "MAYOR STUDIO" });

  await message.channel.send({ embeds: [embed], files: [attachment] });

  const filter = (m) => !m.author.bot && m.content.trim() === word;
  const collector = message.channel.createMessageCollector({ filter, time: 10000, max: 1 });

  collector.on('collect', m => {
    message.channel.send(`🎉 مبروك <@${m.author.id}>! كنت الأسرع في كتابة الكلمة **${word}**`);
  });

  collector.on('end', collected => {
    if (collected.size === 0) {
      message.channel.send(`انتهى الوقت! لم يكتب أحد الكلمة الصحيحة. الكلمة كانت: **${word}**`);
    }
  });
});
    
    // +80 color names in Arabic and hex codes
const colors = [
  { name: "أحمر", hex: "#FF0000" },
  { name: "أزرق", hex: "#0000FF" },
  { name: "أخضر", hex: "#008000" },
  { name: "أصفر", hex: "#FFFF00" },
  { name: "برتقالي", hex: "#FFA500" },
  { name: "بنفسجي", hex: "#800080" },
  { name: "وردي", hex: "#FFC0CB" },
  { name: "أسود", hex: "#000000" },
  { name: "أبيض", hex: "#FFFFFF" },
  { name: "رمادي", hex: "#808080" },
  { name: "بني", hex: "#A52A2A" },
  { name: "ذهبي", hex: "#FFD700" },
  { name: "فضي", hex: "#C0C0C0" },
  { name: "سماوي", hex: "#87CEEB" },
  { name: "تركواز", hex: "#40E0D0" },
  { name: "فيروزي", hex: "#00FFFF" },
  { name: "ليموني", hex: "#00FF00" },
  { name: "خاكي", hex: "#F0E68C" },
  { name: "عنابي", hex: "#800000" },
  { name: "كحلي", hex: "#000080" },
  { name: "برونزي", hex: "#CD7F32" },
  { name: "أخضر زيتوني", hex: "#808000" },
  { name: "برغندي", hex: "#800020" },
  { name: "أخضر فاتح", hex: "#90EE90" },
  { name: "أزرق فاتح", hex: "#ADD8E6" },
  { name: "أصفر فاتح", hex: "#FFFFE0" },
  { name: "وردي فاتح", hex: "#FFB6C1" },
  { name: "بنفسجي فاتح", hex: "#E6E6FA" },
  { name: "أحمر غامق", hex: "#8B0000" },
  { name: "أزرق غامق", hex: "#00008B" },
  { name: "أخضر غامق", hex: "#006400" },
  { name: "رمادي فاتح", hex: "#D3D3D3" },
  { name: "رمادي غامق", hex: "#A9A9A9" },
  { name: "أخضر نعناعي", hex: "#98FF98" },
  { name: "فيروزي غامق", hex: "#00CED1" },
  { name: "أزرق سماوي", hex: "#007FFF" },
  { name: "أخضر زمردي", hex: "#50C878" },
  { name: "بنفسجي ملكي", hex: "#7851A9" },
  { name: "أخضر فسفوري", hex: "#7FFF00" },
  { name: "أزرق ياقوتي", hex: "#0F52BA" },
  { name: "أخضر غامق جداً", hex: "#228B22" },
  { name: "أصفر خردلي", hex: "#FFDB58" },
  { name: "أحمر ياقوتي", hex: "#E0115F" },
  { name: "أزرق كهربائي", hex: "#7DF9FF" },
  { name: "وردي فاقع", hex: "#FF69B4" },
  { name: "أرجواني", hex: "#FF00FF" },
  { name: "أزرق نيلي", hex: "#4B0082" },
  { name: "أخضر مائل للأزرق", hex: "#008080" },
  { name: "بني فاتح", hex: "#D2B48C" },
  { name: "عاجي", hex: "#FFFFF0" },
  { name: "خردلي", hex: "#8A9A5B" },
  { name: "مرجاني", hex: "#FF7F50" },
  { name: "أصفر كريمي", hex: "#FFFDD0" },
  { name: "أزرق تركوازي", hex: "#00FFFF" },
  { name: "أخضر ليموني", hex: "#32CD32" },
  { name: "كموني", hex: "#FFBF00" },
  { name: "كستنائي", hex: "#954535" },
  { name: "نحاسي", hex: "#B87333" },
  { name: "أزرق بحري", hex: "#006994" },
  { name: "أخضر عشبي", hex: "#7CFC00" },
  { name: "وردي باهت", hex: "#FF007F" },
  { name: "أصفر ذهبي", hex: "#DAA520" },
  { name: "كريمي", hex: "#F5F5DC" },
  { name: "بنفسجي غامق", hex: "#9400D3" },
  { name: "أحمر فاقع", hex: "#FF2400" },
  { name: "أزرق ملكي", hex: "#4169E1" },
  { name: "أخضر ليموني فاتح", hex: "#98FB98" },
  { name: "أزرق ثلجي", hex: "#99FFFF" },
  { name: "بنفسجي وردي", hex: "#DA70D6" },
  { name: "أزرق بترولي", hex: "#003366" },
  { name: "أزرق مخضر", hex: "#4682B4" },
  { name: "أخضر ريحاني", hex: "#B2FF66" },
  { name: "أحمر خوخي", hex: "#FF6666" },
  { name: "أزرق تركوازي غامق", hex: "#008B8B" },
  { name: "أخضر زمردي فاتح", hex: "#00FA9A" },
  { name: "بني شوكولاتة", hex: "#D2691E" },
  { name: "بيج", hex: "#F5F5DC" },
  { name: "أزرق سماوي فاتح", hex: "#B0E0E6" },
  { name: "أخضر تفاحي", hex: "#8DB600" },
  { name: "أحمر كرزي", hex: "#DE3163" },
  { name: "عنابي غامق", hex: "#4B0101" },
  { name: "أزرق تركواز", hex: "#30D5C8" },
  { name: "أزرق داكن", hex: "#191970" },
  { name: "رمادي مائل للأزرق", hex: "#6699CC" },
  { name: "أحمر طوبي", hex: "#B22222" }
];

 client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(`${prefix}الوان`)) return;

  // Pick a random color as the answer
  const correctColor = colors[Math.floor(Math.random() * colors.length)];

  // Pick 4 more distinct colors as wrong choices
  let choices = [correctColor];
  while (choices.length < 5) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    if (!choices.some(c => c.hex === color.hex)) choices.push(color);
  }

  choices = choices.sort(() => Math.random() - 0.5);

  let buttons = choices.map((color) =>
    new ButtonBuilder()
      .setCustomId(`color_${color.hex}`)
      .setLabel(color.name)
      .setStyle(ButtonStyle.Secondary)
  );

  const row = new ActionRowBuilder().addComponents(buttons);

  const colorImage = `https://singlecolorimage.com/get/${correctColor.hex.replace("#", "")}/400x150`;

  const embed = new EmbedBuilder()
    .setTitle("اختر لون الصورة بسرعة!")
    .setDescription("لديك 10 ثواني فقط. اضغط الزر الصحيح للفوز.")
    .setImage(colorImage)
    .setColor(correctColor.hex);

  const sent = await message.channel.send({ embeds: [embed], components: [row] });

  // Button collector for 10s
  const collector = sent.createMessageComponentCollector({ componentType: ComponentType.Button, time: 10000 });

  let finished = false;
  collector.on('collect', async interaction => {
    if (finished) return;
    finished = true;

    // Mark correct button as green, others as disabled
    buttons = choices.map((color) =>
      new ButtonBuilder()
        .setCustomId(`color_${color.hex}`)
        .setLabel(color.name)
        .setStyle(
          color.hex === correctColor.hex
            ? ButtonStyle.Success
            : ButtonStyle.Secondary
        )
        .setDisabled(true)
    );
    const row2 = new ActionRowBuilder().addComponents(buttons);

    if (interaction.customId === `color_${correctColor.hex}`) {
      await interaction.update({
        embeds: [embed.setDescription(`🏆 مبروك <@${interaction.user.id}>! الإجابة الصحيحة: ${correctColor.name}`)],
        components: [row2]
      });
    } else {
      await interaction.update({
        embeds: [embed.setDescription(`❌ خسرت! اللون الصحيح كان: ${correctColor.name}`)],
        components: [row2]
      });
    }
    collector.stop();
  });

  collector.on('end', async () => {
    if (!finished) {
      // Disable all buttons if no winner
      buttons = choices.map((color) =>
        new ButtonBuilder()
          .setCustomId(`color_${color.hex}`)
          .setLabel(color.name)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
      const row2 = new ActionRowBuilder().addComponents(buttons);
      await sent.edit({
        embeds: [embed.setDescription("⏱️ انتهى الوقت! لم يضغط أحد الزر الصحيح.")],
        components: [row2]
      });
    }
  });
});
    
const emojis = [
  "😀", "😂", "😍", "😎", "😜", "😡", "😭", "🤔", "😱",
  "🥶", "🥳", "🤓", "😴", "😇", "🥺", "😏", "🤩", "😤",
  "😅", "🥲", "🤠", "🤡", "👻", "👽", "😺", "😻", "🙈"
];

// أمر: !ايموجي
client26.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix + "ايموجي")) return;

  // اختيار 9 إيموجيات عشوائية (بدون تكرار)
  let chosenEmojis = [];
  while (chosenEmojis.length < 9) {
    let em = emojis[Math.floor(Math.random() * emojis.length)];
    if (!chosenEmojis.includes(em)) chosenEmojis.push(em);
  }

  // اختيار واحد عشوائي ليكون الهدف
  const targetEmoji = chosenEmojis[Math.floor(Math.random() * 9)];

  // إنشاء الأزرار (كل 3 في صف)
  function createRowsWithEmojis(emojisArr, styleArr = null, disabled = false) {
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const row = new ActionRowBuilder();
      for (let j = 0; j < 3; j++) {
        const idx = i * 3 + j;
        row.addComponents(
          new ButtonBuilder()
            .setCustomId("emoji_" + idx)
            .setLabel(emojisArr[idx])
            .setStyle(styleArr ? styleArr[idx] : ButtonStyle.Secondary)
            .setDisabled(disabled)
        );
      }
      rows.push(row);
    }
    return rows;
  }

  // رسالة التعليمات
  const embed = new EmbedBuilder()
    .setTitle("🔎 لعبة الإيموجي!")
    .setDescription(`احفظ أماكن الإيموجيات جيداً خلال 10 ثواني!`)
    .setColor("Random");

  // أرسل الرسالة مع الأزرار
  const sent = await message.channel.send({ embeds: [embed], components: createRowsWithEmojis(chosenEmojis) });

  // بعد 10 ثواني: إخفاء الإيموجيات من الأزرار
  setTimeout(async () => {
    // أزرار مخفية (❔)
    const hideRows = createRowsWithEmojis(Array(9).fill("❔"));

    // أرسل رسالة "أي إيموجي عليك إيجاده؟"
    const chooseEmbed = new EmbedBuilder()
      .setTitle("👀 ابحث عن الإيموجي المطلوب!")
      .setDescription(`اضغط على مكان الإيموجي التالي بسرعة: **${targetEmoji}**`)
      .setColor("Random");

    await sent.edit({ embeds: [chooseEmbed], components: hideRows });

    // انتظار الضغطات
    const filter = i => i.isButton() && i.message.id === sent.id;
    const collector = sent.createMessageComponentCollector({ filter, time: 10000 });

    let answered = false;

    collector.on("collect", async interaction => {
      const idx = parseInt(interaction.customId.split("_")[1]);
      const pressed = chosenEmojis[idx];

      // أزرار تظهر الإيموجيات الأصلية مع تلوين الصحيح بالأخضر
      let styleArr = Array(9).fill(ButtonStyle.Secondary);
      if (pressed === targetEmoji) {
        styleArr[idx] = ButtonStyle.Success;
        answered = true;
        await interaction.reply({ content: `🎉 أحسنت! وجدت الإيموجي الصحيح: ${targetEmoji}`, ephemeral: true });
        await sent.edit({ components: createRowsWithEmojis(chosenEmojis, styleArr, true) });
        collector.stop();
      } else {
        await interaction.reply({ content: `❌ هذا ليس الإيموجي الصحيح!`, ephemeral: true });
      }
    });

    collector.on("end", async collected => {
      if (!answered) {
        // أزرار تظهر الإيموجيات الأصلية مع تلوين الصحيح بالأحمر
        let styleArr = Array(9).fill(ButtonStyle.Secondary);
        let correctIdx = chosenEmojis.indexOf(targetEmoji);
        if (correctIdx !== -1) styleArr[correctIdx] = ButtonStyle.Danger;
        await sent.edit({ components: createRowsWithEmojis(chosenEmojis, styleArr, true) });
        message.channel.send(`⏱️ انتهى الوقت! الإيموجي الصحيح كان: **${targetEmoji}**`);
      }
    });

  }, 10000);
});
    
    
    
const games = {};

client26.on('messageCreate', async message => {
  if (message.author.bot) return;
  const gameRoleID = await gamesDB.get(`games_role_${message.guild.id}`);

  // صلاحية اللعب
  if (
    message.content === `${prefix}xo` &&
    !message.member.roles.cache.has(gameRoleID)
  ) {
    return message.reply('ليس لديك الإذن لاستخدام هذا الأمر.');
  }

  // فتح غرفة اللعبة
  if (message.content === `${prefix}xo` && !games[message.channel.id]) {
    let joined = [];
    let gameStarted = false;
    const maxPlayers = 15;
    const minPlayers = 4;

    const joinBtn = new ButtonBuilder()
      .setCustomId('xo_join')
      .setLabel('انضم')
      .setEmoji('➕')
      .setStyle(ButtonStyle.Success);

    const leaveBtn = new ButtonBuilder()
      .setCustomId('xo_leave')
      .setLabel('انسحب')
      .setEmoji('➖')
      .setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRowBuilder().addComponents(joinBtn, leaveBtn);

    const embed = new EmbedBuilder()
      .setTitle("لعبة XO الجماعية 🕹️")
      .setDescription(
        "اضغط على **انضم** للمشاركة (الحد الأدنى: 2، الحد الأقصى: 20)\n" +
        `سيبدأ اللعب تلقائيًا بعد 30 ثانية.\n\n` +
        "المنضمون:\n" +
        "لا يوجد لاعبين بعد."
      )
      .setColor("Random")
      .setFooter({ text: "MAYOR STUDIO" });

    const msg = await message.channel.send({ embeds: [embed], components: [actionRow] });

    games[message.channel.id] = {
      joined,
      gameStarted,
      msg,
      channel: message.channel
    };

    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600_000 });

    collector.on('collect', async interaction => {
      if (interaction.customId === "xo_join") {
        if (games[message.channel.id].gameStarted) {
          await interaction.reply({ content: "اللعبة بدأت بالفعل!", ephemeral: true });
          return;
        }
        if (joined.find(u => u.id === interaction.user.id)) {
          await interaction.reply({ content: "أنت بالفعل ضمن المنضمين!", ephemeral: true });
          return;
        }
        if (joined.length >= maxPlayers) {
          await interaction.reply({ content: "تم الوصول للحد الأقصى من المشاركين (20).", ephemeral: true });
          return;
        }
        joined.push({ id: interaction.user.id, tag: interaction.user.tag });
        await interaction.update({
          embeds: [embed.setDescription(
            "اضغط على **انضم** للمشاركة (الحد الأدنى: 2، الحد الأقصى: 20)\n" +
            `سيبدأ اللعب تلقائيًا بعد 30 ثانية.\n\n` +
            "المنضمون:\n" +
            joined.map((u, i) => `${i + 1}. <@${u.id}>`).join('\n') +
            `\n\nعدد المنضمين: **${joined.length}**`
          )],
          components: [actionRow]
        });
      }
      if (interaction.customId === "xo_leave") {
        const idx = joined.findIndex(u => u.id === interaction.user.id);
        if (idx === -1) {
          await interaction.reply({ content: "أنت لست ضمن المنضمين!", ephemeral: true });
          return;
        }
        joined.splice(idx, 1);
        await interaction.update({
          embeds: [embed.setDescription(
            "اضغط على **انضم** للمشاركة (الحد الأدنى: 2، الحد الأقصى: 20)\n" +
            `سيبدأ اللعب تلقائيًا بعد 30 ثانية.\n\n` +
            "المنضمون:\n" +
            (joined.length ? joined.map((u, i) => `${i + 1}. <@${u.id}>`).join('\n') : "لا يوجد لاعبين بعد.") +
            `\n\nعدد المنضمين: **${joined.length}**`
          )],
          components: [actionRow]
        });
      }
    });

    // بدء اللعبة تلقائيًا بعد 30 ثانية
    setTimeout(async () => {
      // Check if game already started or deleted
      if (!games[message.channel.id] || games[message.channel.id].gameStarted) return;

      if (joined.length < minPlayers) {
        delete games[message.channel.id];
        msg.edit({
          embeds: [embed.setDescription("🕒 انتهى الوقت ولم يبدأ اللعب لعدم توفر عدد كافٍ من اللاعبين. أعد استخدام الأمر لبدء لعبة جديدة.")],
          components: []
        });
        return;
      }

      games[message.channel.id].gameStarted = true;
      const players = joined.slice();

      // Helper: رسم اللوحة
      function renderBoard(board) {
        return board.map(row =>
          row.map(cell => cell || '⬜').join(' ')
        ).join('\n');
      }

      // مباراة بين لاعبين
      async function playMatch(player1, player2, isFinalReplay = false) {
        let turn = 0;
        let board = [
          [null, null, null],
          [null, null, null],
          [null, null, null]
        ];
        let winner = null;
        let tie = false;
        let moves = 0;
        let playing = [player1, player2];
        let marks = ['❌', '⭕'];

        function getBoardButtons() {
          return [0, 1, 2].map(row =>
            new ActionRowBuilder().addComponents(
              [0, 1, 2].map(col => {
                const cell = board[row][col];
                return new ButtonBuilder()
                  .setCustomId(`cell_${row}_${col}`)
                  .setLabel(cell || '⬜')
                  .setStyle(
                    cell === '❌' ? ButtonStyle.Danger :
                    cell === '⭕' ? ButtonStyle.Primary :
                    ButtonStyle.Secondary
                  )
                  .setDisabled(!!cell || winner || tie);
              })
            )
          );
        }

        let matchMsg = await games[message.channel.id].channel.send({
          content: `❌ <@${playing[0].id}> ضد ⭕ <@${playing[1].id}>${isFinalReplay ? "\nهذه إعادة النهائي بسبب تعادل سابق! إذا تكرر التعادل، سيخسر كلاكما." : ""}\nالدور: <@${playing[turn].id}>`,
          embeds: [
            new EmbedBuilder()
              .setTitle('لوحة XO')
              .setDescription(renderBoard(board))
              .setColor("Random")
          ],
          components: getBoardButtons()
        });

        const matchCollector = matchMsg.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 120_000
        });

        matchCollector.on('collect', async (interaction) => {
          if (interaction.user.id !== playing[turn].id) {
            await interaction.reply({ content: "ليس دورك!", ephemeral: true });
            return;
          }
          const [ , row, col ] = interaction.customId.split('_').map(Number);
          if (board[row][col]) {
            await interaction.reply({ content: "المربع مشغول!", ephemeral: true });
            return;
          }
          board[row][col] = marks[turn];
          moves++;

          // Check win
          const lines = [
            [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
            [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
            [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]],
          ];
          for (const line of lines) {
            const [a,b,c] = line;
            if (board[a[0]][a[1]] && board[a[0]][a[1]] === board[b[0]][b[1]] && board[a[0]][a[1]] === board[c[0]][c[1]]) {
              winner = turn;
              break;
            }
          }
          if (winner === null && moves === 9) tie = true;

          turn = 1 - turn;

          await interaction.update({
            content: `❌ <@${playing[0].id}> ضد ⭕ <@${playing[1].id}>${isFinalReplay ? "\nهذه إعادة النهائي بسبب تعادل سابق! إذا تكرر التعادل، سيخسر كلاكما." : ""}${winner || tie ? "" : `\nالدور: <@${playing[turn].id}>`}`,
            embeds: [
              new EmbedBuilder()
                .setTitle('لوحة XO')
                .setDescription(renderBoard(board))
                .setColor("Random")
            ],
            components: getBoardButtons()
          });

          if (winner !== null || tie) matchCollector.stop();
        });

        return await new Promise(resolve => {
          matchCollector.on('end', async () => {
            await matchMsg.edit({ components: getBoardButtons().map(row => row.setComponents(row.components.map(b => b.setDisabled(true)))) });
            if (winner !== null) {
              await games[message.channel.id].channel.send(`🥇 الفائز في هذه المباراة: <@${playing[winner].id}>`);
              resolve({ winner: playing[winner], loser: playing[1 - winner] });
            } else if (tie) {
              await games[message.channel.id].channel.send(`⚖️ تعادل بين <@${playing[0].id}> و <@${playing[1].id}>!${isFinalReplay ? " تم تكرار التعادل - كلاكما خسر!" : ""}`);
              resolve({ tie: true });
            } else {
              await games[message.channel.id].channel.send(`انتهى الوقت لهذه المباراة! لم يفز أحد.`);
              resolve({ tie: true });
            }
          });
        });
      }

      async function tournament(players) {
        let roundPlayers = players.slice();
        let lastRoundTie = false;
        while (roundPlayers.length > 1) {
          await games[message.channel.id].channel.send(`🔄 بدء الجولة | عدد اللاعبين: **${roundPlayers.length}**`);
          let nextRound = [];
          let i = 0;
          while (i < roundPlayers.length) {
            if (i + 1 >= roundPlayers.length) {
              await games[message.channel.id].channel.send(`🚶 <@${roundPlayers[i].id}> يتأهل تلقائياً للجولة القادمة.`);
              nextRound.push(roundPlayers[i]);
              i++;
            } else {
              let matchResult = await playMatch(roundPlayers[i], roundPlayers[i+1], lastRoundTie && roundPlayers.length === 2);
              if (matchResult.winner) {
                nextRound.push(matchResult.winner);
                lastRoundTie = false;
              } else if (matchResult.tie && roundPlayers.length === 2) {
                if (lastRoundTie) {
                  await games[message.channel.id].channel.send(`😢 تم تكرار التعادل في النهائي، كلا اللاعبين خسر!`);
                  nextRound = [];
                } else {
                  await games[message.channel.id].channel.send(`🔁 تعادل في النهائي. ستُعاد الجولة مرة أخرى!`);
                  lastRoundTie = true;
                  break;
                }
              } else if (matchResult.tie) {
                await games[message.channel.id].channel.send(`😢 كلا اللاعبين خسروا بسبب التعادل.`);
              }
              i += 2;
            }
          }
          if (lastRoundTie && roundPlayers.length === 2) { continue; }
          roundPlayers = nextRound;
        }
        if (roundPlayers.length === 1) {
          await games[message.channel.id].channel.send(`🏆 الفائز في البطولة: <@${roundPlayers[0].id}>! مبروك!`);
        } else if (roundPlayers.length === 0) {
          await games[message.channel.id].channel.send(`😢 لم يفز أحد في البطولة.`);
        }
        delete games[message.channel.id];
      }

      await tournament(players);
    }, 30_000);

    collector.on('end', () => {
      if (!games[message.channel.id] || games[message.channel.id].gameStarted) return;
      delete games[message.channel.id];
      msg.edit({
        embeds: [embed.setDescription("🕒 انتهى الوقت ولم تبدأ اللعبة. أعد استخدام الأمر لبدء لعبة جديدة.")],
        components: []
      });
    });
  }
});
    
  let rpcActive = false;
let rpcPlayers = [];
let rpcPlayerChoices = {};
let rpcCurrentRound = 0;
let rpcMessage;
let rpcMinPlayers = 4;
let rpcMaxPlayers = 15;
let rpcLobbyTimeout = null;

client26.on('messageCreate', async message => {
  if (message.author.bot) return;
  const gameRoleID = await gamesDB.get(`games_role_${message.guild.id}`);

  // Permission check
  if (
    (message.content === `${prefix}rpc` || message.content === `${prefix}startrpc`) &&
    !message.member.roles.cache.has(gameRoleID)
  ) {
    return message.reply('ليس لديك الإذن لاستخدام هذا الأمر.');
  }

  // Open lobby
  if (message.content === `${prefix}rpc` && !rpcActive) {
    rpcActive = true;
    rpcPlayers = [];
    rpcPlayerChoices = {};
    rpcCurrentRound = 1;

    // The enabled join/leave buttons
    const joinBtn = new ButtonBuilder()
      .setCustomId('rpc_join')
      .setLabel('انضم')
      .setEmoji('🤝')
      .setStyle(ButtonStyle.Success)
      .setDisabled(false);

    const leaveBtn = new ButtonBuilder()
      .setCustomId('rpc_leave')
      .setLabel('انسحب')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(false);

    const actionRow = new ActionRowBuilder().addComponents(joinBtn, leaveBtn);

    const embed = new EmbedBuilder()
      .setTitle("لعبة حجر ورقة مقص الجماعية ✋🪨✂️")
      .setDescription(
        "انقر على **انضم** للمشاركة (الحد الأدنى: 2، الحد الأقصى: 20)\n" +
        `ستبدأ اللعبة تلقائياً بعد 30 ثانية.\n\n` +
        "المنضمون:\n" +
        "لا يوجد لاعبين بعد."
      )
      .setColor("Random")
      .setFooter({ text: "يمكنك الانسحاب في أي وقت قبل بدء اللعب." });

    rpcMessage = await message.channel.send({ embeds: [embed], components: [actionRow] });

    // Collector for join/leave (remains enabled for 30s)
    const collector = rpcMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30_000 });

    collector.on('collect', async interaction => {
      if (interaction.customId === "rpc_join") {
        if (rpcPlayers.find(u => u.id === interaction.user.id)) {
          await interaction.reply({ content: "أنت بالفعل ضمن المنضمين!", ephemeral: true });
          return;
        }
        if (rpcPlayers.length >= rpcMaxPlayers) {
          await interaction.reply({ content: "تم الوصول للحد الأقصى من المشاركين (20).", ephemeral: true });
          return;
        }
        rpcPlayers.push({ id: interaction.user.id, tag: interaction.user.tag });
        await interaction.update({
          embeds: [embed.setDescription(
            "انقر على **انضم** للمشاركة (الحد الأدنى: 2، الحد الأقصى: 20)\n" +
            `ستبدأ اللعبة تلقائياً بعد 30 ثانية.\n\n` +
            "المنضمون:\n" +
            rpcPlayers.map((u, i) => `${i + 1}. <@${u.id}>`).join('\n') +
            `\n\nعدد المنضمين: **${rpcPlayers.length}**`
          )],
          components: [actionRow]
        });
      }
      if (interaction.customId === "rpc_leave") {
        const idx = rpcPlayers.findIndex(u => u.id === interaction.user.id);
        if (idx === -1) {
          await interaction.reply({ content: "أنت لست ضمن المنضمين!", ephemeral: true });
          return;
        }
        rpcPlayers.splice(idx, 1);
        await interaction.update({
          embeds: [embed.setDescription(
            "انقر على **انضم** للمشاركة (الحد الأدنى: 2، الحد الأقصى: 20)\n" +
            `ستبدأ اللعبة تلقائياً بعد 30 ثانية.\n\n` +
            "المنضمون:\n" +
            (rpcPlayers.length ? rpcPlayers.map((u, i) => `${i + 1}. <@${u.id}>`).join('\n') : "لا يوجد لاعبين بعد.") +
            `\n\nعدد المنضمين: **${rpcPlayers.length}**`
          )],
          components: [actionRow]
        });
      }
    });

    // After 30s, disable join/leave buttons and start (or cancel) the game
    collector.on('end', async () => {
      // Create new row with both buttons disabled
      const disabledJoinBtn = ButtonBuilder.from(joinBtn).setDisabled(true);
      const disabledLeaveBtn = ButtonBuilder.from(leaveBtn).setDisabled(true);
      const disabledRow = new ActionRowBuilder().addComponents(disabledJoinBtn, disabledLeaveBtn);

      if (rpcPlayers.length < rpcMinPlayers) {
        rpcActive = false;
        await message.channel.send(`❌ لم ينضم عدد كافٍ من اللاعبين إلى اللعبة. تم إلغاء اللعبة. يجب أن ينضم على الأقل ${rpcMinPlayers} لاعبين.`);
        if (rpcMessage) await rpcMessage.edit({ components: [disabledRow] });
        return;
      }

      await message.channel.send({ embeds: [new EmbedBuilder().setTitle('اللعبة ستبدأ الآن!').setColor(0xFF0000)] });
      if (rpcMessage) await rpcMessage.edit({ components: [disabledRow] });
      await startRPCTournament(message, disabledRow);
    });

    return;
  }

  // Manual start (optional, but disables join/leave immediately if used)
  if (message.content === `${prefix}startrpc` && rpcActive && rpcPlayers.length >= rpcMinPlayers) {
    if (rpcLobbyTimeout) clearTimeout(rpcLobbyTimeout);
    // Build disabled row
    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('rpc_join').setLabel('انضم').setEmoji('🤝').setStyle(ButtonStyle.Success).setDisabled(true),
      new ButtonBuilder().setCustomId('rpc_leave').setLabel('انسحب').setEmoji('❌').setStyle(ButtonStyle.Danger).setDisabled(true)
    );
    if (rpcMessage) await rpcMessage.edit({ components: [disabledRow] });
    await startRPCTournament(message, disabledRow);
  }
});


// ============ TOURNAMENT LOGIC ============
async function startRPCTournament(message, disabledRow) {
  let players = [...rpcPlayers];
  async function playMatch(p1, p2, isFinalReplay = false) {
    const choices = [
      { label: "🪨 حجر", val: "rock" },
      { label: "✋ ورقة", val: "paper" },
      { label: "✂️ مقص", val: "scissors" }
    ];
    let chosen = {};
    // 3 Buttons in one row, user can pick only one
    const row = new ActionRowBuilder().addComponents(
      choices.map(c =>
        new ButtonBuilder()
          .setCustomId(`rpc_${c.val}_${p1.id}_${p2.id}`)
          .setLabel(c.label)
          .setStyle(ButtonStyle.Primary)
      )
    );

    // Send to channel (not DM)
    const gameMsg = await message.channel.send({
      content: `🎮 <@${p1.id}> ضد <@${p2.id}> (اختر حجر/ورقة/مقص عبر الأزرار بالأسفل)\n*فقط هذين العضوين يمكنهم الضغط!*`,
      components: [row]
    });

    // Only allow each user to pick one, and only those two can interact
    const filterP = i =>
      (i.user.id === p1.id || i.user.id === p2.id) &&
      i.customId.startsWith('rpc_') &&
      !chosen[i.user.id];
    const collector = gameMsg.createMessageComponentCollector({ filter: filterP, max: 2, time: 30_000 });

    collector.on('collect', async i => {
      chosen[i.user.id] = i.customId.split('_')[1];
      await i.reply({ content: `✅ تم اختيارك (${choices.find(a=>a.val===chosen[i.user.id]).label})! انتظر الخصم...`, ephemeral: true });
    });

    // Wait for both, or timeout
    await new Promise(resolve => collector.on('end', resolve));

    // Disable buttons after round
    await gameMsg.edit({ components: [new ActionRowBuilder().addComponents(
      choices.map(c =>
        new ButtonBuilder()
          .setCustomId(`rpc_${c.val}_${p1.id}_${p2.id}`)
          .setLabel(c.label)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
      )
    )]});

    let result, winUser, loseUser;
    let p1Choice = chosen[p1.id], p2Choice = chosen[p2.id];
    // Kick members who do not choose in time
    let kicked = [];
    if (!p1Choice) kicked.push(p1);
    if (!p2Choice) kicked.push(p2);
    if (kicked.length) {
      for (const kickedUser of kicked) {
        let idx = rpcPlayers.findIndex(u => u.id === kickedUser.id);
        if (idx !== -1) rpcPlayers.splice(idx, 1);
      }
      let names = kicked.map(u => `<@${u.id}>`).join(', ');
      await message.channel.send(`⏰ تم طرد ${names} من اللعبة لعدم اختيارهم في الوقت المحدد.`);
      return { kicked: kicked.map(u => u.id) };
    }
    if (p1Choice === p2Choice) {
      await message.channel.send(`⚖️ تعادل بين <@${p1.id}> و <@${p2.id}>!${isFinalReplay ? " تم تكرار التعادل - كلاكما خسر!" : ""}`);
      return { tie: true };
    } else if (
      (p1Choice === "rock" && p2Choice === "scissors") ||
      (p1Choice === "scissors" && p2Choice === "paper") ||
      (p1Choice === "paper" && p2Choice === "rock")
    ) {
      await message.channel.send(`🥇 الفائز: <@${p1.id}> ضد <@${p2.id}>!`);
      return { winner: p1, loser: p2 };
    } else {
      await message.channel.send(`🥇 الفائز: <@${p2.id}> ضد <@${p1.id}>!`);
      return { winner: p2, loser: p1 };
    }
  }

  // البطولة الكاملة
  let roundPlayers = players.slice();
  let lastRoundTie = false;
  let round = 1;
  while (roundPlayers.length > 1) {
    await message.channel.send(`🔄 بدء الجولة ${round} | عدد اللاعبين: **${roundPlayers.length}**`);
    let nextRound = [];
    let i = 0;
    while (i < roundPlayers.length) {
      if (i + 1 >= roundPlayers.length) {
        await message.channel.send(`🚶 <@${roundPlayers[i].id}> يتأهل تلقائياً للجولة القادمة.`);
        nextRound.push(roundPlayers[i]);
        i++;
      } else {
        let matchResult = await playMatch(roundPlayers[i], roundPlayers[i+1], lastRoundTie && roundPlayers.length === 2);
        // Handle kicked
        if (matchResult?.kicked) {
          // Do nothing, don't add kicked to next round
        } else if (matchResult?.winner) {
          nextRound.push(matchResult.winner);
          lastRoundTie = false;
        } else if (matchResult?.tie && roundPlayers.length === 2) {
          if (lastRoundTie) {
            await message.channel.send(`😢 تم تكرار التعادل في النهائي، كلا اللاعبين خسر!`);
            nextRound = [];
          } else {
            await message.channel.send(`🔁 تعادل في النهائي. ستُعاد الجولة مرة أخرى!`);
            lastRoundTie = true;
            break;
          }
        } else if (matchResult?.tie) {
          await message.channel.send(`😢 كلا اللاعبين خسروا بسبب التعادل.`);
        }
        i += 2;
      }
    }
    if (lastRoundTie && roundPlayers.length === 2) { continue; }
    roundPlayers = nextRound;
    round++;
  }
  if (roundPlayers.length === 1) {
    await message.channel.send(`🏆 الفائز في البطولة: <@${roundPlayers[0].id}>! مبروك!`);
  } else if (roundPlayers.length === 0) {
    await message.channel.send(`😢 لم يفز أحد في البطولة.`);
  }
  rpcActive = false;
  rpcPlayers = [];
  rpcPlayerChoices = {};
  rpcCurrentRound = 0;
  rpcLobbyTimeout = null;
}
    
    const tweetQuestions = [
  "ما هو أكثر شيء يجعلك سعيدًا في يومك؟",
  "لو ربحت مليون دولار، ما أول شيء ستفعله؟",
  "ما هو هدفك الأكبر في الحياة؟",
  "ما هو أجمل كتاب قرأته مؤخرًا؟",
  "لو استطعت السفر لأي مكان في العالم الآن، أين ستذهب؟",
  "ما هي عادتك اليومية المفضلة؟",
  "من هو الشخص الذي تلجأ إليه عند الحزن؟",
  "ما هو أكثر موقف محرج تعرضت له؟",
  "ما هي كلمتك المفضلة؟",
  "لو كان بإمكانك مقابلة شخصية مشهورة، من تختار؟",
  "ما هو أجمل شيء حدث لك هذا الأسبوع؟",
  "ما هي موهبتك الخفية؟",
  "ما هو أكثر شيء تفتقده حاليًا؟",
  "لو كنت تملك آلة الزمن، إلى أي زمن ستذهب؟",
  "ما هو أكثر شيء تخشاه؟",
  "ما هي هوايتك المفضلة؟",
  "ما هو أكثر طبق تحبه؟",
  "ما هو أكثر فيلم أثر فيك؟",
  "ما هو طموحك المستقبلي؟",
  "ما هو أكثر موقف مضحك حدث لك؟",
  "ما هو أجمل مكان زرته في حياتك؟",
  "ما هو أفضل قرار اتخذته؟",
  "ما هو أكثر شيء تحب فعله في وقت فراغك؟",
  "لو بإمكانك تغيير شيء واحد في العالم، ماذا ستغير؟",
  "ما هي أفضل نصيحة تلقيتها؟",
  "ما هو أكثر شيء تفتخر به؟",
  "ما هو أكثر شيء يجذبك في الآخرين؟",
  "لو أتيح لك يوم كامل بلا أي التزامات، ماذا ستفعل؟",
  "ما هي أكثر صفة تحبها في نفسك؟",
  "من هو مثلك الأعلى؟",
  "ما هو لونك المفضل ولماذا؟",
  "لو كان لديك ثلاث أمنيات، ماذا ستتمنى؟",
  "ما هو أكثر يوم لا يُنسى في حياتك؟",
  "ما هو أكثر شيء يجعلك تضحك؟",
  "ما هو الشيء الذي لا تستطيع العيش بدونه؟",
  "ما هو أكثر شيء تتمنى تحقيقه هذه السنة؟",
  "ما هو أكثر شيء ندمت عليه؟",
  "ما هي الكلمة التي ترددها كثيرًا؟",
  "ما هو أغرب حلم حلمت به؟",
  "ما هو أجمل صوت سمعته؟",
  "ما هو أكثر شيء تحب فعله مع أصدقائك؟",
  "ما هو أكثر طعام تكرهه؟",
  "ما هو أكثر موقف تعلمت منه؟",
  "ما هو الشيء الذي يجعلك تشعر بالراحة؟",
  "لو استطعت تغيير اسمك، ماذا ستختار؟",
  "ما هو أغرب موقف حدث لك في المدرسة؟",
  "ما هي أكثر عادة سيئة تريد التخلص منها؟",
  "ما هو أكثر شيء تحبه في عائلتك؟",
  "ما هو أكثر تطبيق تستخدمه في هاتفك؟",
  "ما هو أكثر مكان ترغب في زيارته؟",
  "ما هو أكثر شيء تفتخر به في بلدك؟",
  "ما هو أكثر قرار صعب اتخذته؟",
  "لو كان بإمكانك امتلاك قوة خارقة، ماذا ستختار؟",
  "ما هو أكثر شيء تحب أن تتعلمه؟",
  "ما هو أكثر شيء تكرهه في الشتاء؟",
  "ما هو أكثر شيء تحبه في الصيف؟",
  "ما هو أكثر مشروب تحبه؟",
  "ما هو أكثر شيء يزعجك في الآخرين؟",
  "لو كان بإمكانك العيش في أي عصر، أي عصر ستختار؟",
  "ما هو أكثر شيء تخاف أن تفقده؟",
  "ما هو أكثر شيء تحبه في نفسك؟",
  "ما هو أكثر موقف أضحكك في طفولتك؟",
  "ما هو أكثر مكان تعتبره ملاذك الآمن؟",
  "ما هو أكثر شيء تحب القيام به عندما تكون وحدك؟",
  "ما هو أكثر سؤال يربكك؟",
  "لو كان بإمكانك تغيير شيء في مظهرك، ماذا ستغير؟",
  "ما هو أكثر شيء يريحك بعد يوم طويل؟",
  "ما هو أكثر فيلم شاهدته مرات عديدة؟",
  "ما هو أكثر شيء يجعلك تشعر بالفخر؟",
  "لو كان بإمكانك مقابلة نفسك قبل عشر سنوات، ماذا ستقول لها؟",
  "ما هو أكثر موقف جعلك تشعر بالخجل؟",
  "ما هي أكثر أغنية تعبر عن حالتك الآن؟",
  "ما هو أكثر حيوان تحبه؟",
  "ما هو أكثر درس تعلمته من الحياة؟",
  "ما هو أكثر شيء تتحمس له في المستقبل؟",
  "ما هو أكثر حلم تتمنى تحقيقه؟",
  "ما هو أكثر لون تفضله في الملابس؟",
  "ما هو أكثر شيء يجعلك تبتسم دون سبب؟",
  "ما هو أكثر شيء تحب الحديث عنه؟",
  "ما هو أكثر مكان ترغب في زيارته مع أصدقائك؟",
  "ما هو أكثر موقف أثر فيك؟",
  "ما هو أكثر شيء تندم على ضياعه؟",
  "ما هو أكثر شيء تحب سماعه من الآخرين؟",
  "ما هو أكثر نشاط تفضل القيام به في الإجازة؟",
  "ما هو أكثر قرار غير مجرى حياتك؟",
  "ما هو أكثر شيء تحبه في طفولتك؟",
  "ما هو أكثر شيء تتمنى تغييره في مجتمعك؟",
  "ما هو أكثر شخصية تاريخية تعجبك؟",
  "ما هو أكثر شيء تراه في أحلامك؟",
  "ما هو أكثر عادة جيدة لديك؟",
  "ما هو أكثر شيء يجعلك تشعر بالحنين؟",
  "ما هو أكثر موقف غريب واجهته؟",
  "ما هو أكثر وقت تفضل الاستيقاظ فيه؟",
  "ما هو أكثر شيء تتمنى لو كان بيدك الآن؟",
  "ما هو أكثر شيء تفتقده من الماضي؟",
  "ما هو أكثر شيء يجعلك تشعر بالامتنان؟",
  "ما هو أكثر قرار اتخذته بسرعة؟",
  "ما هو أكثر شيء تحب أن تبدأ به يومك؟",
  "ما هو أكثر شيء يجعلك تتوتر؟",
  "ما هو أكثر شيء تحب قراءته؟",
  "ما هو أكثر شيء تحب العمل عليه حاليًا؟",
  "ما هو أكثر أصدقاء الطفولة تأثيرًا في حياتك؟",
  "ما هو أكثر برنامج تلفزيوني تفضله؟",
  "ما هو أكثر شيء جعلك تبتسم اليوم؟",
  "ما هو أكثر مادة دراسية أحببتها؟",
  "ما هو أكثر مكان تحب تناول الطعام فيه؟",
  "ما هو أكثر نصيحة تقدمها للجميع؟",
  "ما هو أكثر شيء يجعلك فخورًا بنفسك؟",
  "ما هو أكثر شيء تتمنى تحقيقه مع نهاية هذا الشهر؟",
  "ما هو أكثر مكان تشعر فيه بالسلام؟",
  "ما هو أكثر موقف شجاع قمت به؟",
  "ما هو أكثر شيء تحب تحقيقه في حياتك المهنية؟",
  "ما هو أكثر كتاب أثر فيك؟",
  "ما هو أكثر مكان تذهب إليه عند الشعور بالحزن؟",
  "ما هو أكثر موقف لا تنساه في الجامعة/المدرسة؟",
  "ما هو أكثر شيء تندم على عدم فعله؟",
  "ما هو أكثر شيء يجعلك تغير رأيك؟",
  "ما هو أكثر مشروب تفضله في الصباح؟",
  "ما هو أكثر شيء تحب التحدث عنه مع أصدقائك؟",
  "ما هو أكثر شيء تعلمته من تجربة صعبة؟",
  "ما هو أكثر شيء تحب أن تراه في الطبيعة؟",
  "ما هو أكثر فيلم تنتظر مشاهدته؟",
  "ما هو أكثر موقف غيّر شخصيتك؟",
  "ما هو أكثر شيء تخاف من فقدانه؟",
  "ما هو أكثر شيء يجعلك تشعر بالحماس؟",
  "ما هو أكثر معلم أثر فيك؟",
  "ما هو أكثر مكان تحب قضاء الإجازة فيه؟",
  "ما هو أكثر شيء تحب مشاركته مع الآخرين؟",
  "ما هو أكثر شيء يجعلك تشعر بالراحة النفسية؟",
  "ما هو أكثر شيء تتمنى أن تتعلمه؟",
  "ما هو أكثر موقف كان صعبًا عليك وتجاوزته؟",
  "ما هو أكثر شيء تحب أن تغيره في نفسك؟",
  "ما هو أكثر يوم في الأسبوع تحبه؟",
  "ما هو أكثر شخص تفكر فيه دائمًا؟",
  "ما هو أكثر موقف جعلك تبكي؟",
  "ما هو أكثر هواية مارستها وما زلت تحبها؟",
  "ما هو أكثر شيء يجعلك تضحك من قلبك؟",
  "ما هو أكثر شيء تفتقده في طفولتك؟",
  "ما هو أكثر موقف جعلك تشعر بالفخر بعائلتك؟",
  "ما هو أكثر شيء تراه ضروريًا في الصداقة؟",
  "ما هو أكثر قرار اتخذته وندمت عليه؟",
  "ما هو أكثر شيء تتمنى أن يحدث لك قريبًا؟",
  "ما هو أكثر شخص تثق به؟",
  "ما هو أكثر شيء تحب سماعه من والديك؟",
  "ما هو أكثر أغنية تذكرك بذكريات جميلة؟",
  "ما هو أكثر موقف كوميدي حدث لك مع أصدقائك؟",
  "ما هو أكثر شيء تتمنى تغييره في مدينتك؟",
  "ما هو أكثر شيء تحب فعله في وقت متأخر من الليل؟",
  "ما هو أكثر شيء يجعلك تشعر بالرضا عن نفسك؟",
  "ما هو أكثر كتاب تنصح الجميع بقراءته؟",
  "ما هو أكثر شيء تعلمته من عائلتك؟",
  "ما هو أكثر شيء يميزك عن غيرك؟",
  "ما هو أكثر شيء تحب جمعه؟",
  "ما هو أكثر أكلة لا تستطيع مقاومتها؟",
  "ما هو أكثر شيء يجعلك تشعر بالقوة؟",
  "ما هو أكثر موقف شعرت فيه بالضعف؟",
  "ما هو أكثر شيء تتمنى أن تجربه؟",
  "ما هو أكثر شخص تلجأ له حين تحتاج للنصيحة؟",
  "ما هو أكثر شيء يجعلك تشعر بالفخر بعائلتك؟",
  "ما هو أكثر شيء تحب أن تتعلمه من جديد؟",
  "ما هو أكثر عادة اكتسبتها مؤخرًا؟",
  "ما هو أكثر شيء تندم على إنفاق المال عليه؟",
  "ما هو أكثر شيء تفتقده في أيام الدراسة؟",
  "ما هو أكثر شيء يجعلك تندم؟",
  "ما هو أكثر موقف شعرت فيه بالسعادة الغامرة؟",
  "ما هو أكثر شيء تحلم بتحقيقه في المستقبل؟",
  "ما هو أكثر لون ترتديه عادة؟",
  "ما هو أكثر كلمة تعبر عنك؟",
  "ما هو أكثر شيء تحب فعله مع عائلتك؟",
  "ما هو أكثر شيء يجعلك تشعر بالطمأنينة؟",
  "ما هو أكثر موقف كسر قلبك؟",
  "ما هو أكثر شيء تتمنى إصلاحه في حياتك؟",
  "ما هو أكثر شيء تفتخر به في أصدقائك؟",
  "ما هو أكثر موقف غيّر نظرتك للحياة؟",
  "ما هو أكثر شيء تتمنى أن يحدث اليوم؟",
  "ما هو أكثر عادة تريد أن تبدأ بها؟",
  "ما هو أكثر شيء يجعلك تغضب بسرعة؟",
  "ما هو أكثر شيء يجعلك تهدأ بسرعة؟",
  "ما هو أكثر شيء تحب سماعه عن نفسك؟",
  "ما هو أكثر شيء تحب أن تعمله في العطل الرسمية؟",
  "ما هو أكثر موقف جعلك تعيد التفكير في حياتك؟",
  "ما هو أكثر تحدي تخشى مواجهته؟",
  "ما هو أكثر شيء تتمنى لو عرفت عنه أكثر؟",
  "ما هو أكثر شيء تحب الحديث عنه مع الغرباء؟",
  "ما هو أكثر شيء يذكرك بالطفولة؟",
  "ما هو أكثر شيء تفتخر بتحقيقه؟",
  "ما هو أكثر موقف تعلمت منه الصبر؟",
  "ما هو أكثر شيء يجعلك تستعيد نشاطك؟",
  "ما هو أكثر شيء تحب الاحتفاظ به للأبد؟",
  "ما هو أكثر شيء تحب أن تفعله عندما تشعر بالملل؟",
  "ما هو أكثر شيء تتمنى أن لا ينتهي أبدًا؟",
  "ما هو أكثر موقف تتمنى أن تعيشه مرة أخرى؟",
  "ما هو أكثر شيء جعلك تغير رأيك في شخص؟",
  "ما هو أكثر موقف جعلك تكتشف معنى الصداقة الحقيقي؟",
  "ما هو أكثر شيء تتمنى أن تتقنه؟",
  "ما هو أكثر شيء يجعلك تشعر بالغيرة؟",
  "ما هو أكثر شيء ترغب في تطويره في نفسك؟",
  "ما هو أكثر شيء يثير فضولك؟",
  "ما هو أكثر موقف جعلك تشعر بالذنب؟",
  "ما هو أكثر شيء تحب تذكره دائمًا؟",
  "ما هو أكثر فعل نبيل قمت به مؤخرًا؟",
  "ما هو أكثر شخص يدعمك دائمًا؟",
  "ما هو أكثر شيء يجعلك تشعر بالأمل؟",
  "ما هو أكثر موقف جعلك تعتذر فيه؟",
  "ما هو أكثر شيء تحب أن تراه في الناس؟",
  "ما هو أكثر مكان تشعر فيه أنك على طبيعتك؟"
];

client26.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith(`${prefix}كت`)) {
    const args = message.content.slice(`${prefix}كت`.length).trim();
    if (args) {
      // Split into 280-char chunks like tweets
      const chunks = [];
      let text = args;
      while (text.length > 0) {
        chunks.push(text.slice(0, 280));
        text = text.slice(280);
      }
      for (let i = 0; i < chunks.length; i++) {
        await message.channel.send(`تغريدة ${i + 1}:\n${chunks[i]}`);
      }
      return;
    }

    // Random tweet question as bold in image (white text, transparent background)
    const randomQuestion = tweetQuestions[Math.floor(Math.random() * tweetQuestions.length)];

    const fontSize = 40;
    const padding = 40;
    const fontFamily = 'Arial'; // يمكنك تسجيل خط مخصص بـ registerFont إذا أردت

    const tempCanvas = createCanvas(1, 1);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `bold ${fontSize}px ${fontFamily}`;
    const metrics = tempCtx.measureText(randomQuestion);
    const width = Math.ceil(metrics.width + padding * 2);
    const height = fontSize + padding * 2;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff'; // أبيض

    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 3;

    ctx.fillText(randomQuestion, width / 2, height / 2);

    const buffer = canvas.toBuffer('image/png');
    const imgAttachment = new AttachmentBuilder(buffer, { name: 'tweet.png' });

    // Thumbnail: صورة سيرفر الديسكورد
    const guildIcon = message.guild?.iconURL({ dynamic: true, size: 128 }) || undefined;

    const embed = new EmbedBuilder()
      .setImage('attachment://tweet.png')
      .setAuthor({
        name: message.author.globalName || message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setThumbnail(guildIcon)
      .setFooter({
        text: message.guild?.name || "",
        iconURL: guildIcon
      });

    await message.channel.send({ embeds: [embed], files: [imgAttachment] });
  }
});
    
    
// قائمة الدول والعواصم وكود الدولة (ISO 3166-1 alpha-2)
const capitalsList = [
  { country: "مصر", capital: "القاهرة", iso: "eg" },
  { country: "السعودية", capital: "الرياض", iso: "sa" },
  { country: "فرنسا", capital: "باريس", iso: "fr" },
  { country: "ألمانيا", capital: "برلين", iso: "de" },
  { country: "إيطاليا", capital: "روما", iso: "it" },
  { country: "إسبانيا", capital: "مدريد", iso: "es" },
  { country: "تركيا", capital: "أنقرة", iso: "tr" },
  { country: "العراق", capital: "بغداد", iso: "iq" },
  { country: "الأردن", capital: "عمان", iso: "jo" },
  { country: "سوريا", capital: "دمشق", iso: "sy" },
  { country: "لبنان", capital: "بيروت", iso: "lb" },
  { country: "تونس", capital: "تونس", iso: "tn" },
  { country: "الجزائر", capital: "الجزائر", iso: "dz" },
  { country: "المغرب", capital: "الرباط", iso: "ma" },
  { country: "ليبيا", capital: "طرابلس", iso: "ly" },
  { country: "السودان", capital: "الخرطوم", iso: "sd" },
  { country: "اليمن", capital: "صنعاء", iso: "ye" },
  { country: "الإمارات", capital: "أبوظبي", iso: "ae" },
  { country: "قطر", capital: "الدوحة", iso: "qa" },
  { country: "الكويت", capital: "الكويت", iso: "kw" },
  { country: "البحرين", capital: "المنامة", iso: "bh" },
  { country: "عمان", capital: "مسقط", iso: "om" },
  { country: "فلسطين", capital: "القدس", iso: "ps" },
  { country: "روسيا", capital: "موسكو", iso: "ru" },
  { country: "أوكرانيا", capital: "كييف", iso: "ua" },
  { country: "الصين", capital: "بكين", iso: "cn" },
  { country: "اليابان", capital: "طوكيو", iso: "jp" },
  { country: "كوريا الجنوبية", capital: "سيول", iso: "kr" },
  { country: "الهند", capital: "نيودلهي", iso: "in" },
  { country: "باكستان", capital: "إسلام آباد", iso: "pk" },
  { country: "الولايات المتحدة", capital: "واشنطن", iso: "us" },
  { country: "كندا", capital: "أوتاوا", iso: "ca" },
  { country: "البرازيل", capital: "برازيليا", iso: "br" },
  { country: "الأرجنتين", capital: "بوينس آيرس", iso: "ar" },
  { country: "المكسيك", capital: "مكسيكو سيتي", iso: "mx" },
  { country: "نيجيريا", capital: "أبوجا", iso: "ng" },
  { country: "جنوب أفريقيا", capital: "بريتوريا", iso: "za" },
  { country: "كينيا", capital: "نيروبي", iso: "ke" },
  { country: "إثيوبيا", capital: "أديس أبابا", iso: "et" },
  { country: "أستراليا", capital: "كانبيرا", iso: "au" },
  { country: "نيوزيلندا", capital: "ولينغتون", iso: "nz" },
  { country: "السويد", capital: "ستوكهولم", iso: "se" },
  { country: "النرويج", capital: "أوسلو", iso: "no" },
  { country: "الدنمارك", capital: "كوبنهاغن", iso: "dk" },
  { country: "فنلندا", capital: "هلسنكي", iso: "fi" },
  { country: "هولندا", capital: "أمستردام", iso: "nl" },
  { country: "بلجيكا", capital: "بروكسل", iso: "be" },
  { country: "سويسرا", capital: "برن", iso: "ch" },
  { country: "النمسا", capital: "فيينا", iso: "at" },
  { country: "اليونان", capital: "أثينا", iso: "gr" },
  { country: "البرتغال", capital: "لشبونة", iso: "pt" },
  { country: "بولندا", capital: "وارسو", iso: "pl" },
  { country: "تشيكيا", capital: "براغ", iso: "cz" },
  { country: "رومانيا", capital: "بوخارست", iso: "ro" },
  { country: "بلغاريا", capital: "صوفيا", iso: "bg" },
  { country: "المجر", capital: "بودابست", iso: "hu" },
  { country: "كرواتيا", capital: "زغرب", iso: "hr" },
  { country: "صربيا", capital: "بلغراد", iso: "rs" },
  { country: "سلوفينيا", capital: "ليوبليانا", iso: "si" },
  { country: "سلوفاكيا", capital: "براتيسلافا", iso: "sk" },
  { country: "إستونيا", capital: "تالين", iso: "ee" },
  { country: "لاتفيا", capital: "ريغا", iso: "lv" },
  { country: "ليتوانيا", capital: "فيلنيوس", iso: "lt" },
  { country: "آيسلندا", capital: "ريكيافيك", iso: "is" },
  { country: "سنغافورة", capital: "سنغافورة", iso: "sg" },
  { country: "ماليزيا", capital: "كوالالمبور", iso: "my" },
  { country: "إندونيسيا", capital: "جاكرتا", iso: "id" },
  { country: "تايلاند", capital: "بانكوك", iso: "th" },
  { country: "فيتنام", capital: "هانوي", iso: "vn" },
  { country: "الفلبين", capital: "مانيلا", iso: "ph" },
  { country: "سريلانكا", capital: "كولومبو", iso: "lk" },
  { country: "بنغلاديش", capital: "دكا", iso: "bd" },
  { country: "إيران", capital: "طهران", iso: "ir" },
  { country: "أفغانستان", capital: "كابل", iso: "af" }
  // يمكنك إضافة المزيد إذا رغبت
];

const activeCapitals = new Map();

client26.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith(`${prefix}عواصم`)) {
    if (activeCapitals.has(message.channel.id)) {
      return message.reply("يوجد سؤال عواصم نشط في هذه القناة بالفعل! انتظر انتهاء الجولة.");
    }

    // اختيار عشوائي
    const countryData = capitalsList[Math.floor(Math.random() * capitalsList.length)];
    const correctCapital = countryData.capital.replace(/\s/g, "").toLowerCase();
    // صورة العلم png
    const flagUrl = `https://flagcdn.com/w320/${countryData.iso}.png`;

    // إرسال السؤال (العلم فقط في الصورة)
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle("❓ ما هي عاصمة هذا البلد؟")
      .setImage(flagUrl)
      .setDescription(`أول من يرسل اسم العاصمة الصحيحة يفوز!`)
      .setFooter({ text: "لديك 10 ثواني فقط للإجابة 🔔" });

    await message.channel.send({ embeds: [embed] });

    activeCapitals.set(message.channel.id, true);

    const filter = m => !m.author.bot;
    const collector = message.channel.createMessageCollector({ filter, time: 10000 });

    let winner = null;
    collector.on('collect', m => {
      if (m.author.bot) return;
      if (m.content.replace(/\s/g, "").toLowerCase() === correctCapital) {
        winner = m.author;
        collector.stop("answered");
      }
    });

    collector.on('end', async (collected, reason) => {
      activeCapitals.delete(message.channel.id);
      if (reason === "answered" && winner) {
        await message.channel.send(`🎉 مبروك <@${winner.id}>! الإجابة الصحيحة هي: **${countryData.capital}**`);
      } else {
        await message.channel.send(`⏰ انتهى الوقت! الإجابة الصحيحة كانت: **${countryData.capital}**`);
      }
    });
  }
});
    
    

// Utility to get a random integer in range
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random math question
function getRandomMathQuestion() {
  const ops = [
    { op: '+', fn: (a, b) => a + b },
    { op: '-', fn: (a, b) => a - b },
    { op: '*', fn: (a, b) => a * b },
    { op: '/', fn: (a, b) => Math.floor(a / b) }
  ];
  const op = ops[getRandomInt(0, ops.length - 1)];
  let a, b;
  if (op.op === '/') {
    b = getRandomInt(1, 12);
    const result = getRandomInt(1, 12);
    a = b * result;
  } else if (op.op === '*') {
    a = getRandomInt(2, 12);
    b = getRandomInt(2, 12);
  } else {
    a = getRandomInt(1, 99);
    b = getRandomInt(1, 99);
  }
  return { a, b, op: op.op, answer: op.fn(a, b) };
}

// Draw the math question with a transparent canvas and white color for numbers
function drawMathCanvas({ a, b, op }) {
  const text = `${a} ${op} ${b} = ?`;
  let fontSize = 64;
  const width = 350;
  const height = 120;

  // Dynamic font size if the text is too long
  const canvasTest = createCanvas(width, height);
  const ctxTest = canvasTest.getContext('2d');
  ctxTest.font = `bold ${fontSize}px Arial`;
  // Reduce font size until fits
  while (ctxTest.measureText(text).width > width - 24 && fontSize > 20) {
    fontSize -= 4;
    ctxTest.font = `bold ${fontSize}px Arial`;
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  // Transparent background
  ctx.clearRect(0, 0, width, height);
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = "#fff"; // White color for numbers
  ctx.shadowColor = 'rgba(0,0,0,0.20)';
  ctx.shadowBlur = 7;
  ctx.fillText(text, width / 2, height / 2);

  return canvas.toBuffer('image/png');
}

// Main message handler
client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Prefix command for math
  if (message.content.startsWith(prefix + "math") || message.content.startsWith(prefix + "رياضيات")) {
    const question = getRandomMathQuestion();
    const buffer = drawMathCanvas(question);
    await message.channel.send({
      content: "حل المسألة الرياضية خلال 10 ثواني:",
      files: [{ attachment: buffer, name: 'math.png' }]
    });

    // Collect answer for 10 seconds
    const filter = m => !m.author.bot && m.content.trim() === question.answer.toString();
    const collector = message.channel.createMessageCollector({ filter, time: 10000, max: 1 });

    collector.on('collect', m => {
      message.channel.send(`🎉 مبروك <@${m.author.id}>! الإجابة الصحيحة هي: **${question.answer}**`);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.channel.send(`⏱️ انتهى الوقت! لم يجب أحد بشكل صحيح. الإجابة كانت: **${question.answer}**`);
      }
    });
  }
});
    
const fkk = [
"مستقبل","كمبيوتر","برمجة","مكتبة","سيارة","كتاب","مدرسة","جامعة","هاتف","مفتاح",
"مطار","مكتب","قلم","ورقة","شاشة","نافذة","باب","كرسي","طاولة","مدينة",
"طبيب","مهندس","معلم","طالب","دقيقة","ساعة","طائرة","قطار","خبز","ماء",
"شمس","قمر","نجم","سماء","بحر","نهر","جبل","صحراء","وردة","شجرة",
"حديقة","طريق","شارع","بناية","بيت","مزرعة","دجاجة","سيجارة","حقيبة","دراجة",
"ثلاجة","حليب","سكر","قهوة","شاي","حساء","فطور","غداء","عشاء","فيلم",
"صورة","لوحة","موسيقى","كهرباء","حاسوب","شبكة","إنترنت","برج","قط","كلب",
"حصان","جمل","سمك","عصفور","دجاج","بطة","تفاحة","موز","عنب","برتقال",
"ليمون","تمر","خوخ","رمان","بطيخ","فراولة","كمثرى","تين","زيتون","جزر",
"بطاطا","بصل","ثوم","نعناع","بقدونس","جوافة","كيوي","مانجو","أناناس","ملفوف",
"خس","فلفل","خيار","فجل","قرنبيط","سبانخ"
];

// Function to split Arabic word into its letters (disassembled version)
function disassembleWord(word) {
  return word.split('').join(' ');
}

// Draw the complete word as an image (transparent background, white text)
function drawWordImage(word) {
  const fontSize = 64;
  const padding = 40;
  const text = word;

  // Estimate width
  const canvas = createCanvas(400, 120);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold ${fontSize}px Cairo, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = "#fff";
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = 7;
  ctx.direction = 'rtl';

  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toBuffer('image/png');
}

client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Prefix command: !فكك
  if (message.content.startsWith(prefix + "فكك")) {
    const word = fkk[Math.floor(Math.random() * fkk.length)];
    const buffer = drawWordImage(word);

    const attachment = new AttachmentBuilder(buffer, { name: 'word.png' });

    const embed = new EmbedBuilder()
      .setTitle("🔤 فكك الكلمة!")
      .setDescription(`قم بتفكيك الكلمة العربية الظاهرة في الصورة وأرسلها بسرعة (بحيث يكون بين كل حرف مسافة واحدة)! لديك 10 ثواني.`)
      .setColor("Random")
      .setImage('attachment://word.png')
      .setFooter({ text: "MAYOR STUDIO" });

    await message.channel.send({ embeds: [embed], files: [attachment] });

    // Listen for the correct answer (disassembled version)
    const answer = disassembleWord(word).replace(/\s+/g, ' ').trim();
    const filter = m =>
      !m.author.bot &&
      m.content.replace(/\s+/g, ' ').trim() === answer;

    const collector = message.channel.createMessageCollector({ filter, time: 10000, max: 1 });

    collector.on('collect', m => {
      message.channel.send(`🎉 مبروك <@${m.author.id}>! الإجابة الصحيحة هي: **${answer}**`);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.channel.send(`⏱️ انتهى الوقت! لم يجب أحد بشكل صحيح. الإجابة كانت: **${answer}**`);
      }
    });
  }
});
    
const plural = [
  { singular: "مستقبل", plural: "مستقبلات" },
  { singular: "كمبيوتر", plural: "كمبيوترات" },
  { singular: "برمجة", plural: "برمجيات" },
  { singular: "مكتبة", plural: "مكتبات" },
  { singular: "سيارة", plural: "سيارات" },
  { singular: "كتاب", plural: "كتب" },
  { singular: "مدرسة", plural: "مدارس" },
  { singular: "جامعة", plural: "جامعات" },
  { singular: "هاتف", plural: "هواتف" },
  { singular: "مفتاح", plural: "مفاتيح" },
  { singular: "مطار", plural: "مطارات" },
  { singular: "مكتب", plural: "مكاتب" },
  { singular: "قلم", plural: "أقلام" },
  { singular: "ورقة", plural: "أوراق" },
  { singular: "شاشة", plural: "شاشات" },
  { singular: "نافذة", plural: "نوافذ" },
  { singular: "باب", plural: "أبواب" },
  { singular: "كرسي", plural: "كراسي" },
  { singular: "طاولة", plural: "طاولات" },
  { singular: "مدينة", plural: "مدن" },
  { singular: "طبيب", plural: "أطباء" },
  { singular: "مهندس", plural: "مهندسون" },
  { singular: "معلم", plural: "معلمون" },
  { singular: "طالب", plural: "طلاب" },
  { singular: "دقيقة", plural: "دقائق" },
  { singular: "ساعة", plural: "ساعات" },
  { singular: "طائرة", plural: "طائرات" },
  { singular: "قطار", plural: "قطارات" },
  { singular: "خبز", plural: "خبوز" },
  { singular: "ماء", plural: "مياه" },
  { singular: "شمس", plural: "شموس" },
  { singular: "قمر", plural: "أقمار" },
  { singular: "نجم", plural: "نجوم" },
  { singular: "سماء", plural: "سماوات" },
  { singular: "بحر", plural: "بحار" },
  { singular: "نهر", plural: "أنهار" },
  { singular: "جبل", plural: "جبال" },
  { singular: "صحراء", plural: "صحارى" },
  { singular: "وردة", plural: "ورود" },
  { singular: "شجرة", plural: "أشجار" },
  { singular: "حديقة", plural: "حدائق" },
  { singular: "طريق", plural: "طرق" },
  { singular: "شارع", plural: "شوارع" },
  { singular: "بناية", plural: "بنايات" },
  { singular: "بيت", plural: "بيوت" },
  { singular: "مزرعة", plural: "مزارع" },
  { singular: "دجاجة", plural: "دجاج" },
  { singular: "سيجارة", plural: "سجائر" },
  { singular: "حقيبة", plural: "حقائب" },
  { singular: "دراجة", plural: "دراجات" },
  { singular: "ثلاجة", plural: "ثلاجات" },
  { singular: "حليب", plural: "ألبان" },
  { singular: "سكر", plural: "سكريات" },
  { singular: "قهوة", plural: "قهاوي" },
  { singular: "شاي", plural: "أنواع الشاي" },
  { singular: "حساء", plural: "حساءات" },
  { singular: "فطور", plural: "أفطار" },
  { singular: "غداء", plural: "أغدية" },
  { singular: "عشاء", plural: "أعشاء" },
  { singular: "فيلم", plural: "أفلام" },
  { singular: "صورة", plural: "صور" },
  { singular: "لوحة", plural: "لوحات" },
  { singular: "موسيقى", plural: "موسيقات" },
  { singular: "كهرباء", plural: "كهرباءات" },
  { singular: "حاسوب", plural: "حواسيب" },
  { singular: "شبكة", plural: "شبكات" },
  { singular: "إنترنت", plural: "إنترنتات" },
  { singular: "برج", plural: "أبراج" },
  { singular: "قط", plural: "قطط" },
  { singular: "كلب", plural: "كلاب" },
  { singular: "حصان", plural: "خيول" },
  { singular: "جمل", plural: "جمال" },
  { singular: "سمك", plural: "أسماك" },
  { singular: "عصفور", plural: "عصافير" },
  { singular: "دجاج", plural: "دجاجات" },
  { singular: "بطة", plural: "بط" },
  { singular: "تفاحة", plural: "تفاح" },
  { singular: "موز", plural: "موزات" },
  { singular: "عنب", plural: "عناقيد" },
  { singular: "برتقال", plural: "برتقالات" },
  { singular: "ليمون", plural: "ليمونات" },
  { singular: "تمر", plural: "تمور" },
  { singular: "خوخ", plural: "خوخات" },
  { singular: "رمان", plural: "رمانات" },
  { singular: "بطيخ", plural: "بطيخات" },
  { singular: "فراولة", plural: "فراولات" },
  { singular: "كمثرى", plural: "كمثريات" },
  { singular: "تين", plural: "تينات" },
  { singular: "زيتون", plural: "زيتونات" },
  { singular: "جزر", plural: "جزر" },
  { singular: "بطاطا", plural: "بطاطس" },
  { singular: "بصل", plural: "بصلات" },
  { singular: "ثوم", plural: "ثومات" },
  { singular: "نعناع", plural: "نعانيع" },
  { singular: "بقدونس", plural: "بقدونسات" },
  { singular: "جوافة", plural: "جوافات" },
  { singular: "كيوي", plural: "كيويات" },
  { singular: "مانجو", plural: "مانجات" },
  { singular: "أناناس", plural: "أناناسات" },
  { singular: "ملفوف", plural: "ملفوفات" },
  { singular: "خس", plural: "خسات" },
  { singular: "فلفل", plural: "فلفلات" },
  { singular: "خيار", plural: "خيارات" },
  { singular: "فجل", plural: "فجولات" },
  { singular: "قرنبيط", plural: "قرنبيطات" },
  { singular: "سبانخ", plural: "سبانخات" }
];

// دالة رسم الكلمة على صورة
function drawWordImage(word) {
  const fontSize = 64;
  const canvas = createCanvas(400, 120);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold ${fontSize}px Cairo, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = "#fff";
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = 7;
  ctx.direction = 'rtl';

  ctx.fillText(word, canvas.width / 2, canvas.height / 2);

  return canvas.toBuffer('image/png');
}

// أمر: !جمعني (يرسل كلمة مفردة وعلى العضو إرسال جمعها)
client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix + "جمع")) {
    // اختار كلمة عشوائية
    const wordObj = plural[Math.floor(Math.random() * plural.length)];
    const buffer = drawWordImage(wordObj.singular);

    const attachment = new AttachmentBuilder(buffer, { name: 'word.png' });

    const embed = new EmbedBuilder()
      .setTitle("🔡 اجمع الكلمة!")
      .setDescription(`قم بكتابة جمع الكلمة العربية الظاهرة في الصورة خلال 12 ثانية!`)
      .setColor("Random")
      .setImage('attachment://word.png')
      .setFooter({ text: "MAYOR STUDIO" });

    await message.channel.send({ embeds: [embed], files: [attachment] });

    const correctPlural = wordObj.plural;

    const filter = m =>
      !m.author.bot &&
      m.content.replace(/\s+/g, " ").trim() === correctPlural;

    const collector = message.channel.createMessageCollector({ filter, time: 12000, max: 1 });

    collector.on('collect', m => {
      message.channel.send(`🎉 مبروك <@${m.author.id}>! الجمع الصحيح هو: **${correctPlural}**`);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.channel.send(`⏱️ انتهى الوقت! الجمع الصحيح هو: **${correctPlural}**`);
      }
    });
  }
});
    
    const singular = [
  { singular: "مستقبل", plural: "مستقبلات" },
  { singular: "كمبيوتر", plural: "كمبيوترات" },
  { singular: "برمجة", plural: "برمجيات" },
  { singular: "مكتبة", plural: "مكتبات" },
  { singular: "سيارة", plural: "سيارات" },
  { singular: "كتاب", plural: "كتب" },
  { singular: "مدرسة", plural: "مدارس" },
  { singular: "جامعة", plural: "جامعات" },
  { singular: "هاتف", plural: "هواتف" },
  { singular: "مفتاح", plural: "مفاتيح" },
  { singular: "مطار", plural: "مطارات" },
  { singular: "مكتب", plural: "مكاتب" },
  { singular: "قلم", plural: "أقلام" },
  { singular: "ورقة", plural: "أوراق" },
  { singular: "شاشة", plural: "شاشات" },
  { singular: "نافذة", plural: "نوافذ" },
  { singular: "باب", plural: "أبواب" },
  { singular: "كرسي", plural: "كراسي" },
  { singular: "طاولة", plural: "طاولات" },
  { singular: "مدينة", plural: "مدن" },
  { singular: "طبيب", plural: "أطباء" },
  { singular: "مهندس", plural: "مهندسون" },
  { singular: "معلم", plural: "معلمون" },
  { singular: "طالب", plural: "طلاب" },
  { singular: "دقيقة", plural: "دقائق" },
  { singular: "ساعة", plural: "ساعات" },
  { singular: "طائرة", plural: "طائرات" },
  { singular: "قطار", plural: "قطارات" },
  { singular: "خبز", plural: "خبوز" },
  { singular: "ماء", plural: "مياه" },
  { singular: "شمس", plural: "شموس" },
  { singular: "قمر", plural: "أقمار" },
  { singular: "نجم", plural: "نجوم" },
  { singular: "سماء", plural: "سماوات" },
  { singular: "بحر", plural: "بحار" },
  { singular: "نهر", plural: "أنهار" },
  { singular: "جبل", plural: "جبال" },
  { singular: "صحراء", plural: "صحارى" },
  { singular: "وردة", plural: "ورود" },
  { singular: "شجرة", plural: "أشجار" },
  { singular: "حديقة", plural: "حدائق" },
  { singular: "طريق", plural: "طرق" },
  { singular: "شارع", plural: "شوارع" },
  { singular: "بناية", plural: "بنايات" },
  { singular: "بيت", plural: "بيوت" },
  { singular: "مزرعة", plural: "مزارع" },
  { singular: "دجاجة", plural: "دجاج" },
  { singular: "سيجارة", plural: "سجائر" },
  { singular: "حقيبة", plural: "حقائب" },
  { singular: "دراجة", plural: "دراجات" },
  { singular: "ثلاجة", plural: "ثلاجات" },
  { singular: "حليب", plural: "ألبان" },
  { singular: "سكر", plural: "سكريات" },
  { singular: "قهوة", plural: "قهاوي" },
  { singular: "شاي", plural: "أنواع الشاي" },
  { singular: "حساء", plural: "حساءات" },
  { singular: "فطور", plural: "أفطار" },
  { singular: "غداء", plural: "أغدية" },
  { singular: "عشاء", plural: "أعشاء" },
  { singular: "فيلم", plural: "أفلام" },
  { singular: "صورة", plural: "صور" },
  { singular: "لوحة", plural: "لوحات" },
  { singular: "موسيقى", plural: "موسيقات" },
  { singular: "كهرباء", plural: "كهرباءات" },
  { singular: "حاسوب", plural: "حواسيب" },
  { singular: "شبكة", plural: "شبكات" },
  { singular: "إنترنت", plural: "إنترنتات" },
  { singular: "برج", plural: "أبراج" },
  { singular: "قط", plural: "قطط" },
  { singular: "كلب", plural: "كلاب" },
  { singular: "حصان", plural: "خيول" },
  { singular: "جمل", plural: "جمال" },
  { singular: "سمك", plural: "أسماك" },
  { singular: "عصفور", plural: "عصافير" },
  { singular: "دجاج", plural: "دجاجات" },
  { singular: "بطة", plural: "بط" },
  { singular: "تفاحة", plural: "تفاح" },
  { singular: "موز", plural: "موزات" },
  { singular: "عنب", plural: "عناقيد" },
  { singular: "برتقال", plural: "برتقالات" },
  { singular: "ليمون", plural: "ليمونات" },
  { singular: "تمر", plural: "تمور" },
  { singular: "خوخ", plural: "خوخات" },
  { singular: "رمان", plural: "رمانات" },
  { singular: "بطيخ", plural: "بطيخات" },
  { singular: "فراولة", plural: "فراولات" },
  { singular: "كمثرى", plural: "كمثريات" },
  { singular: "تين", plural: "تينات" },
  { singular: "زيتون", plural: "زيتونات" },
  { singular: "جزر", plural: "جزر" },
  { singular: "بطاطا", plural: "بطاطس" },
  { singular: "بصل", plural: "بصلات" },
  { singular: "ثوم", plural: "ثومات" },
  { singular: "نعناع", plural: "نعانيع" },
  { singular: "بقدونس", plural: "بقدونسات" },
  { singular: "جوافة", plural: "جوافات" },
  { singular: "كيوي", plural: "كيويات" },
  { singular: "مانجو", plural: "مانجات" },
  { singular: "أناناس", plural: "أناناسات" },
  { singular: "ملفوف", plural: "ملفوفات" },
  { singular: "خس", plural: "خسات" },
  { singular: "فلفل", plural: "فلفلات" },
  { singular: "خيار", plural: "خيارات" },
  { singular: "فجل", plural: "فجولات" },
  { singular: "قرنبيط", plural: "قرنبيطات" },
  { singular: "سبانخ", plural: "سبانخات" }
];

// دالة رسم الكلمة على صورة
function drawWordImage(word) {
  const fontSize = 64;
  const canvas = createCanvas(400, 120);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold ${fontSize}px Cairo, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = "#fff";
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = 7;
  ctx.direction = 'rtl';

  ctx.fillText(word, canvas.width / 2, canvas.height / 2);

  return canvas.toBuffer('image/png');
}

// أمر: !مفردني  (يرسل كلمة جمع وعلى العضو إرسال المفرد)
client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix + "مفرد")) {
    // اختار كلمة عشوائية
    const wordObj = singular[Math.floor(Math.random() * singular.length)];
    const buffer = drawWordImage(wordObj.plural);

    const attachment = new AttachmentBuilder(buffer, { name: 'word.png' });

    const embed = new EmbedBuilder()
      .setTitle("🔡 مفرد الكلمة!")
      .setDescription(`قم بكتابة المفرد للكلمة العربية الظاهرة في الصورة خلال 12 ثانية!`)
      .setColor("Random")
      .setImage('attachment://word.png')
      .setFooter({ text: "MAYOR STUDIO" });

    await message.channel.send({ embeds: [embed], files: [attachment] });

    const correctSingular = wordObj.singular;

    const filter = m =>
      !m.author.bot &&
      m.content.replace(/\s+/g, " ").trim() === correctSingular;

    const collector = message.channel.createMessageCollector({ filter, time: 12000, max: 1 });

    collector.on('collect', m => {
      message.channel.send(`🎉 مبروك <@${m.author.id}>! المفرد الصحيح هو: **${correctSingular}**`);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.channel.send(`⏱️ انتهى الوقت! المفرد الصحيح هو: **${correctSingular}**`);
      }
    });
  }
});
    
    const opposite = [
  { word: "سعيد", opposite: "حزين" },
  { word: "حار", opposite: "بارد" },
  { word: "طويل", opposite: "قصير" },
  { word: "كبير", opposite: "صغير" },
  { word: "سهل", opposite: "صعب" },
  { word: "قديم", opposite: "جديد" },
  { word: "سريع", opposite: "بطيء" },
  { word: "قوي", opposite: "ضعيف" },
  { word: "غني", opposite: "فقير" },
  { word: "ثقيل", opposite: "خفيف" },
  { word: "قريب", opposite: "بعيد" },
  { word: "طويل", opposite: "قصير" },
  { word: "عميق", opposite: "ضحل" },
  { word: "مليء", opposite: "فارغ" },
  { word: "واسع", opposite: "ضيق" },
  { word: "فاتح", opposite: "غامق" },
  { word: "مشرق", opposite: "مظلم" },
  { word: "صديق", opposite: "عدو" },
  { word: "ذكر", opposite: "أنثى" },
  { word: "ليل", opposite: "نهار" },
  { word: "أعلى", opposite: "أسفل" },
  { word: "يمين", opposite: "يسار" },
  { word: "أمام", opposite: "خلف" },
  { word: "دخول", opposite: "خروج" },
  { word: "مفتوح", opposite: "مغلق" },
  { word: "سليم", opposite: "مريض" },
  { word: "صديق", opposite: "عدو" },
  { word: "هادئ", opposite: "صاخب" },
  { word: "مفيد", opposite: "ضار" },
  { word: "جاف", opposite: "رطب" },
  { word: "حلو", opposite: "مر" },
  { word: "كامل", opposite: "ناقص" },
  { word: "نشيط", opposite: "كسول" },
  { word: "واضح", opposite: "غامض" },
  { word: "قوي", opposite: "ضعيف" },
  { word: "قاسٍ", opposite: "لين" },
  { word: "طري", opposite: "يابس" },
  { word: "ساكن", opposite: "متحرك" },
  { word: "مدح", opposite: "ذم" },
  { word: "أمل", opposite: "يأس" },
  { word: "نصر", opposite: "هزيمة" },
  { word: "الحقيقة", opposite: "الكذب" },
  { word: "حياة", opposite: "موت" },
  { word: "حب", opposite: "كره" },
  { word: "نور", opposite: "ظلام" },
  { word: "سعادة", opposite: "حزن" },
  { word: "أبيض", opposite: "أسود" },
  { word: "بداية", opposite: "نهاية" },
  { word: "عالي", opposite: "منخفض" },
  { word: "ذكاء", opposite: "غباء" },
  { word: "مدح", opposite: "ذم" },
  { word: "راحة", opposite: "تعب" },
  { word: "أمان", opposite: "خطر" },
  { word: "قوة", opposite: "ضعف" },
  { word: "أمل", opposite: "يأس" },
  { word: "كثرة", opposite: "قلة" },
  { word: "فرح", opposite: "حزن" },
  { word: "حاضر", opposite: "غائب" },
  { word: "حق", opposite: "باطل" },
  { word: "حرية", opposite: "عبودية" },
  { word: "مفيد", opposite: "ضار" },
  { word: "ملون", opposite: "أحادي" },
  { word: "محبوب", opposite: "مكروه" },
  { word: "مبكر", opposite: "متأخر" },
  { word: "مكتمل", opposite: "غير مكتمل" },
  { word: "دائم", opposite: "مؤقت" },
  { word: "ممكن", opposite: "مستحيل" },
  { word: "مسموح", opposite: "ممنوع" },
  { word: "صحيح", opposite: "خاطئ" },
  { word: "غالي", opposite: "رخيص" },
  { word: "احتراف", opposite: "هواية" },
  { word: "شجاع", opposite: "جبان" },
  { word: "أمانة", opposite: "خيانة" },
  { word: "سخاء", opposite: "بخل" },
  { word: "كرم", opposite: "بخل" },
  { word: "تقدم", opposite: "تأخر" },
  { word: "صعود", opposite: "هبوط" },
  { word: "مغناطيس", opposite: "مضاد مغناطيس" },
  { word: "شمال", opposite: "جنوب" },
  { word: "شرق", opposite: "غرب" },
  { word: "قديم", opposite: "جديد" },
  { word: "نظيف", opposite: "متسخ" },
  { word: "مهم", opposite: "تافه" },
  { word: "مطلوب", opposite: "مرفوض" },
  { word: "عاقل", opposite: "مجنون" },
  { word: "مستقيم", opposite: "معوج" },
  { word: "عادل", opposite: "ظالم" },
  { word: "أصل", opposite: "فرع" },
  { word: "بارد", opposite: "حار" },
  { word: "مظلم", opposite: "مضيء" },
  { word: "واسع", opposite: "ضيق" },
  { word: "مُشبع", opposite: "جائع" },
  { word: "سقف", opposite: "أرضية" },
  { word: "مؤمن", opposite: "كافر" },
  { word: "عدل", opposite: "ظلم" },
  { word: "صعود", opposite: "نزول" },
  { word: "اتفاق", opposite: "خلاف" },
  { word: "نجاح", opposite: "فشل" },
  { word: "نشيط", opposite: "خامل" },
  { word: "قريب", opposite: "بعيد" },
  { word: "جاف", opposite: "رطب" },
  { word: "استقبال", opposite: "وداع" },
  { word: "رقيق", opposite: "سميك" },
  { word: "حياة", opposite: "موت" },
  { word: "حاضر", opposite: "ماضٍ" },
  { word: "كريم", opposite: "بخيل" },
  { word: "فرح", opposite: "غم" },
  { word: "كسول", opposite: "مجتهد" },
  { word: "غائب", opposite: "حاضر" },
  { word: "قوي", opposite: "ضعيف" },
  { word: "مشرق", opposite: "مظلم" },
  { word: "مليء", opposite: "فارغ" },
  { word: "عاقل", opposite: "مجنون" },
  { word: "منظم", opposite: "فوضوي" },
  { word: "إيجابي", opposite: "سلبي" },
  { word: "أمل", opposite: "يأس" },
  { word: "موجود", opposite: "مفقود" },
  { word: "فرح", opposite: "حزن" },
  { word: "كثرة", opposite: "قلة" },
  { word: "نجاح", opposite: "فشل" },
  { word: "محبوب", opposite: "مكروه" },
  { word: "جمال", opposite: "قبح" },
  { word: "تحسن", opposite: "تدهور" },
  { word: "صحيح", opposite: "خاطئ" },
  { word: "مربح", opposite: "خاسر" },
  { word: "حكيم", opposite: "جاهل" },
  { word: "هام", opposite: "تافه" },
  { word: "متين", opposite: "هش" },
  { word: "مقدام", opposite: "جبان" },
  { word: "واضح", opposite: "مبهم" },
  { word: "ذكي", opposite: "غبي" },
  { word: "ثابت", opposite: "متغير" },
  { word: "آمن", opposite: "خطر" },
  { word: "مسموع", opposite: "ممنوع" },
  { word: "مدح", opposite: "ذم" },
  { word: "قديم", opposite: "حديث" },
  { word: "مستقيم", opposite: "منحني" },
  { word: "منتظم", opposite: "غير منتظم" },
  { word: "فرح", opposite: "غم" },
  { word: "مشرق", opposite: "مظلم" },
  { word: "ضخم", opposite: "ضئيل" },
  { word: "حق", opposite: "باطل" },
  { word: "إيجابي", opposite: "سلبي" },
  { word: "صديق", opposite: "عدو" },
  { word: "مبكر", opposite: "متأخر" },
  { word: "فوق", opposite: "تحت" },
  { word: "سرعة", opposite: "بطء" },
  { word: "قوة", opposite: "ضعف" },
  { word: "حب", opposite: "كره" },
  { word: "مفيد", opposite: "ضار" },
  { word: "مريح", opposite: "متعب" },
  { word: "أمل", opposite: "يأس" },
  { word: "شمال", opposite: "جنوب" },
  { word: "شرق", opposite: "غرب" },
  { word: "مشرق", opposite: "مظلم" },
  { word: "موجود", opposite: "مفقود" },
  { word: "قوي", opposite: "ضعيف" },
  { word: "جميل", opposite: "قبيح" },
  { word: "فائز", opposite: "خاسر" },
  { word: "مفيد", opposite: "ضار" },
  { word: "محظوظ", opposite: "منحوس" },
  { word: "قمة", opposite: "قاع" },
  { word: "أعلى", opposite: "أسفل" },
  { word: "مشرق", opposite: "مظلم" },
  { word: "بسيط", opposite: "معقد" },
  { word: "غني", opposite: "فقير" },
  { word: "سعيد", opposite: "تعيس" },
  { word: "محب", opposite: "كاره" },
  { word: "آمن", opposite: "خطر" },
  { word: "مدح", opposite: "ذم" },
  { word: "قمة", opposite: "قاع" },
  { word: "مفيد", opposite: "ضار" },
  { word: "مستقيم", opposite: "منحني" },
  { word: "صديق", opposite: "عدو" },
  { word: "مشرق", opposite: "مظلم" },
  { word: "سعيد", opposite: "حزين" },
  { word: "مفتوح", opposite: "مغلق" },
  { word: "دخول", opposite: "خروج" },
  { word: "متاح", opposite: "محجوز" },
  { word: "صاعد", opposite: "هابط" },
  { word: "أعلى", opposite: "أدنى" },
  { word: "سريع", opposite: "بطيء" },
  { word: "كبير", opposite: "صغير" }
  // يمكنك إضافة المزيد حتى 200 كلمة أو أكثر حسب الحاجة
];

// دالة رسم الكلمة على صورة
function drawWordImage(word) {
  const fontSize = 64;
  const canvas = createCanvas(420, 120);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold ${fontSize}px Cairo, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = "#fff";
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = 7;
  ctx.direction = 'rtl';

  ctx.fillText(word, canvas.width / 2, canvas.height / 2);

  return canvas.toBuffer('image/png');
}

// أمر: !عكسني  (يرسل كلمة وعلى العضو إرسال عكسها)
client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix + "عكس")) {
    // اختار كلمة عشوائية
    const wordObj = opposite[Math.floor(Math.random() * opposite.length)];
    const buffer = drawWordImage(wordObj.word);

    const attachment = new AttachmentBuilder(buffer, { name: 'word.png' });

    const embed = new EmbedBuilder()
      .setTitle("🔄 عكس الكلمة!")
      .setDescription(`قم بكتابة عكس الكلمة العربية الظاهرة في الصورة خلال 12 ثانية!`)
      .setColor("Random")
      .setImage('attachment://word.png')
      .setFooter({ text: "MAYOR STUDIO" });

    await message.channel.send({ embeds: [embed], files: [attachment] });

    const correctOpposite = wordObj.opposite;

    const filter = m =>
      !m.author.bot &&
      m.content.replace(/\s+/g, " ").trim() === correctOpposite;

    const collector = message.channel.createMessageCollector({ filter, time: 12000, max: 1 });

    collector.on('collect', m => {
      message.channel.send(`🎉 مبروك <@${m.author.id}>! العكس الصحيح هو: **${correctOpposite}**`);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.channel.send(`⏱️ انتهى الوقت! العكس الصحيح هو: **${correctOpposite}**`);
      }
    });
  }
});
    
    
    function drawNumberImage(number) {
  const fontSize = 72;
  const canvas = createCanvas(360, 120);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold ${fontSize}px Arial, Cairo, Tahoma, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = "#fff";
  ctx.shadowColor = 'rgba(0,0,0,0.32)';
  ctx.shadowBlur = 7;
  ctx.fillText(number.toString(), canvas.width / 2, canvas.height / 2);

  return canvas.toBuffer('image/png');
}

// أمر: !رقمني  (يرسل رقم عشوائي وعلى العضو كتابته كما هو)
const numbers1 = []; // تخزين الأرقام التي تم استخدامها إذا أردت لاحقاً (ليس ضروري للوظيفة الأساسية)

client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix + "ارقام")) {
    // توليد رقم عشوائي من 1 إلى 1,000,000
    const randomNumber = Math.floor(Math.random() * 1_000_000) + 1;
    numbers1.push(randomNumber);

    const buffer = drawNumberImage(randomNumber);

    const attachment = new AttachmentBuilder(buffer, { name: 'number.png' });

    const embed = new EmbedBuilder()
      .setTitle("🎲 اكتب الرقم!")
      .setDescription(`اكتب الرقم الظاهر في الصورة كما هو خلال 9 ثواني!`)
      .setColor("Random")
      .setImage('attachment://number.png')
      .setFooter({ text: "MAYOR STUDIO" });

    await message.channel.send({ embeds: [embed], files: [attachment] });

    const filter = m =>
      !m.author.bot &&
      m.content.replace(/\s+/g, "") === randomNumber.toString();

    const collector = message.channel.createMessageCollector({ filter, time: 9000, max: 1 });

    collector.on('collect', m => {
      message.channel.send(`🎉 أحسنت <@${m.author.id}>! الرقم الصحيح هو: **${randomNumber}**`);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.channel.send(`⏱️ انتهى الوقت! الرقم كان: **${randomNumber}**`);
      }
    });
  }
});
    
    
  const camouflag = [
  "شمس","قمر","مدينة","قطار","سيارة","هاتف","مطار","كتاب","قلم","طاولة","كرسي","شباك","نافذة","باب","مفتاح","دراجة","ثلاجة","وردة","شجرة","حديقة",
  "مدرسة","جامعة","مكتبة","مكتب","موسيقى","حاسوب","انترنت","برج","مستشفى","مزرعة","سوق","صيدلية","مسرح","سينما","مطعم","مخبز","مصنع","حديقة","ملعب","سفينة",
  "نهر","بحر","جبل","صحراء","غابة","شارع","طريق","جسر","سفينة","دكان","مقعد","لوحة","صورة","دقيقة","ساعة","ثانية","ليل","نهار","صباح","مساء",
  "بيت","غرفة","صالة","سطح","مطبخ","حمام","كنبة","سجادة","مخدة","بطانية","مروحة","مكيف","مصباح","ساعة","تلفاز","راديو","حاسبة","مسطرة","مسجل","هاتف",
  "ورقة","دفتر","ممحاة","مبراة","حقيبة","محفظة","مظلة","قبعة","حذاء","قميص","بنطال","فستان","جاكيت","شال","جوارب","يد","رجل","رأس","عين","أنف",
  "فم","أذن","شعر","وجه","ذراع","كوع","ركبة","قدم","إصبع","ظفر","ظهر","صدر","بطن","كتف","قلب","رئة","معدة","لسان","أسنان","فك",
  "دماغ","عظم","دم","جلد","عضلة","عصب","وريد","شريان","كلية","كبد","رئة","معدة","رئة","أمعاء","طحال","حنجرة","قصبة","شفة","خد","عنق",
  "حيوان","قط","كلب","أسد","نمر","فهد","ذئب","ثعلب","دب","غزال","جمل","حصان","بقرة","خروف","ماعز","دجاجة","بطة","وزة","طاووس","ديك",
  "بطريق","قرد","قنفذ","سلحفاة","ضفدع","تمساح","عصفور","حمامة","غراب","نسر","بومة","صقر","نحلة","ذبابة","بعوضة","فراشة","دودة","سمكة","حوت","دلفين",
  "قرش","روبيان","سلطعون","محار","صدفة","بلح البحر","إخطبوط","جمبري","سلحفاة بحرية","تمساح بحري","أخطبوط","نجم البحر","حصان البحر","مرجان","إسفنج","طحلب","كائن دقيق","بكتيريا","فيروس","ميكروب"
];

// توليد لون تمويه عشوائي للخلفية ولون نص قريب منه
function randomCamouflageColors() {
  // لون خلفية عشوائي
  const r = Math.floor(Math.random() * 180) + 40;
  const g = Math.floor(Math.random() * 180) + 40;
  const b = Math.floor(Math.random() * 180) + 40;
  const bg = `rgb(${r},${g},${b})`;

  // لون نص قريب جدا من الخلفية (يصعب تمييزه)
  let diff = Math.floor(Math.random() * 18) + 8; // فرق بسيط فقط
  let r2 = r + (Math.random() > 0.5 ? diff : -diff);
  let g2 = g + (Math.random() > 0.5 ? diff : -diff);
  let b2 = b + (Math.random() > 0.5 ? diff : -diff);
  r2 = Math.max(0, Math.min(255, r2));
  g2 = Math.max(0, Math.min(255, g2));
  b2 = Math.max(0, Math.min(255, b2));
  const text = `rgb(${r2},${g2},${b2})`;

  return { bg, text };
}

// دالة رسم الكلمة أو الرقم بلون مموه
function drawCamouflageImage(word) {
  const fontSize = 64;
  const canvas = createCanvas(480, 120);
  const ctx = canvas.getContext('2d');

  // ألوان تمويه عشوائية
  const { bg, text } = randomCamouflageColors();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `bold ${fontSize}px Cairo, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = text;
  ctx.direction = 'rtl';

  ctx.fillText(word, canvas.width / 2, canvas.height / 2);

  return canvas.toBuffer('image/png');
}

// أمر: !مموهني  (يرسل كلمة أو رقم مموهة وعلى العضو كتابتها كما هي)
client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix + "تمويه")) {
    // اختيار كلمة أو رقم عشوائي
    let useWord = Math.random() > 0.5;
    let picked;
    if (useWord) {
      picked = camouflag[Math.floor(Math.random() * camouflag.length)];
    } else {
      picked = (Math.floor(Math.random() * 1_000_000) + 1).toString();
    }

    const buffer = drawCamouflageImage(picked);

    const attachment = new AttachmentBuilder(buffer, { name: 'camouflag.png' });

    const embed = new EmbedBuilder()
      .setTitle("🕵️‍♂️ كلمة/رقم مموه!")
      .setDescription(
        `اكتب **${useWord ? "الكلمة" : "الرقم"}** الظاهر في الصورة كما هو، اللون صعب! لديك 10 ثواني.`
      )
      .setColor("Random")
      .setImage('attachment://camouflag.png')
      .setFooter({ text: "MAYOR STUDIO" });

    await message.channel.send({ embeds: [embed], files: [attachment] });

    const answer = picked.replace(/\s+/g, " ").trim();

    const filter = m =>
      !m.author.bot &&
      m.content.replace(/\s+/g, " ").trim() === answer;

    const collector = message.channel.createMessageCollector({ filter, time: 10000, max: 1 });

    collector.on('collect', m => {
      message.channel.send(`🎯 أحسنت <@${m.author.id}>! الإجابة الصحيحة هي: **${answer}**`);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.channel.send(`⏱️ انتهى الوقت! الإجابة كانت: **${answer}**`);
      }
    });
  }
});
    
    
const questions = [
  { q: "ما هو أكبر كوكب في المجموعة الشمسية؟", a: "المشتري" },
  { q: "كم عدد قارات العالم؟", a: "سبع قارات" },
  { q: "ما عاصمة مصر؟", a: "القاهرة" },
  { q: "من هو مخترع المصباح الكهربائي؟", a: "توماس إديسون" },
  { q: "ما هو الحيوان الذي يُلقب بسفينة الصحراء؟", a: "الجمل" },
  { q: "ما هو أقرب كوكب إلى الشمس؟", a: "عطارد" },
  { q: "كم عدد أيام السنة الكبيسة؟", a: "366 يوماً" },
  { q: "من هو الشاعر الملقب بـ أمير الشعراء؟", a: "أحمد شوقي" },
  { q: "ما هو العنصر الكيميائي الذي رمزه O؟", a: "الأكسجين" },
  { q: "كم عدد ألوان قوس قزح؟", a: "سبعة ألوان" },
  { q: "ما اسم أطول نهر في العالم؟", a: "نهر النيل" },
  { q: "من هو أول رئيس للولايات المتحدة الأمريكية؟", a: "جورج واشنطن" },
  { q: "ما هو الحيوان الذي لا ينام طوال حياته؟", a: "السمك" },
  { q: "ما اسم أسرع حيوان بري؟", a: "الفهد" },
  { q: "ما اسم البحر الذي يفصل بين أوروبا وأفريقيا؟", a: "البحر المتوسط" },
  { q: "من هو النبي الذي ابتلعه الحوت؟", a: "يونس عليه السلام" },
  { q: "ما هو الشيء الذي ينبض بلا قلب؟", a: "الساعة" },
  { q: "ما اسم أكبر قارة في العالم؟", a: "آسيا" },
  { q: "أي مدينة تُعرف بمدينة الضباب؟", a: "لندن" },
  { q: "ما هو الكوكب الأحمر؟", a: "المريخ" },
  // ... أكمل حتى 300 سؤال وجواب حسب رغبتك ...
];

// رسم السؤال بخط كبير باللون الأبيض وخلفية شفافة
function drawQuestionImage(question) {
  const fontSize = 40; // أكبر من قبل
  const width = 900;
  const height = 140;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  ctx.font = `bold ${fontSize}px Cairo, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.fillStyle = "#fff";

  ctx.fillText(question, width / 2, height / 2);

  return canvas.toBuffer('image/png');
}

// أمر: !سؤالني  (يرسل سؤال عشوائي كصورة بنص أبيض فقط، العضو يجيب عليه)
client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix + "سؤال")) {
    const qa = questions[Math.floor(Math.random() * questions.length)];
    const buffer = drawQuestionImage(qa.q);

    const attachment = new AttachmentBuilder(buffer, { name: 'question.png' });

    const embed = new EmbedBuilder()
      .setTitle("❓ سؤال عشوائي")
      .setDescription("جاوب على السؤال في الصورة خلال 15 ثانية!")
      .setColor("Random")
      .setImage('attachment://question.png')
      .setFooter({ text: "MAYOR STUDIO" });

    await message.channel.send({ embeds: [embed], files: [attachment] });

    // الإجابة الصحيحة بعد إزالة المسافات وتوحيد الأحرف
    const correctAnswer = qa.a.replace(/\s+/g, "").toLowerCase();

    const filter = m =>
      !m.author.bot &&
      m.content.replace(/\s+/g, "").toLowerCase() === correctAnswer;

    const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

    collector.on('collect', m => {
      message.channel.send(`🎉 أحسنت <@${m.author.id}>! الإجابة الصحيحة هي: **${qa.a}**`);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.channel.send(`⏱️ انتهى الوقت! الإجابة كانت: **${qa.a}**`);
      }
    });
  }
});

    
    const puzzels = [
  { q: "شيء يمشي بلا أرجل ولا يدخل إلا بالأذنين، فما هو؟", a: "الصوت" },
  { q: "له أوراق وما هو بنبات، وله جلد وما هو بحيوان، وعلم وما هو بإنسان، فما هو؟", a: "الكتاب" },
  { q: "ما الشيء الذي إذا أخذت منه كبر وإذا وضعت فيه صغر؟", a: "الحفرة" },
  { q: "ما هو الشيء الذي كلما زاد نقص؟", a: "العمر" },
  { q: "ما هو الشيء الذي يوجد في وسط مكة؟", a: "حرف الكاف" },
  { q: "له رأس ولا عين له، فما هو؟", a: "الدبوس" },
  { q: "ما هو الشيء الذي كلما أخذت منه ازداد وكبر؟", a: "الحفرة" },
  { q: "له أسنان ولا يعض، فما هو؟", a: "المشط" },
  { q: "ترى كل شيء وليس لها عيون، فما هي؟", a: "المرآة" },
  { q: "ما هو الشيء الذي يسمع بلا أذن ويتكلم بلا لسان؟", a: "الهاتف" },
  { q: "شيء إذا لمسته صاح، فما هو؟", a: "الجرس" },
  { q: "له قلب ولا ينبض، فما هو؟", a: "الخس" },
  { q: "ما هو الشيء الذي يكتب ولا يقرأ؟", a: "القلم" },
  { q: "ما الشيء الذي إذا دخل الماء لا يبتل؟", a: "الظل" },
  { q: "شيء كلما زاد نقص؟", a: "العمر" },
  { q: "يكسو الناس وهو عارٍ؟", a: "الإبرة" },
  { q: "ما هو الشيء الذي يمشي ويقف وليس له أرجل؟", a: "الساعة" },
  { q: "ما هو الباب الذي لا يمكن فتحه؟", a: "الباب المفتوح" },
  { q: "ما هو الشيء الذي يقرصك دون أن تراه؟", a: "الجوع" },
  { q: "له عنق ولا رأس له، فما هو؟", a: "الزجاجة" },
  { q: "ما هو الشيء الذي لا يمشي إلا بالضرب؟", a: "المسمار" },
  { q: "ما هو الشيء الذي كلما أخذت منه نقص؟", a: "العمر" },
  { q: "أمشي بلا قدمين وأطير بلا جناحين وأبكي بلا عيون، فمن أنا؟", a: "السحاب" },
  { q: "ما هو الشيء الذي يوجد في القرن مرة وفي الدقيقة مرتين ولا يوجد في الساعة؟", a: "حرف القاف" },
  { q: "له أوراق وليس نبات، فما هو؟", a: "الكتاب" },
  { q: "ما هو الشيء الذي يرفع أثقال ولا يستطيع رفع مسمار؟", a: "البحر" },
  { q: "ما هو الشيء الذي إذا غليته تجمد؟", a: "البيض" },
  { q: "له عين ولا يرى؟", a: "الإبرة" },
  { q: "ما هو الشيء الذي له وجه بلا لسان ويجب أن يكسر قبل أن يؤكل؟", a: "البيض" },
  { q: "يملك وجهًا بلا ملامح، فما هو؟", a: "الساعة" },
  { q: "يمشي ويقف وليس له أرجل؟", a: "الساعة" },
  { q: "ما هو الشيء الذي كلما كثر لدينا غلا وكلما قل رخص؟", a: "العقل" },
  { q: "حامل ومحمول، نصفه ناشف ونصفه مبلول، فما هو؟", a: "السفينة" },
  { q: "بيت ليس له أبواب ولا نوافذ؟", a: "بيت الشعر" },
  { q: "من هو الذي يرى عدوه وصديقه بعين واحدة؟", a: "الأعور" },
  { q: "ما هو الشيء الذي له أسنان ولا يعض؟", a: "المشط" },
  { q: "ما هو الشيء الذي يتكلم جميع لغات العالم؟", a: "صدى الصوت" },
  { q: "ما هو الشيء الذي يكتب ولا يقرأ؟", a: "القلم" },
  { q: "ما هو الشيء الذي يكون أخضر في الأرض وأسود في السوق وأحمر في البيت؟", a: "الشاي" },
  { q: "شيء تملكه ويستخدمه الآخرون أكثر منك؟", a: "اسمك" },
  { q: "ما هو الشيء الذي إذا أخذنا منه أو زدنا عليه لا ينقص ولا يزيد؟", a: "الصفر" },
  { q: "من الذي يرى كل شيء وليس له عيون؟", a: "المرآة" },
  { q: "ما هو الشيء الذي يسمع بلا أذن ويتكلم بلا لسان؟", a: "الهاتف" },
  { q: "ما هو الشيء الذي إذا غليته جمد؟", a: "البيض" },
  { q: "ما هو الشيء الذي يمشي بلا رجلين ويبكي بلا عينين؟", a: "السحاب" },
  { q: "له عنق ولا رأس له؟", a: "الزجاجة" },
  { q: "ما هو الشيء الذي تراه في الليل ثلاث مرات وفي النهار مرة واحدة؟", a: "حرف اللام" },
  { q: "ما هو الشيء الذي كلما طال قصر؟", a: "العمر" },
  { q: "ما هو الشيء الذي يحمل قنطارًا ولا يستطيع أن يحمل مسمارًا؟", a: "البحر" },
  { q: "ما هو الشيء الذي إذا وضعته في الثلاجة لا يبرد؟", a: "الفلفل الحار" },
  { q: "أين البحر الذي لا يوجد به ماء؟", a: "على الخريطة" },
  { q: "ما هو الشيء الذي يلف حول الغرفة دون أن يتحرك؟", a: "الحائط" },
  { q: "ما هو الشيء الذي يقرصك دون أن تراه؟", a: "الجوع" },
  { q: "ما هو الشيء الذي إذا غليته تجمد؟", a: "البيض" },
  { q: "شيء تذبحه وتبكي عليه؟", a: "البصل" },
  { q: "له أسنان ولا يعض؟", a: "المشط" },
  { q: "ما هو الشيء الذي يكون أخضر في الأرض وأسود في السوق وأحمر في البيت؟", a: "الشاي" },
  { q: "ما هو الشيء الذي يبكي بلا عيون؟", a: "السحاب" },
  { q: "ما هو الشيء الذي ليس له بداية ولا نهاية؟", a: "الدائرة" },
  { q: "ما هو الشيء الذي في رأسه سبع فتحات؟", a: "الإنسان" },
  { q: "ما هو الشيء الذي له أسنان ولا يعض؟", a: "المشط" },
  { q: "ما هو الشيء الذي إذا أخذت منه كبر؟", a: "الحفرة" },
  { q: "له جلد وليس بحيوان وله أوراق وليس بنبات؟", a: "الكتاب" },
  { q: "ما هو الشيء الذي يوجد في كل شيء؟", a: "الاسم" },
  { q: "ما هو الشيء الذي إذا غليته جمد؟", a: "البيض" },
  { q: "له عين ولا يرى؟", a: "الإبرة" },
  { q: "ما هو الشيء الذي يكتب ولا يقرأ؟", a: "القلم" },
  { q: "ما هو الشيء الذي يسمع بلا أذن ويتكلم بلا لسان؟", a: "الهاتف" },
  { q: "ما هو الشيء الذي يمشي بلا أرجل ولا يدخل إلا بالأذنين؟", a: "الصوت" },
  { q: "شيء إذا لمسته صاح؟", a: "الجرس" },
  { q: "ما هو الشيء الذي له قلب ولا ينبض؟", a: "الخس" },
  { q: "شيء له رأس ولا عين له؟", a: "الدبوس" },
  { q: "شيء كلما أخذت منه كبر؟", a: "الحفرة" },
  { q: "ما هو الشيء الذي كلما زاد نقص؟", a: "العمر" },
  { q: "شيء إذا غليته تجمد؟", a: "البيض" },
  { q: "له أوراق وما هو بنبات؟", a: "الكتاب" },
  { q: "ما هو الشيء الذي يوجد في وسط مكة؟", a: "حرف الكاف" },
  { q: "ما هو الشيء الذي إذا أخذت منه كبر وإذا وضعت فيه صغر؟", a: "الحفرة" },
  { q: "ما هو الشيء الذي كلما زاد نقص؟", a: "العمر" },
  { q: "ما الشيء الذي إذا دخل الماء لا يبتل؟", a: "الظل" },
  { q: "ما هو الشيء الذي يبكي بلا عيون؟", a: "السحاب" },
  { q: "بيت ليس له أبواب ولا نوافذ؟", a: "بيت الشعر" },
  { q: "حامل ومحمول نصفه ناشف ونصفه مبلول؟", a: "السفينة" },
  { q: "ما هو الشيء الذي إذا دخل الماء ضاع؟", a: "الملح" },
  { q: "له عنق ولا رأس له؟", a: "الزجاجة" },
  { q: "له وجه بلا ملامح؟", a: "الساعة" },
  { q: "يمشي بلا أرجل ويبكي بلا عيون؟", a: "السحاب" },
  { q: "ما هو الشيء الذي يوجد في وسط باريس؟", a: "حرف الراء" },
  { q: "من هو الذي يرى عدوه وصديقه بعين واحدة؟", a: "الأعور" },
  { q: "ما هو الشيء الذي يحمل قنطارًا ولا يحمل مسمارًا؟", a: "البحر" },
  { q: "ما هو الشيء الذي يقرصك دون أن تراه؟", a: "الجوع" },
  { q: "ما هو الشيء الذي إذا غليته جمد؟", a: "البيض" },
  { q: "ما هو الشيء الذي يمشي بلا رجلين ويبكي بلا عينين؟", a: "السحاب" },
  { q: "ما هو الشيء الذي تحمله ويحملك؟", a: "الحذاء" },
  { q: "ما هو الشيء الذي يكسو الناس وهو عارٍ؟", a: "الإبرة" },
  { q: "ما هو الشيء الذي تراه في الليل ثلاث مرات وفي النهار مرة واحدة؟", a: "حرف اللام" },
  { q: "له أسنان ولا يعض؟", a: "المشط" },
  { q: "ما هو الشيء الذي يتكلم جميع لغات العالم؟", a: "صدى الصوت" },
  { q: "ما هو الشيء الذي يكون أخضر في الأرض وأسود في السوق وأحمر في البيت؟", a: "الشاي" },
  { q: "ما هو الشيء الذي يسير بلا رجلين ويبكي بلا عينين؟", a: "السحاب" },
  { q: "ما هو الشيء الذي إذا أخذت منه كبر؟", a: "الحفرة" },
  { q: "ما هو الشيء الذي كلما أخذت منه نقص؟", a: "العمر" },
  { q: "ما هو الشيء الذي يسمع بلا أذن ويتكلم بلا لسان؟", a: "الهاتف" },
  { q: "ما هو الشيء الذي إذا دخل الماء ضاع؟", a: "الملح" },
  { q: "ما هو الشيء الذي يوجد في وسط مكة؟", a: "حرف الكاف" },
  { q: "ما هو الباب الذي لا يمكن فتحه؟", a: "الباب المفتوح" },
  { q: "ما هو الشيء الذي إذا أخذت منه كبر وإذا وضعت فيه صغر؟", a: "الحفرة" },
  { q: "ما هو الشيء الذي إذا غليته جمد؟", a: "البيض" },
  { q: "ما هو الشيء الذي له وجه بلا لسان ويجب أن يكسر قبل أن يؤكل؟", a: "البيض" },
  { q: "ما هو الشيء الذي يحمل قنطارًا ولا يحمل مسمارًا؟", a: "البحر" },
  { q: "ما هو الشيء الذي لا يمشي إلا بالضرب؟", a: "المسمار" },
  { q: "ما هو الشيء الذي في رأسه سبع فتحات؟", a: "الإنسان" },
  { q: "ما هو الشيء الذي تملكه ويستخدمه الآخرون أكثر منك؟", a: "اسمك" },
  { q: "ما هو الشيء الذي له أسنان ولا يعض؟", a: "المشط" },
  { q: "ما الشيء الذي يكتب ولا يقرأ؟", a: "القلم" },
  { q: "ما هو الشيء الذي إذا أخذت منه كبر؟", a: "الحفرة" },
  { q: "ما هو الشيء الذي كلما أخذت منه نقص؟", a: "العمر" },
  { q: "ما هو الشيء الذي يسمع بلا أذن ويتكلم بلا لسان؟", a: "الهاتف" },
  { q: "ما هو الشيء الذي يوجد في وسط مكة؟", a: "حرف الكاف" },
  { q: "ما هو الشيء الذي إذا غليته جمد؟", a: "البيض" },
  { q: "ما هو الشيء الذي يقرصك دون أن تراه؟", a: "الجوع" },
  { q: "ما هو الشيء الذي إذا دخل الماء لا يبتل؟", a: "الظل" },
  { q: "ما هو الشيء الذي يحمل قنطارًا ولا يحمل مسمارًا؟", a: "البحر" },
  { q: "ما هو الشيء الذي يبكي بلا عيون؟", a: "السحاب" },
  { q: "ما هو الشيء الذي له قلب ولا ينبض؟", a: "الخس" },
  { q: "ما هو الشيء الذي في رأسه سبع فتحات؟", a: "الإنسان" },
  { q: "ما هو الشيء الذي تملكه ويستخدمه الآخرون أكثر منك؟", a: "اسمك" },
  { q: "ما هو الشيء الذي إذا أخذت منه كبر وإذا وضعت فيه صغر؟", a: "الحفرة" },
  { q: "ما هو الشيء الذي يسمع بلا أذن ويتكلم بلا لسان؟", a: "الهاتف" },
  { q: "ما هو الباب الذي لا يمكن فتحه؟", a: "الباب المفتوح" },
  { q: "ما هو الشيء الذي إذا غليته جمد؟", a: "البيض" },
  { q: "له أوراق وما هو بنبات؟", a: "الكتاب" },
  { q: "ما هو الشيء الذي إذا أخذت منه كبر وإذا وضعت فيه صغر؟", a: "الحفرة" },
  { q: "ما هو الشيء الذي في رأسه سبع فتحات؟", a: "الإنسان" },
  { q: "ما هو الشيء الذي يوجد في كل شيء؟", a: "الاسم" },
  { q: "ما هو الشيء الذي إذا دخل الماء لا يبتل؟", a: "الظل" },
  { q: "ما هو الشيء الذي يوجد في وسط باريس؟", a: "حرف الراء" },
  { q: "ما هو الشيء الذي يحمل قنطارًا ولا يحمل مسمارًا؟", a: "البحر" },
  { q: "ما هو الشيء الذي يشربه الإنسان ولا يأكله؟", a: "الماء" },
  { q: "ما هو الشيء الذي إذا دخل الماء ضاع؟", a: "الملح" },
  { q: "له وجه بلا لسان؟", a: "الساعة" },
  { q: "يمشي بلا أرجل ويبكي بلا عيون؟", a: "السحاب" },
  { q: "شيء له أوراق وليس بنبات وله جلد وليس بحيوان؟", a: "الكتاب" },
  { q: "ما هو الشيء الذي له عنق ولا رأس له؟", a: "الزجاجة" },
  { q: "يملك وجهًا بلا ملامح، فما هو؟", a: "الساعة" },
  // ... أضف المزيد ليصبح المجموع أكثر من 200 لغز ...
];

// رسم اللغز بخط كبير باللون الأبيض وخلفية شفافة
function drawPuzzelImage(puzzel) {
  const fontSize = 38;
  const width = 900;
  const height = 150;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  ctx.font = `bold ${fontSize}px Cairo, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.fillStyle = "#fff";

  ctx.fillText(puzzel, width / 2, height / 2);

  return canvas.toBuffer('image/png');
}

// أمر: !لغزني (يرسل لغز عشوائي كصورة بنص أبيض فقط، العضو يجيب عليه)
client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix + "لغز")) {
    const pq = puzzels[Math.floor(Math.random() * puzzels.length)];
    const buffer = drawPuzzelImage(pq.q);

    const attachment = new AttachmentBuilder(buffer, { name: 'puzzel.png' });

    const embed = new EmbedBuilder()
      .setTitle("🧩 لغز عشوائي")
      .setDescription("جاوب على اللغز في الصورة خلال 15 ثانية!")
      .setColor("Random")
      .setImage('attachment://puzzel.png')
      .setFooter({ text: "MAYOR STUDIO" });

    await message.channel.send({ embeds: [embed], files: [attachment] });

    // الإجابة الصحيحة بعد إزالة المسافات وتوحيد الأحرف
    const correctAnswer = pq.a.replace(/\s+/g, "").toLowerCase();

    const filter = m =>
      !m.author.bot &&
      m.content.replace(/\s+/g, "").toLowerCase() === correctAnswer;

    const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

    collector.on('collect', m => {
      message.channel.send(`🎉 أحسنت <@${m.author.id}>! الإجابة الصحيحة هي: **${pq.a}**`);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.channel.send(`⏱️ انتهى الوقت! الإجابة كانت: **${pq.a}**`);
      }
    });
  }
});

let hideGameActive = false;
let hidePlayers = [];
let hidePlayerButtons = {}; // userId => index الزر المختار
let hideAlive = {};
let hideMessage = null;
let hideSeekMsg = null;
const HIDE_BUTTONS_COUNT = 25;

client26.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const gameRoleID = await gamesDB.get(`games_role_${message.guild.id}`);
  const gameRole = message.guild.roles.cache.get(gameRoleID);

  if (message.content.startsWith(`${prefix}غميضة`) && !hideGameActive) {
    // تحقق من أن المستخدم لديه الرتبة
    if (!gameRole || !message.member.roles.cache.has(gameRoleID)) {
      return message.reply('❌ لا تملك الصلاحية لاستخدام هذا الأمر.');
    }
    hideGameActive = true;
    hidePlayers = [];
    hidePlayerButtons = {};
    hideAlive = {};
    hideMessage = null;

    const joinButton = new ButtonBuilder()
      .setCustomId('join_hide_game')
      .setLabel('انضم للاختباء')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🕵️');

    const leaveButton = new ButtonBuilder()
      .setCustomId('leave_hide_game')
      .setLabel('غادر')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('❌');

    const row = new ActionRowBuilder().addComponents(joinButton, leaveButton);

    let embed = new EmbedBuilder()
      .setTitle('لعبة الاختباء في الأزرار!')
      .setDescription('انقر للانضمام. عند بدء اللعبة سيختار كل لاعب زر للاختباء فيه.')
      .setColor(0x00ff00)
      .addFields({ name: 'اللاعبون', value: 'لا يوجد لاعبون بعد', inline: true })
      .setFooter({ text: 'الرجاء الانضمام خلال 30 ثانية.' })
      .setThumbnail(message.guild.iconURL({ dynamic: true }));

    const gameMsg = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = i => ['join_hide_game', 'leave_hide_game'].includes(i.customId);
    const collector = gameMsg.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async interaction => {
      if (interaction.customId === 'join_hide_game') {
        if (!hidePlayers.includes(interaction.user.id)) {
          hidePlayers.push(interaction.user.id);
          hideAlive[interaction.user.id] = true;
          const playerMentions = hidePlayers.map(id => `<@${id}>`).join(', ');
          embed.spliceFields(0, 1, { name: 'اللاعبون', value: `${playerMentions}\nعدد اللاعبين: ${hidePlayers.length}`, inline: true });
          await gameMsg.edit({ embeds: [embed] });
          await interaction.reply({ content: 'تم انضمامك للعبة!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'أنت بالفعل في اللعبة!', ephemeral: true });
        }
      } else if (interaction.customId === 'leave_hide_game') {
        if (hidePlayers.includes(interaction.user.id)) {
          hidePlayers = hidePlayers.filter(id => id !== interaction.user.id);
          delete hideAlive[interaction.user.id];
          const playerMentions = hidePlayers.map(id => `<@${id}>`).join(', ');
          embed.spliceFields(0, 1, { name: 'اللاعبون', value: `${playerMentions || 'لا يوجد لاعبون بعد'}\nعدد اللاعبين: ${hidePlayers.length}`, inline: true });
          await gameMsg.edit({ embeds: [embed] });
          await interaction.reply({ content: 'تم خروجك من اللعبة!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'أنت لست في اللعبة!', ephemeral: true });
        }
      }
    });

    collector.on('end', async () => {
      if (hidePlayers.length < 2) {
        hideGameActive = false;
        await message.channel.send('يجب ان يكون هناك لاعبين اثنين على الأقل لبدء اللعبة.');
        return;
      }

      await message.channel.send('جاري بدء اللعبة... سيختار الجميع زر اختبائهم في نفس الوقت، لديك 30 ثانية للاختيار!');
      startAllHidePhase(message.channel);
    });
  }
});

// كل اللاعبين يختبئون في نفس الرسالة، ولا يتم تعطيل أي زر أثناء وقت الاختباء
async function startAllHidePhase(channel) {
  let chosen = {};
  let playerPickedIdx = {};
  let components = [];
  let btns = [];
  for (let i = 0; i < HIDE_BUTTONS_COUNT; i++) {
    btns.push(
      new ButtonBuilder()
        .setCustomId(`hide_in_${i}`)
        .setLabel('*')
        .setStyle(ButtonStyle.Secondary)
    );
    if ((i + 1) % 5 === 0) {
      components.push(new ActionRowBuilder().addComponents(btns));
      btns = [];
    }
  }

  const embed = new EmbedBuilder()
    .setTitle('اختبئ الآن!')
    .setDescription(`اختر زر للاختباء فيه (لن تستطيع تغييره بعد الاختيار). لديك 30 ثانية فقط!\nلن يعلم أحد أين اختبأت.`)
    .setColor('Random');

  hideMessage = await channel.send({ embeds: [embed], components });

  const buttonCollector = hideMessage.createMessageComponentCollector({
    filter: i => hidePlayers.includes(i.user.id) && !chosen[i.user.id],
    time: 30000
  });

  buttonCollector.on('collect', async interaction => {
    const playerId = interaction.user.id;
    const idx = parseInt(interaction.customId.replace('hide_in_', ''));
    if (chosen[playerId]) {
      await interaction.reply({ content: "لقد اخترت بالفعل مكان اختبائك!", ephemeral: true });
      return;
    }
    hidePlayerButtons[playerId] = idx;
    chosen[playerId] = true;
    playerPickedIdx[playerId] = idx;
    await interaction.reply({ content: `تم اختيار زر الاختباء بنجاح!`, ephemeral: true });
    // لا تعطل أي زر! تبقى الأزرار كما هي لكل اللاعبين
  });

  buttonCollector.on('end', async () => {
    // أي لاعب لم يختر زر خلال الوقت يُستبعد
    for (const playerId of hidePlayers) {
      if (!hidePlayerButtons[playerId]) {
        hideAlive[playerId] = false;
        await channel.send(`<@${playerId}> لم يختبئ في الوقت المحدد وتم استبعاده!`);
      }
    }
    // بعد انتهاء الاختباء يتم تعطيل كل الأزرار للجميع
    let updatedRows = [];
    let b = [];
    for (let i = 0; i < HIDE_BUTTONS_COUNT; i++) {
      let button = new ButtonBuilder()
        .setCustomId(`hide_in_${i}`)
        .setLabel('*')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);
      b.push(button);
      if ((i + 1) % 5 === 0) {
        updatedRows.push(new ActionRowBuilder().addComponents(b));
        b = [];
      }
    }
    await hideMessage.edit({ embeds: [embed], components: updatedRows });

    // بداية جولات البحث إذا بقي لاعبون
    if (Object.values(hideAlive).filter(x=>x).length < 2) {
      hideGameActive = false;
      await channel.send('لم يبق عدد كافٍ من اللاعبين بعد مرحلة الاختباء. انتهت اللعبة.');
      return;
    }
    await channel.send('انتهت جولة الاختباء! الآن يمكن لأي لاعب محاولة إيجاد الآخرين.');
    await startSeekPhase(channel);
  });
}

// مرحلة البحث: كل زر يتم اختياره يُعطل للجميع فوراً
async function startSeekPhase(channel) {
  let seekers = shuffleArray(hidePlayers.filter(id => hideAlive[id]));
  let seekerIndex = 0;
  let alreadyTried = {};
  let globalDisabledIndexes = [];

  async function nextSeek() {
    if (Object.values(hideAlive).filter(Boolean).length <= 1) {
      const winner = hidePlayers.find(id => hideAlive[id]);
      if (winner) {
        await channel.send(`🎉 <@${winner}> هو الفائز الأخير في لعبة الاختباء!`);
      } else {
        await channel.send('لم يبق أحد في اللعبة!');
      }
      hideGameActive = false;
      return;
    }
    // تخطي اللاعبين الذين خرجوا أو جربوا هذا الدور
    while (seekerIndex < seekers.length && (!hideAlive[seekers[seekerIndex]] || alreadyTried[seekers[seekerIndex]])) {
      seekerIndex++;
    }
    if (seekerIndex >= seekers.length) {
      seekers = shuffleArray(hidePlayers.filter(id => hideAlive[id]));
      alreadyTried = {};
      seekerIndex = 0;
      while (seekerIndex < seekers.length && (!hideAlive[seekers[seekerIndex]] || alreadyTried[seekers[seekerIndex]])) {
        seekerIndex++;
      }
      if (seekerIndex >= seekers.length) {
        setTimeout(nextSeek, 1000);
        return;
      }
    }
    const seekerId = seekers[seekerIndex];
    if (!hideAlive[seekerId]) {
      seekerIndex++;
      setTimeout(nextSeek, 100);
      return;
    }

    await channel.send(`🔎 دورك للبحث: <@${seekerId}>`);
    // أزرار البحث موحدة للجميع مع تعطيل الأزرار التي تم استخدامها بالفعل
    let components = [];
    let btns = [];
    for (let i = 0; i < HIDE_BUTTONS_COUNT; i++) {
      btns.push(
        new ButtonBuilder()
          .setCustomId(`seek_in_${i}`)
          .setLabel('*')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(globalDisabledIndexes.includes(i))
      );
      if ((i + 1) % 5 === 0) {
        components.push(new ActionRowBuilder().addComponents(btns));
        btns = [];
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('🔍 دورك للبحث')
      .setDescription(`اختر زر لتبحث فيه. إذا وجدت لاعبًا سيتم إخراجه من اللعبة!`)
      .setColor('Random');

    hideSeekMsg = await channel.send({ embeds: [embed], components });

    const filter = i => i.user.id === seekerId && i.customId.startsWith('seek_in_');
    const collector = hideSeekMsg.createMessageComponentCollector({ filter, time: 20000, max: 1 });

    collector.on('collect', async interaction => {
      const idx = parseInt(interaction.customId.replace('seek_in_', ''));
      // هل هناك لاعب مختبئ في هذا الزر؟
      let foundPlayer = null;
      for (const [pid, btnIdx] of Object.entries(hidePlayerButtons)) {
        if (hideAlive[pid] && btnIdx === idx) {
          foundPlayer = pid;
          break;
        }
      }

      if (foundPlayer) {
        hideAlive[foundPlayer] = false;
      }
      globalDisabledIndexes.push(idx);

      // تحديث أزرار البحث للجميع
      let updatedRows = [];
      let b = [];
      for (let i = 0; i < HIDE_BUTTONS_COUNT; i++) {
        let label = '*';
        let style = ButtonStyle.Secondary;
        let disabled = globalDisabledIndexes.includes(i);
        if (foundPlayer && i === idx) {
          label = '~';
          style = ButtonStyle.Danger;
        }
        b.push(
          new ButtonBuilder()
            .setCustomId(`seek_in_${i}`)
            .setLabel(label)
            .setStyle(style)
            .setDisabled(disabled)
        );
        if ((i + 1) % 5 === 0) {
          updatedRows.push(new ActionRowBuilder().addComponents(b));
          b = [];
        }
      }
      await interaction.reply({ content: foundPlayer ? `😈 وجدت <@${foundPlayer}> في هذا الزر وتم إخراجه من اللعبة!` : `❌ لم تجد أحدًا في هذا الزر.`, ephemeral: false });
      await hideSeekMsg.edit({ embeds: [embed], components: updatedRows });
      alreadyTried[seekerId] = true;
      seekerIndex++;
      setTimeout(nextSeek, 2000);
    });

    collector.on('end', async c => {
      if (!c.size) {
        alreadyTried[seekerId] = true;
        seekerIndex++;
        setTimeout(nextSeek, 1000);
      }
    });
  }

  nextSeek();
}

// أدوات مساعدة
function shuffleArray(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
    
    
    
let chairsGameActive = false;
let chairsPlayers = [];
let chairsAlive = {};
let chairsMsg = null;
let round = 1;

client26.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const gameRoleID = await gamesDB.get(`games_role_${message.guild.id}`);
  const gameRole = message.guild.roles.cache.get(gameRoleID);

  if (message.content.startsWith(`${prefix}كراسي`) && !chairsGameActive) {
    if (!gameRole || !message.member.roles.cache.has(gameRoleID)) {
      return message.reply('❌ لا تملك الصلاحية لاستخدام هذا الأمر.');
    }
    chairsGameActive = true;
    chairsPlayers = [];
    chairsAlive = {};
    round = 1;

    const joinBtn = new ButtonBuilder()
      .setCustomId('join_chairs')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🪑');
    const leaveBtn = new ButtonBuilder()
      .setCustomId('leave_chairs')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('❌');
    const row = new ActionRowBuilder().addComponents(joinBtn, leaveBtn);

    const embed = new EmbedBuilder()
      .setTitle(' لعبة الكراسي ')
      .setDescription('انقر "🪑" للانضمام! عند بدء اللعبة سيتم توزيع الكراسي وستبدأ جولات حتى يبقى فائز واحد.\n\nالرجاء الانضمام خلال 30 ثانية.')
      .setColor(0x3498db)
      .addFields({ name: 'اللاعبون', value: 'لا يوجد لاعبون بعد', inline: true });

    chairsMsg = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = chairsMsg.createMessageComponentCollector({
      filter: i => ['join_chairs', 'leave_chairs'].includes(i.customId),
      time: 30000
    });
    collector.on('collect', async interaction => {
      if (interaction.customId === 'join_chairs') {
        if (!chairsPlayers.includes(interaction.user.id)) {
          chairsPlayers.push(interaction.user.id);
          chairsAlive[interaction.user.id] = true;
          const playerMentions = chairsPlayers.map(id => `<@${id}>`).join(', ');
          embed.spliceFields(0, 1, { name: 'اللاعبون', value: `${playerMentions}\nعدد اللاعبين: ${chairsPlayers.length}`, inline: true });
          await chairsMsg.edit({ embeds: [embed], components: [row] });
          await interaction.reply({ content: 'تم انضمامك للعبة الكراسي!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'أنت بالفعل في اللعبة!', ephemeral: true });
        }
      } else if (interaction.customId === 'leave_chairs') {
        if (chairsPlayers.includes(interaction.user.id)) {
          chairsPlayers = chairsPlayers.filter(id => id !== interaction.user.id);
          delete chairsAlive[interaction.user.id];
          const playerMentions = chairsPlayers.map(id => `<@${id}>`).join(', ');
          embed.spliceFields(0, 1, { name: 'اللاعبون', value: `${playerMentions || 'لا يوجد لاعبون بعد'}\nعدد اللاعبين: ${chairsPlayers.length}`, inline: true });
          await chairsMsg.edit({ embeds: [embed], components: [row] });
          await interaction.reply({ content: 'تم خروجك من اللعبة!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'أنت لست في اللعبة!', ephemeral: true });
        }
      }
    });

    collector.on('end', async () => {
      await chairsMsg.delete().catch(() => {});
      if (chairsPlayers.length < 2) {
        chairsGameActive = false;
        await message.channel.send('يجب أن يكون هناك لاعبان على الأقل لبدء لعبة الكراسي.');
        return;
      }
      await message.channel.send(`بدأت اللعبة! عدد اللاعبين: ${chairsPlayers.length}`);
      startChairsRound(message.channel);
    });
  }
});

async function startChairsRound(channel) {
  let playersInRound = chairsPlayers.filter(id => chairsAlive[id]);
  let chairsCount = Math.max(1, playersInRound.length - 1);

  let buttons = [];
  let btnRows = [];
  for (let i = 0; i < chairsCount; i++) {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`chair_${i}`)
        .setStyle(ButtonStyle.Primary)
        .setLabel("-")
    );
    if ((i + 1) % 5 === 0 || i === chairsCount - 1) {
      btnRows.push(new ActionRowBuilder().addComponents(buttons));
      buttons = [];
    }
  }

  let chairTaken = {};          // كرسي => id اللاعب
  let playerSitting = {};       // id اللاعب => كرسي

  const gameMsg = await channel.send({ content: `جولة #${round}\nعدد اللاعبين الآن: ${playersInRound.length}\nعدد الكراسي: **${chairsCount}**\nسارعوا بالضغط على الكراسي الزرقاء! (15 ثانية)`, components: btnRows });
  const filter = i => playersInRound.includes(i.user.id) && !playerSitting[i.user.id];
  const collector = gameMsg.createMessageComponentCollector({ filter, time: 15000 });

  let roundDone = false;

  collector.on('collect', async interaction => {
    let idx = parseInt(interaction.customId.replace('chair_', ''));
    if (chairTaken[idx]) {
      await interaction.reply({ content: 'هذا الكرسي تم حجزه بالفعل!', ephemeral: true });
      return;
    }
    chairTaken[idx] = interaction.user.id;
    playerSitting[interaction.user.id] = idx;
    await interaction.reply({ content: 'جلست على الكرسي بنجاح! انتظر نهاية الجولة...', ephemeral: true });

    btnRows = btnRows.map(row => {
      row.components = row.components.map(btn =>
        btn.data.custom_id === `chair_${idx}`
          ? ButtonBuilder.from(btn).setStyle(ButtonStyle.Danger).setDisabled(true).setLabel("-")
          : btn
      );
      return row;
    });
    await gameMsg.edit({ components: btnRows });

    if (playersInRound.length === 2 && chairsCount === 1 && !roundDone) {
      roundDone = true;
      chairsAlive = {};
      chairsAlive[interaction.user.id] = true;
      await interaction.followUp({ content: `🏆 الفائز هو: <@${interaction.user.id}> مبروك!`, ephemeral: false });
      chairsGameActive = false;
      setTimeout(() => gameMsg.delete().catch(() => {}), 1000);
      return;
    }
  });

  collector.on('end', async () => {
    if (roundDone) {
      await gameMsg.delete().catch(() => {});
      return;
    }

    let outPlayers = [];
    for (const playerId of playersInRound) {
      if (!playerSitting[playerId]) {
        chairsAlive[playerId] = false;
        outPlayers.push(playerId);
      }
    }
    btnRows = btnRows.map(row => {
      row.components = row.components.map(btn =>
        new ButtonBuilder()
          .setCustomId(btn.data.custom_id)
          .setLabel("-")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
      return row;
    });
    await gameMsg.edit({ components: btnRows });
    setTimeout(() => gameMsg.delete().catch(() => {}), 1000);

    if (outPlayers.length) {
      await channel.send(`🚫 تم استبعاد: ${outPlayers.map(id => `<@${id}>`).join(', ')}`);
    }

    let aliveNow = chairsPlayers.filter(id => chairsAlive[id]);
    if (aliveNow.length === 1) {
      await channel.send(`🏆 الفائز هو: <@${aliveNow[0]}> مبروك!`);
      chairsGameActive = false;
      return;
    }
    if (aliveNow.length < 2) {
      chairsGameActive = false;
      return;
    }
    round++;
    setTimeout(() => startChairsRound(channel), 2500);
  });
}

    
    
    const films = [
  // 1-10
  { name: "Inception", image: "https://image.tmdb.org/t/p/original/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg" },
  { name: "Titanic", image: "https://image.tmdb.org/t/p/original/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg" },
  { name: "The Lion King", image: "https://image.tmdb.org/t/p/original/2bXbqYdUdNVa8VIWXVfclP2ICtT.jpg" },
  { name: "The Matrix", image: "https://image.tmdb.org/t/p/original/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
  { name: "Avatar", image: "https://image.tmdb.org/t/p/original/kyeqWdyUXW608qlYkRqosgbbJyK.jpg" },
  { name: "Forrest Gump", image: "https://image.tmdb.org/t/p/original/saHP97rTPS5eLmrLQEcANmKrsFl.jpg" },
  { name: "Gladiator", image: "https://image.tmdb.org/t/p/original/pRn3TJHbAqCAO7V1C0gR8ZsPbqS.jpg" },
  { name: "Interstellar", image: "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
  { name: "The Godfather", image: "https://image.tmdb.org/t/p/original/3bhkrj58Vtu7enYsRolD1fZdja1.jpg" },
  { name: "Avengers: Endgame", image: "https://image.tmdb.org/t/p/original/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg" },
  // 11-20
  { name: "Joker", image: "https://image.tmdb.org/t/p/original/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg" },
  { name: "Jurassic Park", image: "https://image.tmdb.org/t/p/original/9i3plLl89DHMz7mahksDaAo7HIS.jpg" },
  { name: "Finding Nemo", image: "https://image.tmdb.org/t/p/original/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg" },
  { name: "Black Panther", image: "https://image.tmdb.org/t/p/original/iP4kYk9rCz0tZr1rRdt9zBzR2hJ.jpg" },
  { name: "Frozen", image: "https://image.tmdb.org/t/p/original/mbm8k3GFhXS0ROd9AD1gqYbIFbM.jpg" },
  { name: "The Dark Knight", image: "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { name: "Toy Story", image: "https://image.tmdb.org/t/p/original/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg" },
  { name: "Up", image: "https://image.tmdb.org/t/p/original/rotQF0ocyRz0V8xh4V2uX6ELKnc.jpg" },
  { name: "Shrek", image: "https://image.tmdb.org/t/p/original/2yYP0PQjG8zVqturh1BAqu2Tixl.jpg" },
  { name: "Spider-Man", image: "https://image.tmdb.org/t/p/original/rweIrveL43TaxUN0akQEaAXL6x0.jpg" },
  // 21-30
  { name: "Iron Man", image: "https://image.tmdb.org/t/p/original/78lPtwv72eTNqFW9COBYI0dWDJa.jpg" },
  { name: "Star Wars", image: "https://image.tmdb.org/t/p/original/btTdmkgIvOi0FFip1sPuZI2oQG6.jpg" },
  { name: "Harry Potter", image: "https://image.tmdb.org/t/p/original/hziiv14OpD73u9gAak4XDDfBKa2.jpg" },
  { name: "King Kong", image: "https://image.tmdb.org/t/p/original/3T7PmvWw2hPz5Uce7v5BvnE9H6h.jpg" },
  { name: "Minions", image: "https://image.tmdb.org/t/p/original/q0R4crx2SehcEEQEkYObktdeFy.jpg" },
  { name: "Moana", image: "https://image.tmdb.org/t/p/original/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg" },
  { name: "Coco", image: "https://image.tmdb.org/t/p/original/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg" },
  { name: "Jaws", image: "https://image.tmdb.org/t/p/original/l1yltvzILaZcx2jYvc5sEMkMZzI.jpg" },
  { name: "Home Alone", image: "https://image.tmdb.org/t/p/original/9wSbe4CwObACCQvaUVhWQyLR5Vz.jpg" },
  { name: "Rocky", image: "https://image.tmdb.org/t/p/original/i5xiwdSsrecBvO7mIfAJixeEDSg.jpg" },
  // 31-40
  { name: "Frozen II", image: "https://image.tmdb.org/t/p/original/mbm8k3GFhXS0ROd9AD1gqYbIFbM.jpg" },
  { name: "Brave", image: "https://image.tmdb.org/t/p/original/1dDWuQy1PpJpUj4N7nYxWmZQYxR.jpg" },
  { name: "Ratatouille", image: "https://image.tmdb.org/t/p/original/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg" },
  { name: "Monsters, Inc.", image: "https://image.tmdb.org/t/p/original/sgheSKxZkttIe8ONsf2sWXPgip3.jpg" },
  { name: "The Avengers", image: "https://image.tmdb.org/t/p/original/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg" },
  { name: "Despicable Me", image: "https://image.tmdb.org/t/p/original/4zHJhBSY4kNZXfhTlmy2TzXD51M.jpg" },
  { name: "Aladdin", image: "https://image.tmdb.org/t/p/original/3iFm6Kz7iYoFaEcj4fLyZHAmTKA.jpg" },
  { name: "Beauty and the Beast", image: "https://image.tmdb.org/t/p/original/4yJ0v6yH9Y8rGSJ6f9pwYBEmv5w.jpg" },
  { name: "The Little Mermaid", image: "https://image.tmdb.org/t/p/original/ym1dxyOk4jFcSl4Q2zmRrA5BEEN.jpg" },
  { name: "Madagascar", image: "https://image.tmdb.org/t/p/original/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg" },
  // 41-50
  { name: "Kung Fu Panda", image: "https://image.tmdb.org/t/p/original/wWt4JYXTg5Wr3xBW2phBrMKgp3x.jpg" },
  { name: "Big Hero 6", image: "https://image.tmdb.org/t/p/original/2mxS4wUimwlLmI1xp6QW6nsLdrM.jpg" },
  { name: "Inside Out", image: "https://image.tmdb.org/t/p/original/aAmfIX3TT40zUHGcCKrlOZRKC7u.jpg" },
  { name: "Zootopia", image: "https://image.tmdb.org/t/p/original/sM33SANp9z6rXW8Itn7NnG1GOEs.jpg" },
  { name: "WALL-E", image: "https://image.tmdb.org/t/p/original/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg" },
  { name: "Finding Dory", image: "https://image.tmdb.org/t/p/original/z09QAf8WbZncbitewNk6lKYMZsh.jpg" },
  { name: "Tangled", image: "https://image.tmdb.org/t/p/original/ym7Kst6a4uodryxqbGOxmewF235.jpg" },
  { name: "Onward", image: "https://image.tmdb.org/t/p/original/f4aul3FyD3jv3v4bul1IrkWZvzq.jpg" },
  { name: "Soul", image: "https://image.tmdb.org/t/p/original/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg" },
  { name: "Encanto", image: "https://image.tmdb.org/t/p/original/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg" },
  // 51-60
  { name: "Turning Red", image: "https://image.tmdb.org/t/p/original/qsdjk9oAKSQMWs0Vt5Pyfh6O4GZ.jpg" },
  { name: "Sing", image: "https://image.tmdb.org/t/p/original/ia1gK2LMG6vAFA2ZaQKkP8JbCAV.jpg" },
  { name: "Luca", image: "https://image.tmdb.org/t/p/original/jTswp6KyDYKtvC52GbHagrZbGvD.jpg" },
  { name: "The Croods", image: "https://image.tmdb.org/t/p/original/27zvjVOtOi5ped6bHNlbm5ZbVVZ.jpg" },
  { name: "The Grinch", image: "https://image.tmdb.org/t/p/original/e4y2oHJWZP0r0Zb4q8QFZNHQ0Tz.jpg" },
  { name: "Moana", image: "https://image.tmdb.org/t/p/original/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg" },
  { name: "Frozen", image: "https://image.tmdb.org/t/p/original/mbm8k3GFhXS0ROd9AD1gqYbIFbM.jpg" },
  { name: "The Jungle Book", image: "https://image.tmdb.org/t/p/original/6hhrYz7Xn3wPHHh8v1p4u6ZQG5z.jpg" },
  { name: "Monsters University", image: "https://image.tmdb.org/t/p/original/4Aqdy3gUC2RZVQK2nEjc9X6r0hE.jpg" },
  { name: "Despicable Me 2", image: "https://image.tmdb.org/t/p/original/kQrYyZQHkwkUg2KlUDyvymj9FAp.jpg" },
  // 61-70
  { name: "Despicable Me 3", image: "https://image.tmdb.org/t/p/original/6t3YWl7hrr88lCEFlGVqW5yV99R.jpg" },
  { name: "Madagascar 2", image: "https://image.tmdb.org/t/p/original/9Qm1w4D1hW9U7w4Kp1krEISk6a2R.jpg" },
  { name: "Cars", image: "https://image.tmdb.org/t/p/original/6kNwGhyh9O2C6HUSb8XypL4kQXr.jpg" },
  { name: "Cars 2", image: "https://image.tmdb.org/t/p/original/gjAFM4xhA5vyLxxKMz38ujlUfDL.jpg" },
  { name: "Raya and the Last Dragon", image: "https://image.tmdb.org/t/p/original/lPsD10PP4rgUGiGR4CCXA6iY0QQ.jpg" },
  { name: "Finding Dory", image: "https://image.tmdb.org/t/p/original/z09QAf8WbZncbitewNk6lKYMZsh.jpg" },
  { name: "Ice Age", image: "https://image.tmdb.org/t/p/original/gLhHHZUzeseRXShoDyC4VqLgsNv.jpg" },
  { name: "Ice Age: The Meltdown", image: "https://image.tmdb.org/t/p/original/3f9Kz1qX0bAAQbE1wKp8QGQ8Lio.jpg" },
  { name: "Madagascar 3", image: "https://image.tmdb.org/t/p/original/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg" },
  { name: "The Boss Baby", image: "https://image.tmdb.org/t/p/original/kvpNZAQow5es1tSY6XW2jAZuPPG.jpg" }
];

  client26.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    if (message.content.startsWith(`${prefix}films`)) {
      // Pick a random film
      const film = films[Math.floor(Math.random() * films.length)];

      // Send image with quiz message
      await message.channel.send({
        content: "🎬 **Guess the film name (in English)!**\nاكتب اسم الفيلم بالإنجليزي، أول من يجاوب يفوز!",
        files: [film.image],
      });

      // Await message for the correct answer (case-insensitive, 30 seconds)
      const filter = (m) =>
        !m.author.bot && m.content.toLowerCase().trim() === film.name.toLowerCase();
      message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] })
        .then((collected) => {
          const winner = collected.first();
          message.channel.send(`🎉 مبروك <@${winner.author.id}>! الإجابة الصحيحة هي: **${film.name}**`);
        })
        .catch(() => {
          message.channel.send(`⏱️ انتهى الوقت! الإجابة الصحيحة كانت: **${film.name}**`);
        });
    }
  });
    
    
    
    
    
    client26.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(`اوامر`)) return;

  const embed = new EmbedBuilder()
    .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
    .setTitle('قائمة اوامر البوت')
    .setDescription(`**يرجى اختيار القسم المراد معرفة اوامره**`)
    .setTimestamp()
    .setFooter({
      text: `Requested By ${message.author.username}`,
      iconURL: message.author.displayAvatarURL({ dynamic: true })
    })
    .setColor('DarkButNotBlack');

  const btns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
    new ButtonBuilder().setCustomId('help_owner').setLabel('جماعية').setStyle(ButtonStyle.Primary).setEmoji('👑')
  );

  await message.channel.send({ embeds: [embed], components: [btns] });
});
    
    
    
  client26.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client26.gamesSlashCommands.get(interaction.commandName);
	    
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

  client26.on("interactionCreate" , async(interaction) => {
    if(interaction.customId === "help_general"){
      const embed = new EmbedBuilder()
          .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
          .setTitle('قائمة اوامر البوت')
          .addFields(
          {name : `\`${prefix}اسرع\`` , value : `بدء لعبة أسرع`},
          {name : `\`${prefix}فكك\`` , value : `بدء لعبة فكك`},
          {name : `\`${prefix}اعلام\`` , value : `بدء لعبة اعلام`},           
          {name : `\`${prefix}زر\`` , value : `بدء لعبة ازرار`},             
          {name : `\`${prefix}الوان\`` , value : `بدء لعبة الوان`},              
          {name : `\`${prefix}ايموجي\`` , value : `بدء لعبة ايموجيات`},              
          {name : `\`${prefix}كت\`` , value : `بدء لعبة كت`},             
          {name : `\`${prefix}عواصم\`` , value : `بدء لعبة عواصم`},             
          {name : `\`${prefix}رياضيات\`` , value : `بدء لعبة رياضيات`},             
          {name : `\`${prefix}جمع\`` , value : `بدء لعبة جمع كلمات`},              
          {name : `\`${prefix}مفرد\`` , value : `بدء لعبة مفردات كلمات`},            
          {name : `\`${prefix}عكس\`` , value : `بدء لعبة عكس كلمات`},             
          {name : `\`${prefix}ارقام\`` , value : `بدء لعبة ارقام`},              
          {name : `\`${prefix}تمويه\`` , value : `بدء لعبة تمويه`},              
          {name : `\`${prefix}سؤال\`` , value : `بدء لعبة اسئلة`},              
          {name : `\`${prefix}لغز\`` , value : `بدء لعبة الغاز`},
          )
          .setTimestamp()
          .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
          .setColor('DarkButNotBlack');
      const btns = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐').setDisabled(true),
          new ButtonBuilder().setCustomId('help_owner').setLabel('جماعية').setStyle(ButtonStyle.Primary).setEmoji('👑'),
      )
  
      await interaction.update({embeds : [embed] , components : [btns]})
    }else if(interaction.customId === "help_owner"){
      const embed = new EmbedBuilder()
      .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
      .setTitle('قائمة اوامر البوت')
          .addFields(
          {name : `\`/set-games-role\`` , value : `لتحديد رتبة مسؤول الألعاب`},
          {name : `\`${prefix}مافيا\`` , value : `بدء لعبة المافيا`},
          {name : `\`${prefix}روليت\`` , value : `بدء لعبة الروليت`},
          {name : `\`${prefix}xo\`` , value : `بدء لعبة xo`},
          {name : `\`${prefix}rpc\`` , value : `بدء لعبة حجرة ورقة مقص`},
          {name : `\`${prefix}غميضة\`` , value : `بدء لعبة غميضة`},


          )
      .setTimestamp()
      .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
      .setColor('DarkButNotBlack');
  const btns = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
      new ButtonBuilder().setCustomId('help_owner').setLabel('جماعية').setStyle(ButtonStyle.Primary).setEmoji('👑').setDisabled(true),
  )
  
  await interaction.update({embeds : [embed] , components : [btns]})
    }
  })

  

   client26.login(token)
   .catch(async(err) => {
    const filtered = games.filter(bo => bo != data)
			await tokens.set(`games` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
