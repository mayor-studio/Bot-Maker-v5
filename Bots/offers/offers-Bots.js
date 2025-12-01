  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, Attachment, ChatInputCommandInteraction, StringSelectMenuBuilder, SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const tokens = new Database("/tokens/tokens");
const offersDB = new Database("/Json-db/Bots/offersDB.json");
const path = require('path');
const { readdirSync } = require("fs");

const offers = tokens.get('offers');
if (!offers) return;

let theowner;

offers.forEach(async (data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { token, clientId, owner } = data;
  theowner = owner;

  const client28 = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent],
    shards: "auto",
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
  });

  client28.commands = new Collection();
  require(`./handlers/events`)(client28);
  require('./handlers/offers')(client28);
  client28.events = new Collection();
  require(`../../events/requireBots/offers-commands`)(client28);

  const rest = new REST({ version: '10' }).setToken(token);
  client28.setMaxListeners(1000);

  client28.on("ready", async () => {
    try {
      const folderPath = path.join(__dirname, 'slashcommand28');
      const offersSlashCommands = [];
      const ascii = require("ascii-table");
      const table = new ascii("offers commands").setJustify();
      
      for (let folder of readdirSync(folderPath).filter((folder) => !folder.includes("."))) {
        for (let file of readdirSync(`${folderPath}/${folder}`).filter((f) => f.endsWith(".js"))) {
          let command = require(`${folderPath}/${folder}/${file}`);
          if (command) {
            offersSlashCommands.push(command.data.toJSON());
            client28.commands.set(command.data.name, command);
            table.addRow(`/${command.data.name}`, "🟢 Working");
          }
        }
      }

      await rest.put(Routes.applicationCommands(client28.user.id), { body: offersSlashCommands });
    //  console.log(table.toString());
    } catch (error) {
      console.error(error);
    }

    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`offers`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss && thiss.timeleft <= 0) {
        const user = await client28.users.cache.get(owner) || await client28.users.fetch(owner);
        const embed = new EmbedBuilder()
          .setDescription(`**مرحبا <@${thiss.owner}>، لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع: عروض\nالاشتراك انتهى**`)
          .setColor("DarkerGrey")
          .setTimestamp();
        await user.send({ embeds: [embed] }).catch(console.error);

        const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
        await tokens.set(`offers`, filtered);
        await client28.destroy().then(() => console.log(`${clientId} Ended`));
      }
    }, 60000); // التحقق كل دقيقة
  });

client28.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const chanList = await offersDB.get(`offers_room_${message.guild.id}`) || [];
  const roleId = await offersDB.get(`offers_role_${message.guild.id}`);
  const roomLink = await offersDB.get(`offers_roomlink_${message.guild.id}`);
  const offersMode = await offersDB.get(`offers_mode_${message.guild.id}`) || 'link';
  const attachments = message.attachments.map(att => att.url);

  if (chanList.includes(message.channel.id)) {
    const deleteButton = new ButtonBuilder()
      .setCustomId(`deloff_${message.author.id}`)
      .setLabel('Delete Offer')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Secondary);

    const profileButton = new ButtonBuilder()
      .setLabel('Seller Profile')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/users/${message.author.id}`);

    const row = new ActionRowBuilder();

    if (offersMode === 'link') {
      const orderButton = new ButtonBuilder()
        .setLabel('Order Now')
        .setURL(roomLink)
        .setStyle(ButtonStyle.Link);
      row.addComponents(orderButton);
    } else if (offersMode === 'custom') {
      const customOrderButton = new ButtonBuilder()
        .setCustomId(`ord_${message.author.id}`)
        .setLabel('Order Now')
        .setEmoji('🛒')
        .setStyle(ButtonStyle.Success);
      row.addComponents(customOrderButton);
    }

    row.addComponents(deleteButton, profileButton);

    const sentMessage = await message.channel.send({
      content: `${message.content}\n\nOffer By: ||<@${message.author.id}>||\nFor: ||<@&${roleId}>||`,
      components: [row],
      files: attachments
    }).catch(console.error);

    const line = await offersDB.get(`line_${message.guild.id}`);
    if (line) {
      await message.channel.send({ files: [line] }).catch(console.error);
    }

    return message.delete();
  }
});


client28.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    if (interaction.customId.startsWith('ord_')) {
        const userId = interaction.customId.split('_')[1];
        
        const confirmButton = new ButtonBuilder()
            .setCustomId(`aord_${userId}`)
            .setLabel('تأكيد')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cord')
            .setLabel('الغاء')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Secondary);
            
        const row = new ActionRowBuilder()
            .addComponents(confirmButton, cancelButton);
            
        await interaction.reply({
            content: 'هل أنت متأكد من فتح تكت لطلب هذا المنتج ؟',
            components: [row],
            ephemeral: true
        });
    }
    
if (interaction.customId === 'cord') {
    await interaction.update({
        content: 'تم الغاء الطلب بنجاح',
        components: [] 
    });
    }
        });
client28.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client28.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client28);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ An error occurred while executing this command.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "❌ An error occurred while executing this command.",
        ephemeral: true,
      });
    }
  }
});

    client28.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "help_menu") return;

  const selected = interaction.values[0];

  let embed;

  if (selected === "general") {
    embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTitle("Bot Commands Menu")
      .setDescription("**There are currently no commands in this category.**")
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setColor("DarkButNotBlack");
  } else if (selected === "owner") {
    embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTitle("Bot Commands Menu")
      .addFields(
{ name: `\`/setup\``, value: `Set up the offer system` },
{ name: `\`/set-line\``, value: `Set the offer separator line` },
{ name: `\`/set-offers-room\``, value: `Add a channel for offers` },
{ name: `\`/remove-offers-room\``, value: `Remove an offer channel` },
{ name: `\`/set-ticket-description\``, value: `Set the description shown in ticket` },
{ name: `\`/change-avatar\``, value: `Change the bot's avatar` },
{ name: `\`/change-name\``, value: `Change the bot's username` },


      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setColor("DarkButNotBlack");
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("help_menu")
    .setPlaceholder("Select a command category")
    .addOptions([
      {
        label: "General",
        value: "general",
        description: "General commands",
        emoji: "🌐",
        default: selected === "general",
      },
      {
        label: "Owner",
        value: "owner",
        description: "Owner-only commands",
        emoji: "👑",
        default: selected === "owner",
      },
    ]);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.update({ embeds: [embed], components: [row] });
});
    
    
  client28.login(token)
    .catch(async (err) => {
      const filtered = offers.filter(bo => bo != data);
      await tokens.set(`offers`, filtered);
      console.log(`${clientId} Not working and removed `);
    });
});
