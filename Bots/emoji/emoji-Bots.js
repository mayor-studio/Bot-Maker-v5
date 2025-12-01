  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, ChatInputCommandInteraction, StringSelectMenuBuilder, SlashCommandBuilder, PermissionsBitField  } = require("discord.js");
const { Database } = require("st.db");
const tokens = new Database("/tokens/tokens");
const emojiDB = new Database("/Json-db/Bots/emojiDB.json");
const path = require('path');
const { readdirSync } = require("fs");
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont('./Bots/emoji/handlers/DGTrikaRegular.ttf', { family: 'Trika' });

const emojis = tokens.get('emoji');
if (!emojis) return;

let theowner;

emojis.forEach(async (data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { token, clientId, owner } = data;
  theowner = owner;

  const client31 = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent],
    shards: "auto",
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
  });

  client31.commands = new Collection();

  // Register slash commands dynamically from slashcommand31
  client31.once("ready", async () => {
    try {
      const commands = [];
      const folderPath = path.join(__dirname, 'slashcommand31');
      const commandNames = new Set();

      for (const folder of readdirSync(folderPath).filter(f => !f.includes("."))) {
        for (const file of readdirSync(`${folderPath}/${folder}`).filter(f => f.endsWith(".js"))) {
          const command = require(`${folderPath}/${folder}/${file}`);
          if (command && command.data && !commandNames.has(command.data.name)) {
            commands.push(command.data.toJSON());
            client31.commands.set(command.data.name, command);
            commandNames.add(command.data.name);
          }
        }
      }

      const rest = new REST({ version: '10' }).setToken(token);
      await rest.put(Routes.applicationCommands(client31.user.id), { body: commands });
      console.log(`[EMOJI BOT] Slashcommands registered for ${client31.user.tag}`);
    } catch (error) {
      console.error(error);
    }
  });

  // Handle slash command execution
 client31.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client31.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "❌ An error occurred while executing the command!", ephemeral: true });
        } else {
            await interaction.reply({ content: "❌ An error occurred while executing the command!", ephemeral: true });
        }
    }
});

  

  // Subscription check code stays the same, just change store->emoji
  client31.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`emoji`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss && thiss.timeleft <= 0) {
        const user = await client31.users.cache.get(owner) || await client31.users.fetch(owner);
        const embed = new EmbedBuilder()
          .setDescription(`**مرحبا <@${thiss.owner}>، لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع: سيستم إيموجي\nالاشتراك انتهى**`)
          .setColor("DarkerGrey")
          .setTimestamp();
        await user.send({ embeds: [embed] }).catch(console.error);

        const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
        await tokens.set(`emoji`, filtered);
        await client31.destroy().then(() => console.log(`${clientId} Ended`));
      }
    }, 60000); // كل دقيقة
  });
 
    
   client31.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;

  const emojiChannelId = emojiDB.get(`emoji_channel_${message.guild.id}`);
  if (!emojiChannelId || message.channel.id !== emojiChannelId) return;

  const { parseEmoji } = require("discord.js");
  const addedEmojis = [];
  const failed = [];

  // Helper to check image extension
  const isImage = url => {
    if (!url) return false;
    const ext = url.split('.').pop().toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
  };

  // 1. Handle custom discord emojis in message content
  const customEmojiRegex = /<(a)?:(\w+):(\d{17,19})>/g;
  let match;
  while ((match = customEmojiRegex.exec(message.content)) !== null) {
    // match[1] is "a" if animated, match[2] is name, match[3] is id
    const emojiUrl = `https://cdn.discordapp.com/emojis/${match[3]}.${match[1] === "a" ? "gif" : "png"}`;
    const emojiName = `${match[2]}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    try {
      const emoji = await message.guild.emojis.create({ attachment: emojiUrl, name: emojiName });
      addedEmojis.push(emoji);
    } catch (error) {
      failed.push(`<${match[1] ? "a" : ""}:${match[2]}:${match[3]}>`);
    }
  }

  // 2. Handle direct image links in the message content
  const words = message.content.split(/\s+/);
  for (const word of words) {
    if (isImage(word)) {
      const emojiName = `emoji_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      try {
        const emoji = await message.guild.emojis.create({ attachment: word, name: emojiName });
        addedEmojis.push(emoji);
      } catch (error) {
        failed.push(word);
      }
    }
  }

  // 3. Handle attached images
  if (message.attachments && message.attachments.size > 0) {
    for (const attachment of message.attachments.values()) {
      if (isImage(attachment.url)) {
        const emojiName = `emoji_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        try {
          const emoji = await message.guild.emojis.create({ attachment: attachment.url, name: emojiName });
          addedEmojis.push(emoji);
        } catch (error) {
          failed.push(attachment.url);
        }
      }
    }
  }

// Response to user
const response = [];
if (addedEmojis.length)
  response.push(`${addedEmojis.length} emojis have been added: ${addedEmojis.map(e => `<:${e.name}:${e.id}>`).join(', ')}`);
if (failed.length)
  response.push(`❌ Failed to add: ${failed.join(', ')}`);
if (response.length)
  await message.reply({ content: response.join('\n') });
   });

    
    client31.on("interactionCreate", async (interaction) => {
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
        { name: `\`/change-avatar\``, value: `To change the bot avatar` },
        { name: `\`/change-avatar\``, value: `To change the bot username` },
        { name: `\`/set-emoji-channel\``, value: `Set the emoji adding channel` },
        { name: `\`/remove-emoji-channel\``, value: `Remove the emoji adding channel` },
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
    
  client31.login(token)
    .catch(async (err) => {
      const filtered = emojis.filter(bo => bo != data);
      await tokens.set(`emoji`, filtered);
      console.log(`${clientId} Not working and removed `);
    });
});