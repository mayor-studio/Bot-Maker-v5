const { Client, Collection, AuditLogEvent, discord, GatewayIntentBits, Partials, EmbedBuilder, ApplicationCommandOptionType, Events, ActionRowBuilder, ButtonBuilder, MessageAttachment, ButtonStyle, Message, AttachmentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle  } = require("discord.js");
const { Database } = require("st.db")
const twitterDB = new Database("/Json-db/Bots/twitterDB.json")
const tokens = new Database("/tokens/tokens")
const { PermissionsBitField } = require('discord.js')
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas'); // <-- Add this line
const accountsDB = new Database("./Json-db/Bots/twitterAccountsDB.json"); // Add this for account storage
const statsDB = new Database("./Json-db/Bots/twitterStatsDB.json");
const followsDB = new Database("./Json-db/Bots/twitterFollowsDB.json"); // For following system

let twitter = tokens.get('twitter')
if(!twitter) return;
const path = require('path');
const { readdirSync } = require("fs");
let theowner;
twitter.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix, token, clientId, owner } = data;
  theowner = owner
  const client29 = new Client({ intents: 131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,] });
  client29.commands = new Collection();
  require(`./handlers/events`)(client29);
  client29.events = new Collection();
  client29.setMaxListeners(1000)

  require(`../../events/requireBots/twitter-commands`)(client29);
  const rest = new REST({ version: '10' }).setToken(token);
  client29.on("ready", async () => {

    try {
      await rest.put(
        Routes.applicationCommands(client29.user.id),
        { body: twitterSlashCommands },
      );

    } catch (error) {
      console.error(error)
    }

  });
  client29.once('ready', () => {
    client29.guilds.cache.forEach(guild => {
      guild.members.fetch().then(members => {
        if (members.size < 10) {
          console.log(`twitter bot : Guild: ${guild.name} has less than 10 members`);
        }
      }).catch(console.error);
    });
  });
  //------------- التحقق من وقت البوت --------------//
  client29.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`twitter`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client29.users.cache.get(owner) || await client29.users.fetch(owner);
          const embed = new EmbedBuilder()
            .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : بلاك ليست\nالاشتراك انتهى**`)
            .setColor("DarkerGrey")
            .setTimestamp();
          await user.send({ embeds: [embed] }).catch((err) => { console.log(err) })

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`twitter`, filtered);
          await client29.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
  require(`./handlers/events`)(client29)
  const folderPath = path.join(__dirname, 'slashcommand29');
  client29.twitterSlashCommands = new Collection();
  const twitterSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("twitter commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
  )) {
    for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
    )) {
      let command = require(`${folderPath}/${folder}/${file}`);
      if (command) {
        twitterSlashCommands.push(command.data.toJSON());
        client29.twitterSlashCommands.set(command.data.name, command);
        if (command.data.name) {
          table.addRow(`/${command.data.name}`, "🟢 Working");
        } else {
          table.addRow(`/${command.data.name}`, "🔴 Not Working");
        }
      }
    }
  }

  const folderPath2 = path.join(__dirname, 'slashcommand29');

  for (let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
    for (let fiee of (readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
      const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
    }
  }

  require(`../../events/requireBots/twitter-commands`)(client29)
  require("./handlers/events")(client29)

  for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
    const event = require(`./events/${file}`);
    if (event.once) {
      client29.once(event.name, (...args) => event.execute(...args));
    } else {
      client29.on(event.name, (...args) => event.execute(...args));
    }
  }

const tweetState = {};
const TWEET_CACHE_KEY = "tweetCache";

restoreTweetCache();

function saveTweetCache() {
  // Only store minimal info necessary for button reactivation
  const minimalCache = {};
  for (const [id, state] of Object.entries(tweetState)) {
    minimalCache[id] = {
      likes: Array.from(state.likes || []),
      retweets: Array.from(state.retweets || []),
      tweetData: state.tweetData,
    };
  }
  twitterDB.set(TWEET_CACHE_KEY, minimalCache);
}

function restoreTweetCache() {
  const cache = twitterDB.get(TWEET_CACHE_KEY) || {};
  for (const [id, obj] of Object.entries(cache)) {
    tweetState[id] = {
      likes: new Set(obj.likes || []),
      retweets: new Set(obj.retweets || []),
      tweetData: obj.tweetData,
    };
  }
}

// --- Helper: Get Followers Count --- //
function getFollowersCount(guildId, userId) {
  const key = `${guildId}_${userId}`;
  const followers = followsDB.get(key) || [];
  return followers.length;
}

// --- Helper: Build Tweet Row (for button persistence) --- //
function buildTweetRow(guildId, userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('like').setLabel('Like').setStyle(ButtonStyle.Secondary).setEmoji('❤️'),
    new ButtonBuilder().setCustomId('retweet').setLabel('Retweet').setStyle(ButtonStyle.Success).setEmoji('🔁'),
    new ButtonBuilder().setCustomId(`follow_${guildId}_${userId}`).setLabel('Follow').setStyle(ButtonStyle.Primary).setEmoji('👥')
  );
}

// --- Message Create --- //
client29.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;

  // Set tweets channel
  if (message.content.startsWith(`${prefix}tweetchannel`)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You need administrator permission to use this command.");
    }
    const channel = message.mentions.channels.first();
    if (!channel) return message.reply("❌ Please mention a channel.\nExample: `!tweetchannel #tweets`");
    await twitterDB.set(`tweet_channel_${message.guild.id}`, channel.id);
    return message.reply(`✅ Set <#${channel.id}> as the tweets channel!`);
  }

  // Twitter panel with 4 buttons
  if (message.content.startsWith(`${prefix}twitterpanel`)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You need to be an administrator to use this command.");
    }
    const embed = new EmbedBuilder()
      .setTitle('Twitter Bot Panel')
      .setDescription('Use the buttons below to interact with your Twitter bot account!')
      .setColor('Blue');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('create_account').setLabel('Create Account').setStyle(ButtonStyle.Success).setEmoji('🆕'),
      new ButtonBuilder().setCustomId('show_account').setLabel('Show Account').setStyle(ButtonStyle.Primary).setEmoji('👤'),
      new ButtonBuilder().setCustomId('send_tweet').setLabel('Send Tweet').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
      new ButtonBuilder().setCustomId('delete_account').setLabel('Delete Account').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
    );
    await message.channel.send({ embeds: [embed], components: [row] });
    await message.reply("✅ Twitter panel sent.");
  }

  // Text profile command (!profile or !profile @user)
  if (message.content.startsWith(`${prefix}profile`)) {
    let member = message.mentions.members.first() || message.member;
    const userId = member.user.id;
    const guildId = message.guild.id;
    const key = `${guildId}_${userId}`;
    const account = accountsDB.get(key);
    const stats = statsDB.get(key) || { likes: 0, retweets: 0 };
    const followers = followsDB.get(key) || [];
    if (!account) {
      return message.reply("🚫 That user does not have a Twitter account.");
    }
    let embed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle(`${account.displayName} (${followers.length} followers)`)
      .setThumbnail(account.avatar)
      .addFields(
        { name: "Username", value: `@${account.username}`, inline: true },
        { name: "Created", value: `<t:${Math.floor(account.createdAt/1000)}:R>`, inline: true },
        { name: "Likes Received", value: `${stats.likes}`, inline: true },
        { name: "Retweets Received", value: `${stats.retweets}`, inline: true },
        { name: "Followers", value: `${followers.length}`, inline: true },
      );
    await message.reply({ embeds: [embed] });
  }
});

// --- INTERACTION CREATE --- //
client29.on('interactionCreate', async interaction => {
  // ==== CREATE ACCOUNT ====
  if (interaction.isButton() && interaction.customId === 'create_account') {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const key = `${guildId}_${userId}`;
    if (accountsDB.get(key)) {
      return interaction.reply({ content: "🚫 You already have a Twitter account.", ephemeral: true });
    }
    accountsDB.set(key, {
      id: userId,
      displayName: interaction.member.displayName,
      username: interaction.user.username,
      avatar: interaction.user.displayAvatarURL({ extension: 'png', size: 128 }),
      createdAt: Date.now()
    });
    statsDB.set(key, { likes: 0, retweets: 0 }); // Initialize stats
    followsDB.set(key, []); // Initialize followers
    return interaction.reply({ content: "✅ Twitter account created successfully!", ephemeral: true });
  }

  if (interaction.isButton() && interaction.customId === 'show_account') {
  const userId = interaction.user.id;
  const guildId = interaction.guild.id;
  const key = `${guildId}_${userId}`;
  const account = accountsDB.get(key);
  const stats = statsDB.get(key) || { likes: 0, retweets: 0 };
  const followers = followsDB.get(key) || [];
  if (!account) {
    return interaction.reply({ content: "🚫 You don't have a Twitter account yet. Use 'Create Account'!", ephemeral: true });
  }
  // Profile card canvas
  const width = 700, height = 310;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "#15202b";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#192734";
  ctx.fillRect(20, 20, width - 40, height - 40);
  // Avatar
  const avatar = await loadImage(account.avatar);
  ctx.save();
  ctx.beginPath();
  ctx.arc(60, 70, 32, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 28, 38, 64, 64);
  ctx.restore();
  // Name and handle (with followers count)
  ctx.font = "bold 26px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`${account.displayName} (${followers.length} followers)`, 110, 65);
  ctx.font = "20px Arial";
  ctx.fillStyle = "#8899a6";
  ctx.fillText("@" + account.username, 110, 95);
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Account created: " + new Date(account.createdAt).toLocaleString(), 40, height - 110);

  // Stats
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#1da1f2";
  ctx.fillText(`❤️ Likes Received: ${stats.likes}`, 40, height - 70);
  ctx.fillText(`🔁 Retweets Received: ${stats.retweets}`, 340, height - 70);

  // (REMOVE this line: ctx.fillStyle = "#43b581"; ctx.fillText(`👥 Followers: ${followers.length}`, 40, height - 30);)

  const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: "profile.png" });
  return interaction.reply({
    content: `👤 **Here is your Twitter account!**`,
    files: [attachment],
    ephemeral: true
  });
}

  // ==== DELETE ACCOUNT ====
  if (interaction.isButton() && interaction.customId === 'delete_account') {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const key = `${guildId}_${userId}`;
    const account = accountsDB.get(key);
    if (!account) {
      return interaction.reply({ content: "🚫 You have no account to delete.", ephemeral: true });
    }
    accountsDB.delete(key);
    statsDB.delete(key);
    followsDB.delete(key);
    // Remove from all followers lists
    for (const k of followsDB.all()) {
      let arr = followsDB.get(k.ID) || [];
      if (arr.includes(userId)) {
        arr = arr.filter(x => x !== userId);
        followsDB.set(k.ID, arr);
      }
    }
    return interaction.reply({ content: "🗑️ Your Twitter account was deleted!", ephemeral: true });
  }

  // ==== SEND TWEET (open modal) ====
  if (interaction.isButton() && interaction.customId === 'send_tweet') {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const key = `${guildId}_${userId}`;
    if (!accountsDB.get(key)) {
      return interaction.reply({ content: "🚫 You need to create a Twitter account first.", ephemeral: true });
    }
    const modal = new ModalBuilder()
      .setCustomId('tweet_modal')
      .setTitle('Send a Tweet');
    const tweetInput = new TextInputBuilder()
      .setCustomId('tweet_content')
      .setLabel('Your tweet')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(280)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(tweetInput));
    return interaction.showModal(modal);
  }

  // ==== MODAL: Handle new tweet with canvas/buttons ====
  if (interaction.isModalSubmit() && interaction.customId === 'tweet_modal') {
    const tweetContent = interaction.fields.getTextInputValue('tweet_content');
    const channelId = await twitterDB.get(`tweet_channel_${interaction.guild.id}`) || interaction.channel.id;
    const tweetChannel = interaction.guild.channels.cache.get(channelId) || interaction.channel;
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const key = `${guildId}_${userId}`;
    const account = accountsDB.get(key);
    if (!account) {
      return interaction.reply({ content: "🚫 You need to create a Twitter account first.", ephemeral: true });
    }
    const tweetData = {
      displayName: account.displayName,
      username: account.username,
      avatarURL: account.avatar,
      content: tweetContent,
      guildId,
      userId // so we know the tweet's owner
    };
    const likes = 0, retweets = 0;
    const tweetImageBuffer = await renderTweetCanvas({ ...tweetData, likes, retweets, followers: getFollowersCount(guildId, userId) });
    const attachment = new AttachmentBuilder(tweetImageBuffer, { name: "tweet.png" });
    const row = buildTweetRow(guildId, userId);
    const sentMsg = await tweetChannel.send({
      content: `**${account.displayName} (${getFollowersCount(guildId, userId)} followers)** tweeted:`,
      files: [attachment],
      components: [row]
    });
    tweetState[sentMsg.id] = { likes: new Set(), retweets: new Set(), tweetData };
    saveTweetCache();
    return interaction.reply({ content: "✅ Tweet sent!", ephemeral: true });
  }

  // ==== BUTTON: Like/Retweet/Follow logic ====
  if (interaction.isButton()) {
    const { message, user, customId } = interaction;
    // Find tweet (may need to rehydrate on restart)
    let tweet = tweetState[message.id];
    // If not in memory, try to restore from persistent storage
    if (!tweet) {
      const cache = twitterDB.get(TWEET_CACHE_KEY) || {};
      const obj = cache[message.id];
      if (obj) {
        tweet = {
          likes: new Set(obj.likes || []),
          retweets: new Set(obj.retweets || []),
          tweetData: obj.tweetData,
        };
        tweetState[message.id] = tweet;
      }
    }
    // LIKE or RETWEET
    if (customId === 'like' || customId === 'retweet') {
      if (!tweet) return interaction.reply({ content: "Tweet state not found.", ephemeral: true });
      if (customId === 'like') {
        if (tweet.likes.has(user.id)) return interaction.reply({ content: "You already liked this tweet!", ephemeral: true });
        tweet.likes.add(user.id);
        const key = `${tweet.tweetData.guildId}_${tweet.tweetData.userId}`;
        const stats = statsDB.get(key) || { likes: 0, retweets: 0 };
        stats.likes += 1;
        statsDB.set(key, stats);
      } else if (customId === 'retweet') {
        if (tweet.retweets.has(user.id)) return interaction.reply({ content: "You already retweeted this tweet!", ephemeral: true });
        tweet.retweets.add(user.id);
        const key = `${tweet.tweetData.guildId}_${tweet.tweetData.userId}`;
        const stats = statsDB.get(key) || { likes: 0, retweets: 0 };
        stats.retweets += 1;
        statsDB.set(key, stats);
      }
      // Update persistent cache after interaction
      saveTweetCache();
      // Update followers count for canvas
      const followersCount = getFollowersCount(tweet.tweetData.guildId, tweet.tweetData.userId);
      const buffer = await renderTweetCanvas({
        ...tweet.tweetData,
        likes: tweet.likes.size,
        retweets: tweet.retweets.size,
        followers: followersCount
      });
      const newAttachment = new AttachmentBuilder(buffer, { name: "tweet.png" });
      await message.edit({
        files: [newAttachment],
        components: [buildTweetRow(tweet.tweetData.guildId, tweet.tweetData.userId)]
      });
      return interaction.reply({ content: "✅ Updated!", ephemeral: true });
    }
    // FOLLOW (customId: follow_guildId_userId)
    if (customId.startsWith('follow_')) {
      const [, guildId, targetUserId] = customId.split('_');
      if (user.id === targetUserId) return interaction.reply({ content: "You can't follow yourself!", ephemeral: true });
      const key = `${guildId}_${targetUserId}`;
      const followers = followsDB.get(key) || [];
      if (followers.includes(user.id)) {
        return interaction.reply({ content: "You already follow this user.", ephemeral: true });
      }
      followers.push(user.id);
      followsDB.set(key, followers);
      // Update tweet image and row for all related messages
      for (const [msgId, tweet] of Object.entries(tweetState)) {
        if (tweet.tweetData.guildId === guildId && tweet.tweetData.userId === targetUserId) {
          const followersCount = getFollowersCount(guildId, targetUserId);
          const buffer = await renderTweetCanvas({
            ...tweet.tweetData,
            likes: tweet.likes.size,
            retweets: tweet.retweets.size,
            followers: followersCount
          });
          try {
            const chan = await client29.guilds.cache.get(guildId)?.channels.fetch(twitterDB.get(`tweet_channel_${guildId}`));
            if (chan) {
              const msg = await chan.messages.fetch(msgId).catch(() => null);
              if (msg) {
                await msg.edit({
                  files: [new AttachmentBuilder(buffer, { name: "tweet.png" })],
                  components: [buildTweetRow(guildId, targetUserId)]
                });
              }
            }
          } catch (e) {}
        }
      }
      saveTweetCache();
      return interaction.reply({ content: `👥 You are now following <@${targetUserId}>!`, ephemeral: true });
    }
  }
});

// --- CANVAS RENDER FUNCTION ---
async function renderTweetCanvas({ displayName, username, avatarURL, content, likes, retweets, followers }) {
  const width = 700, height = 240;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "#15202b"; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#192734"; ctx.fillRect(20, 20, width - 40, height - 40);
  const avatar = await loadImage(avatarURL);
  ctx.save(); ctx.beginPath();
  ctx.arc(60, 70, 32, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
  ctx.drawImage(avatar, 28, 38, 64, 64); ctx.restore();
  ctx.font = "bold 26px Arial"; ctx.fillStyle = "#fff";
  ctx.fillText(`${displayName} (${followers || 0} followers)`, 110, 65);
  ctx.font = "20px Arial"; ctx.fillStyle = "#8899a6";
  ctx.fillText("@" + username, 110, 95);
  ctx.font = "22px Arial"; ctx.fillStyle = "#fff";
  drawMultilineText(ctx, content, 40, 120, width - 80, 28);
  ctx.font = "20px Arial"; ctx.fillStyle = "#8899a6";
  ctx.fillText(`❤️ ${likes}`, width - 180, height - 40);
  ctx.fillText(`🔁 ${retweets}`, width - 100, height - 40);
  return canvas.toBuffer('image/png');
}

function drawMultilineText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
    
  client29.login(token)
    .catch(async (err) => {
      const filtered = twitter.filter(bo => bo != data)
      await tokens.set(`twitter`, filtered)
      console.log(`${clientId} Not working and removed `)
    });
})