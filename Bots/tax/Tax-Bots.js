
const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, PermissionFlagsBits } = require("discord.js");
const { Database } = require("st.db")
const taxDB = new Database("/Json-db/Bots/taxDB.json")
const payDB = new Database("/Json-db/Bots/payDB.json");
const tokens = new Database("/tokens/tokens")
const { PermissionsBitField } = require('discord.js')
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let tax = tokens.get('tax')
if(!tax) return;

const path = require('path');
const { readdirSync } = require("fs");
let theowner;
tax.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client3 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client3.commands = new Collection();
  require(`./handlers/events`)(client3);
  client3.events = new Collection();
  require(`../../events/requireBots/Tax-Commands`)(client3);
  const rest = new REST({ version: '10' }).setToken(token);
  client3.setMaxListeners(1000)

  client3.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client3.user.id),
          { body: taxSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client3.once('ready', () => {
    client3.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`tax bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client3.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`tax`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client3.users.cache.get(owner) || await client3.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : ضريبة\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`tax`, filtered);
          await client3.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`../tax/handlers/events`)(client3)

  const folderPath = path.join(__dirname, 'slashcommand3');
  client3.taxSlashCommands = new Collection();
  const taxSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("tax commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          taxSlashCommands.push(command.data.toJSON());
          client3.taxSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand3');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/Tax-Commands`)(client3)
require('./handlers/tax4bot')(client3)
require("./handlers/events")(client3)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client3.once(event.name, (...args) => event.execute(...args));
	} else {
		client3.on(event.name, (...args) => event.execute(...args));
	}
	}


const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

client3.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  let roomid = taxDB.get(`tax_room_${message.guild.id}`);
  let taxLine = taxDB.get(`tax_line_${message.guild.id}`);

  if (!roomid || message.channel.id !== roomid) return;

  let input = message.content;
  if (input.endsWith("k") || input.endsWith("K")) input = input.replace(/k/gi, "") * 1000;
  else if (input.endsWith("m") || input.endsWith("M")) input = input.replace(/m/gi, "") * 1000000;

  if (isNaN(input) || input == 0) return message.delete();

  let amount = parseInt(input);                  // Original amount
  let tax = Math.floor(amount * 20 / 19 + 1);    // Taxed amount
  let full = Math.floor(tax * 20 / 19 + 1);      // Full amount with 2x tax
  let mediatorFee = Math.floor(amount * 0.02);   // Mediator fee (2%)
  let total = Math.floor(full + mediatorFee);    // Full with mediator

  let result = `🪙 Amount: **${amount}**
📊 Tax: **${tax - amount}**
💰 Total with Tax: **${tax}**`;

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`copy_${tax}`)
      .setLabel(`Copy`)
      .setStyle(ButtonStyle.Primary)
  );

  await message.reply({ content: result, components: [buttons] });

  if (taxLine) {
    await message.channel.send({ files: [taxLine] });
  }
});

    client3.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith('copy_')) {
    const amount = interaction.customId.split('_')[1];
    await interaction.reply({ content: `${amount}`, ephemeral: true });
  }
});



client3.on('messageCreate', async message => {
    if (message.content.startsWith(`${prefix}tax`) || message.content.startsWith('ضريبة')) {
        const args = message.content.startsWith(`${prefix}tax`) 
            ? message.content.slice(`${prefix}tax`.length).trim() 
            : message.content.slice('ضريبة'.length).trim();

        let number = args;
        if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
        else if (number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
        else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
        else if (number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;

        let number2 = parseFloat(number);

        if (isNaN(number2)) {
            return message.reply('يرجى إدخال رقم صحيح بعد الأمر');
        }

        let tax = Math.floor(number2 * (20) / (19) + 1); // الضريبة
        let tax2 = Math.floor(tax - number2); // المبلغ مع الضريبة

        await message.reply(`${tax}`);
    }
});


client3.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  // Fetch the PayPal tax channel configuration from the database
  const taxChannelId = await payDB.get(`${message.guild.id}_paypal_tax_channel`);
  if (!taxChannelId || message.channel.id !== taxChannelId) return;

  // Check if the message contains a valid number
  const amount = parseFloat(message.content);
  if (isNaN(amount)) {
    return message.reply('❌ Please enter a valid amount.');
  }

  // PayPal fee structure
  const percentageFee = 2.9 / 100; // 2.9%
  const fixedFee = 0.30; // $0.30 fixed fee

  // Calculate the PayPal fee
  const fee = amount * percentageFee + fixedFee;
  const totalWithFee = amount + fee;

  // Reply with the tax details
  return message.reply(`💰 **PayPal Fee Calculation**:
  - **Amount:** $${amount.toFixed(2)}
  - **Fee (2.9% + $0.30):** $${fee.toFixed(2)}
  - **Total with Fee:** $${totalWithFee.toFixed(2)}`);
});


  client3.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client3.taxSlashCommands.get(interaction.commandName);
	    
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
			return console.log("🔴 | error in tax bot" , error)
		}
    }
  } )





   client3.login(token)
   .catch(async(err) => {
    const filtered = tax.filter(bo => bo != data)
			await tokens.set(`tax` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
