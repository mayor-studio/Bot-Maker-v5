const { ButtonStyle, ButtonBuilder, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const config = require("./config");
const has_play = new Map();

async function mafia_command(message) {
  if (has_play.get(message.guild.id)) return message.reply({ content: `❌ هناك بالفعل لعبة فعالة في هذا السيرفر!` });
  let time = 30000;
  let data = {
    author: message.author.id,
    players: [],
    start_in: Date.now() + time,
    type: "mafia"
  };

  let embed = new EmbedBuilder()
    .setColor("Yellow")
    .setTitle("مافيا")
    .setDescription(`
__طريقة اللاعب:__
**1-** شارك في اللعبة بالضغط على الزر أدناه
**2-** سيتم توزيع اللاعبين على مافيا ، مواطنين وأيضا طبيب واحد بشكل عشوائي
**3-** في كل جولة ، ستصوت المافيا لطرد شخص واحد من اللعبة. ثم سيصوت الطبيب لحماية شخص واحد من المافيا. وفي النهاية الجولة ، سيحاول جميع اللاعبين التصويت وطرد إحدى أعضاء المافيا
**4-** إذا تم طرد جميع المافيا ، سيفوز المواطنين ، وإذا كانت المافيا تساوي عدد المواطنين ، فستفوز المافيا.

__ستبدأ اللعبة خلال__: **<t:${Math.floor(data.start_in / 1000)}:R>**
__اللاعبين المشاركين:__ **(${data.players.length}/15)**
${data.players.map(p => `- <@${p.id}>`).join("\n")}
`)
    .setTimestamp(Date.now() + time);

  let row = new ActionRowBuilder()
    .addComponents(
      createButton("SUCCESS", `join_mafia`, `دخول إلى اللعبة`),
      createButton(`DANGER`, `left_mafia`, `اخرج من اللعبة`)
    );

  let row_2 = new ActionRowBuilder()
    .addComponents(
      createButton("SUCCESS", `join_mafia`, `دخول إلى اللعبة`, null, true),
      createButton(`DANGER`, `left_mafia`, `اخرج من اللعبة`, null, true)
    );
  let msg = await message.channel.send({ embeds: [embed], components: [row] }).catch(() => 0);
  if (!msg) return;
  has_play.set(message.guild.id, data);
  let start_c = msg.createMessageComponentCollector({ time: time });

  start_c.on("collect", async inter => {
    if (!has_play.get(message.guild.id)) return;
    if (inter.customId === "join_mafia") {
      if (data.players.find(u => u.id == inter.user.id)) return inter.reply({ content: `انت مشارك بالفعل في اللعبة!`, ephemeral: true });
      if (data.players.length >= 15) return inter.reply({ content: `عدد المشاركين مكتمل`, ephemeral: true });
      data.players.push({
        id: inter.user.id,
        username: inter.user.username,
        avatar: inter.user.displayAvatarURL({ dynamic: true, format: "png" }),
        type: "person",
        interaction: inter,
        vote_kill: 0,
        vote_kick: 0
      });
      has_play.set(message.guild.id, data);
      embed.setDescription(`
__طريقة اللعب:__
**1-** شارك في اللعبة بالضغط على الزر أدناه
**2-** سيتم توزيع اللاعبين على مافيا ، مواطنين وأيضا طبيب واحد بشكل عشوائي
**3-** في كل جولة ، ستصوت المافيا لطرد شخص واحد من اللعبة. ثم سيصوت الطبيب لحماية شخص واحد من المافيا. وفي النهاية الجولة ، سيحاول جميع اللاعبين التصويت وطرد إحدى أعضاء المافيا
**4-** إذا تم طرد جميع المافيا ، سيفوز المواطنين ، وإذا كانت المافيا تساوي عدد المواطنين ، فستفوز المافيا.

__ستبدأ اللعبة خلال__: **<t:${Math.floor(data.start_in / 1000)}:R>**
__اللاعبين المشاركين:__ **(${data.players.length}/15)**
${data.players.map(p => `- <@${p.id}>`).join("\n")}
`);
      msg.edit({ embeds: [embed] }).catch(() => 0);
      inter.reply({ content: `✅ | تم مشاركاتك في اللعبة ... نتمنا لك وقت ممتع`, ephemeral: true });
    } else if (inter.customId == "left_mafia") {
      let index = data.players.findIndex(i => i.id == inter.user.id);
      if (index == -1) return inter.reply({ content: `انت لست مشارك في اللعبة`, ephemeral: true });
      data.players.splice(index, 1);
      has_play.set(message.guild.id, data);
      embed.setDescription(`
__طريقة اللعب:__
**1-** شارك في اللعبة بالضغط على الزر أدناه
**2-** سيتم توزيع اللاعبين على مافيا ، مواطنين وأيضا طبيب واحد بشكل عشوائي
**3-** في كل جولة ، ستصوت المافيا لطرد شخص واحد من اللعبة. ثم سيصوت الطبيب لحماية شخص واحد من المافيا. وفي النهاية الجولة ، سيحاول جميع اللاعبين التصويت وطرد إحدى أعضاء المافيا
**4-** إذا تم طرد جميع المافيا ، سيفوز المواطنين ، وإذا كانت المافيا تساوي عدد المواطنين ، فستفوز المافيا.

__ستبدأ اللعبة خلال__: **<t:${Math.floor(data.start_in / 1000)}:R>**
__اللاعبين المشاركين:__ **(${data.players.length}/15)**
${data.players.map(p => `- <@${p.id}>`).join("\n")}
`);
      msg.edit({ embeds: [embed] }).catch(() => 0);
      inter.reply({ content: `✅ | تم خروجك من اللعبة .`, ephemeral: true });
    }
  });
  start_c.on("end", async () => {
    if (!has_play.get(message.guild.id)) return;
    embed.setDescription(`
__طريقة اللعب:__
**1-** شارك في اللعبة بالضغط على الزر أدناه
**2-** سيتم توزيع اللاعبين على مافيا ، مواطنين وأيضا طبيب واحد بشكل عشوائي
**3-** في كل جولة ، ستصوت المافيا لطرد شخص واحد من اللعبة. ثم سيصوت الطبيب لحماية شخص واحد من المافيا. وفي النهاية الجولة ، سيحاول جميع اللاعبين التصويت وطرد إحدى أعضاء المافيا
**4-** إذا تم طرد جميع المافيا ، سيفوز المواطنين ، وإذا كانت المافيا تساوي عدد المواطنين ، فستفوز المافيا.

__اللاعبين المشاركين:__ **(${data.players.length}/15)**
${data.players.map(p => `- <@${p.id}>`).join("\n")}
`)
      .setColor("#00f418");
    msg.edit({ embeds: [embed], components: [row_2] }).catch(() => 0);
    if (data.players.length < 2) {
      has_play.delete(message.guild.id);
      return message.channel.send({ content: `🚫 | تم إلغاء اللعبة لعدم وجود 2 لاعبين على الأقل` });
    }
    assignRoles(data);
    has_play.set(message.guild.id, data);

    for (let player of data.players) {
      if (player.type == "person") {
        await player.interaction.followUp({ content: `👥 | تم اختيارك انت كـ **مواطن**. في كل جولة يجب عليك التحقق مع جميع اللاعبين لأكتشاف المافيا وطردهم من اللعبة`, ephemeral: true }).catch(() => 0);
      } else if (player.type == "doctor") {
        await player.interaction.followUp({ content: `🧑‍⚕️ | تم اختيارك انت كـ **الطبيب**. في كل جولة يمكنك حماية شخص واحد من هجوم المافيا`, ephemeral: true }).catch(() => 0);
      } else if (player.type == "mafia") {
        await player.interaction.followUp({ content: `🕵️ | تم اختيارك انت  كـ **مافيا**. يجب عليكم محاولة اغتيال جميع اللاعبين بدون اكتشافكم`, ephemeral: true }).catch(() => 0);
      }
    }
    message.channel.send({
      content: `
✅ تم توزيع الرتب على اللاعبين. ستبدأ الجولة الأولى في بضع ثواني...

__الفريق الأول (المواطنين):__
**${data.players.filter(p => p.type == "doctor").length}** طبيب
**${data.players.filter(p => p.type == "person").length}** مواطن

__الفريق الثاني (المافيا):__
**${data.players.filter(p => p.type == "mafia").length}** مافيا
`
    });
    await sleep(700);
    await mafia(message);
  });
}

function assignRoles(data) {
  let arr = [...data.players];
  // توزيع دور المافيا والطبيب بشكل عشوائي
  let mafiaIndex = Math.floor(Math.random() * arr.length);
  data.players[mafiaIndex].type = "mafia";
  arr.splice(mafiaIndex, 1);
  let doctorIndex = Math.floor(Math.random() * arr.length);
  data.players.find(p => p.id == arr[doctorIndex].id).type = "doctor";
}

async function mafia(message) {
  if (!message || !message.guild) return;
  let data = has_play.get(message.guild.id);
  if (!data) return;

  // Reset votes at the start of each round
  data.players.forEach(p => {
    p.vote_kill = 0;
    p.vote_kick = 0;
  });

  let mafia = data.players.filter(t => t.type == "mafia");
  let doctor = data.players.find(t => t.type == "doctor");
  let person = data.players.filter(t => t.type != "mafia");

  // ----- Mafia kill phase -----
  let person_buttons = createMultipleButtons(person.map((p, i) => ({
    id: p.id,
    label: p.username,
    disabled: false,
    index: i
  })), "kill");

  for (let m of mafia) {
    await m.interaction.followUp({
      content: `أمامك 20 ثانية للتصويت على مواطن ليتم قتله`,
      components: person_buttons,
      ephemeral: true
    }).catch(() => 0);
  }
  message.channel.send({ content: `🔪 | جاري انتظار المافيا لاختيار شخص لقتله...` });

  let mafiaVoted = new Set();
  let kill_c = message.channel.createMessageComponentCollector({
    filter: inter => mafia.find(n => n.id == inter.user.id) && inter.customId.startsWith("kill"),
    time: 20000
  });

  kill_c.on("collect", async inter => {
    if (!has_play.get(message.guild.id)) return;
    if (mafiaVoted.has(inter.user.id)) return inter.reply({ content: "لقد قمت بالتصويت بالفعل.", ephemeral: true });
    mafiaVoted.add(inter.user.id);
    let index = inter.customId.split("_")[2];
    if (!person[index]) return inter.reply({ content: "لا يمكن التصويت لهذا اللاعب", ephemeral: true });
    person[index].vote_kill += 1;
    await inter.update({ content: `تم التصويت بنجاح انتظر النتيجة`, components: [] }).catch(() => 0);
    if (mafiaVoted.size >= mafia.length) kill_c.stop();
  });
  kill_c.on("end", async () => {
    if (!has_play.get(message.guild.id)) return;
    person = person.sort((a, b) => b.vote_kill - a.vote_kill);
    // Remove inactive mafia
    for (let maf of mafia) {
      if (!mafiaVoted.has(maf.id)) {
        let idx = data.players.findIndex(m => m.id == maf.id);
        if (idx != -1) {
          data.players.splice(idx, 1);
          has_play.set(message.guild.id, data);
        }
        message.channel.send({ content: `🕐 | تم طرد <@${maf.id}> من المافيا لعدم تفاعله... ستبدأ الجولة التالية في غضون ثوانٍ قليلة` });
        await sleep(1000);
        restart(message);
        return;
      }
    }
    let killed_person = person[0];
    message.channel.send({ content: `🔪 | اختارت المافيا الشخص الذي سيتم اغتياله` });
    await sleep(1000);
    let id = null;
    // ----- Doctor phase -----
    if (doctor) {
      message.channel.send({ content: `💊 | جاري انتظار الطبيب لاختيار شخص لحمايته...` });
      let all_buttons = createMultipleButtons(data.players.map((p, i) => ({
        id: p.id,
        label: p.username,
        disabled: false,
        index: i
      })), "protect");
      await doctor.interaction.followUp({
        content: `أمامك **20** ثانية لاختيار شخص لحمايته...`,
        components: all_buttons,
        ephemeral: true
      }).catch(() => 0);

      let doctor_collect = await message.channel.awaitMessageComponent({
        filter: inter => inter.user.id == doctor.id && inter.customId.startsWith("protect"),
        time: 20000
      }).catch(() => 0);
      if (!doctor_collect || !doctor_collect.customId) {
        message.channel.send({ content: `💊 | لم يختر الطبيب أحد ليحميه من الإغتيال` });
      } else {
        message.channel.send({ content: `💊 | اختار الطبيب الشخص الذي سيحميه من اغتيال المافيا` });
      }
      id = doctor_collect ? doctor_collect.customId.split("_")[1] : null;
    }
    if (id == killed_person.id) {
      message.channel.send({ content: `🛡️ | فشلت عملية المافيا لقتل <@${killed_person.id}> لأنه تم حمايته من قبل الطبيب` });
    } else {
      let idx = data.players.findIndex(b => b.id == killed_person.id);
      if (idx != -1) {
        data.players.splice(idx, 1);
        has_play.set(message.guild.id, data);
      }
      await message.channel.send({ content: `⚰️ | نجحت عملية المافيا وتم قتل <@${killed_person.id}> وهذا الشخص كان **${killed_person.type == "doctor" ? "طبيب" : "مواطن"}**` });
    }

    // --- WIN CHECK: mafia wins if 1 mafia and 1 other remains
    if (
      data.players.length === 2 &&
      data.players.filter(b => b.type == "mafia").length === 1
    ) {
      return win(message, "mafia");
    }
    if (data.players.filter(b => b.type == "person").length <= data.players.filter(b => b.type == "mafia").length) return win(message, "mafia");

    // ----- Player voting phase -----
    message.channel.send({ content: `🔍 | لديكم **15 ثانية** للتحقق بين اللاعبين ومعرفة المافيا للتصويت على طرده من اللعبة` });
    await sleep(15000);

    data.players.forEach(p => { p.vote_kick = 0; });
    let all_buttons = createMultipleButtons(data.players.map((p, i) => ({
      id: p.id,
      label: p.username,
      disabled: false,
      emoji: config.numbers[p.vote_kick] || undefined,
      index: i
    })), "kick");

    let msg = await message.channel.send({
      content: `لديكم **20 ثانية** لاختيار شخص لطرده من اللعبة`,
      components: all_buttons
    });

    let votedUsers = new Set();
    let kick_c = msg.createMessageComponentCollector({
      filter: inter => data.players.find(p => p.id === inter.user.id) && inter.customId.startsWith("kick"),
      time: 20000
    });

    kick_c.on("collect", async inter => {
      if (!has_play.get(message.guild.id)) return;
      if (votedUsers.has(inter.user.id)) return inter.reply({ content: "لقد قمت بالتصويت بالفعل.", ephemeral: true });
      votedUsers.add(inter.user.id);
      let [, playerId, idx] = inter.customId.split("_");
      let target = data.players.find(p => p.id === playerId);
      if (target) {
        target.vote_kick += 1;
        let updatedButtons = createMultipleButtons(data.players.map((p, i) => ({
          id: p.id,
          label: p.username,
          disabled: false,
          emoji: config.numbers[p.vote_kick] || undefined,
          index: i
        })), "kick");
        await msg.edit({ components: updatedButtons });
      }
      await inter.deferUpdate();
      if (votedUsers.size >= data.players.length) kick_c.stop();
    });

    kick_c.on("end", async () => {
      let disabledButtons = createMultipleButtons(data.players.map((p, i) => ({
        id: p.id,
        label: p.username,
        disabled: true,
        emoji: config.numbers[p.vote_kick] || undefined,
        index: i
      })), "kick");
      await msg.edit({ components: disabledButtons }).catch(() => 0);

      let sorted = [...data.players].sort((a, b) => b.vote_kick - a.vote_kick);
      if (sorted.length > 1 && sorted[0].vote_kick === sorted[1].vote_kick) {
        message.channel.send({ content: "⏭ | بسبب تعادل التصويت ، تم تخطي الطرد ... الجولة القادمة ستبدأ في بضع ثوان" });
        await sleep(1000);
        await restart(message);
      } else {
        let kicked = sorted[0];
        let idx = data.players.findIndex(p => p.id == kicked.id);
        if (idx != -1) {
          data.players.splice(idx, 1);
          has_play.set(message.guild.id, data);
        }
        message.channel.send({ content: `💣 | تم التصويت على طرد <@${kicked.id}> وكان هذا الشخص **${kicked.type == "mafia" ? "مافيا" : kicked.type == "doctor" ? "طبيب" : "مواطن"}**` });

        // --- WIN CHECK: mafia wins if 1 mafia and 1 other remains
        if (
          data.players.length === 2 &&
          data.players.filter(b => b.type == "mafia").length === 1
        ) {
          return win(message, "mafia");
        }
        if (data.players.filter(b => b.type == "person").length <= data.players.filter(b => b.type == "mafia").length) return win(message, "mafia");
        if (data.players.filter(b => b.type == "mafia").length <= 0) return win(message, "person");
        message.channel.send({ content: `ستبدأ الجولة التالية بعد بضع ثوان...` });
        await sleep(1000);
        restart(message);
      }
    });
  });
}

function restart(message) {
  mafia(message);
}

async function win(message, who) {
  let data = has_play.get(message.guild.id);
  if (!data) return;
  if (who === "person") {
    message.channel.send({ content: `👑 | فاز الفريق الأول (المواطنين) في اللعبة.\n${data.players.filter(m => m.type != "mafia").map(b => `<@${b.id}>`).join(", ")}` });
  } else if (who === "mafia") {
    message.channel.send({ content: `👑 | فاز الفريق الثاني (المافيا) في اللعبة.\n${data.players.filter(m => m.type == "mafia").map(b => `<@${b.id}>`).join(", ")}` });
  }
  has_play.delete(message.guild.id);
}

function createMultipleButtons(array, type) {
  let components = [];
  let c = 5;
  for (let i = 0; i < array.length; i += c) {
    let buttons = array.slice(i, i + c);
    let component = new ActionRowBuilder();
    for (let button of buttons) {
      let btn = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel(button.label)
        .setCustomId(`${type}_${button.id}_${button.index}`)
        .setDisabled(button.disabled ? button.disabled : false);
      if (button.emoji) {
        btn.setEmoji(button.emoji);
      }
      component.addComponents(btn);
    }
    components.push(component);
  }
  return components;
}

function createButton(style, customId, label, emoji, disabled) {
  let styles = {
    PRIMARY: ButtonStyle.Primary,
    SECONDARY: ButtonStyle.Secondary,
    SUCCESS: ButtonStyle.Success,
    DANGER: ButtonStyle.Danger
  };
  let btn = new ButtonBuilder()
    .setStyle(styles[style])
    .setCustomId(customId)
    .setLabel(label)
    .setDisabled(disabled ? disabled : false);
  if (emoji) btn.setEmoji(emoji);
  return btn;
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(() => resolve(time), time));
}

module.exports = mafia_command;