const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const { PermissionsBitField } = require('discord.js');
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const spinDB = new Database("/Json-db/Bots/spinDB.json");
const invitesDB = new Database("/Json-db/Bots/invitesDB.json");

let spin = tokens.get(`spin`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuySpin_Modal") {
            await interaction.deferReply({ephemeral:true})
            const userBalance = await usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`);
            const balance = parseInt(userBalance) || 0;
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            
            const client21 =new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try{
              const owner = interaction.user.id
                let price1 = prices.get(`spin_price_${interaction.guild.id}`) || 40;
                price1 = parseInt(price1)
                const newbalance = balance - price1;

                if(balance < price1) return interaction.reply({content:`**لا يوجد لديك رصيد كافي! رصيدك الحالي: ${balance}**` , ephemeral:true})
                
                await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newbalance);

                function generateRandomCode() {
                    const characters = 'AordersDEFGHIJKLMNOPQRSTUVWXYZaordersdefghijklmnopqrstuvwxyz0123456789';
                    let code = '';
                    for (let i = 0; i < 12; i++) {
                      if (i > 0 && i % 4 === 0) {
                        code += '-';
                      }
                      const randomIndex = Math.floor(Math.random() * characters.length);
                      code += characters.charAt(randomIndex);
                    }
                    return code;
                  }
                  const invoice = generateRandomCode();
                let doneembeduser = new EmbedBuilder()
                .setTitle(`**تم انشاء بوتك بنجاح**`)
                .setDescription(`**معلومات الفاتورة :**`)
                .addFields(
                    {
                        name:`**الفاتورة**`,value:`**\`${invoice}\`**`,inline:false
                    },
                    {
                        name:`**نوع البوت**`,value:`**\`Spin Bot\`**`,inline:false
                    },
                    {
                        name:`**توكن البوت**`,value:`**\`${Bot_token}\`**`,inline:false
                    },
                    {
                        name:`**البريفكس**`,value:`**\`${Bot_prefix}\`**`,inline:false
                    }
                )
                await invoices.set(`${invoice}_${interaction.guild.id}` , 
                {
                    type:`spin`,
                    token:`${Bot_token}`,
                    prefix:`${Bot_prefix}`,
                    userid:`${interaction.user.id}`,
                    guildid:`${interaction.guild.id}`,
                    serverid:`عام`,
                    price:price1
                })
                const { REST } = require('@discordjs/rest');
                const rest = new REST({ version: '10' }).setToken(Bot_token);
                const { Routes } = require('discord-api-types/v10');
                client21.on('ready' , async() => {
                  const thebut = new ButtonBuilder()
                    .setLabel(`دعوة البوت`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client21.user.id}&permissions=8&scope=bot%20applications.commands`);

            const supportButton = new ButtonBuilder()
              .setLabel('سيرفر الدعم')
              .setStyle(ButtonStyle.Link)
              .setURL('https://discord.gg/JRRwcxMyry'); // Replace with your support server invite

            const youtubeButton = new ButtonBuilder()
              .setLabel('يوتيوب')
              .setStyle(ButtonStyle.Link)
              .setURL('https://youtube.com/@3mran77'); // Replace with your YouTube channel

                  const rowss = new ActionRowBuilder().addComponents(thebut, supportButton, youtubeButton);
                  await interaction.user.send({embeds:[doneembeduser] , components:[rowss]})
                })
                let doneembedprove = new EmbedBuilder()
                    .setColor('Aqua')
                    .setTitle('عملية شراء جديدة')
                    .addFields(
                        {name: 'المشتري', value: `${interaction.user} | \`${interaction.user.tag}\``, inline: true},
                        {name: 'نوع البوت', value: '`**Spin Bot**`', inline: true},
                        {name: 'رصيد العضو', value: `\`${newbalance}\``, inline: true},
                        {name: 'سعر البوت', value: `\`${price1}\``, inline: true}
                    )
                    .setImage(interaction.guild.banner ? interaction.guild.bannerURL({ dynamic: true, size: 1024 }) : null)
                    .setFooter({ text: `Developed by ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })                    .setThumbnail(interaction.user.displayAvatarURL({dynamic: true}))
                    .setTimestamp();

                const profileButton = new ButtonBuilder()
                    .setLabel('Profile')
                    .setURL(`https://discord.com/users/${interaction.user.id}`)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('👤');

                const logRow = new ActionRowBuilder()
                    .addComponents(profileButton);

                let logroom = setting.get(`log_room_${interaction.guild.id}`);
                let theroom = interaction.guild.channels.cache.find(ch => ch.id == logroom);
                await theroom.send({embeds:[doneembedprove], components: [logRow]})
                  // انشاء ايمبد لوج لعملية الشراء و جلب معلومات روم اللوج في السيرفر الرسمي و ارسال الايمبد هناك
                  const { WebhookClient } = require('discord.js')
                  const { purchaseWebhookUrl } = require('../../config.json');
                  const webhookClient = new WebhookClient({ url : purchaseWebhookUrl });
                  const theEmbed = new EmbedBuilder()
                                              .setColor('Green')
                                              .setTitle('تمت عملية شراء جديدة')
                                              .addFields(
                                                  {name : `نوع البوت` , value : `\`\`\`طلبات\`\`\`` , inline : true},
                                                  {name : `سعر البوت` , value : `\`\`\`${price1}\`\`\`` , inline : true},
                                                  {name : `المشتري` , value : `\`\`\`${interaction.user.username} , [${interaction.user.id}]\`\`\`` , inline : true},
                                                  {name : `السيرفر` , value : `\`\`\`${interaction.guild.name} [${interaction.guild.id}]\`\`\`` , inline : true},
                                                  {name : `صاحب السيرفر` , value : `\`\`\`${interaction.guild.ownerId}\`\`\`` , inline : true},
                                                  {name : `الفاتورة` , value : `\`\`\`${invoice}\`\`\`` , inline : false},
                                              )
                  await webhookClient.send({embeds : [theEmbed]})

               let userbots = usersdata.get(`bots_${interaction.user.id}_${interaction.guild.id}`);
               if(!userbots) {
                await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}` , 1)
               }else {
                userbots = userbots + 1
                await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}` , userbots) 
               }
                await interaction.editReply({content:`**تم انشاء بوتك بنجاح وتم خصم \`${price1}\` من رصيدك**`})
                client21.commands = new Collection();
            client21.events = new Collection();
            const folderPath = path.resolve(__dirname, '../../Bots/spin/slashcommand21');
            const prefix = Bot_prefix
            client21.spinSlashCommands = new Collection();
  const spinSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("spin commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          spinSlashCommands.push(command.data.toJSON());
          client21.spinSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}

const folderPath3 = path.resolve(__dirname, '../../Bots/spin/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client21);
}
            client21.on("ready" , async() => {

                try {
                  await rest.put(
                    Routes.applicationCommands(client21.user.id),
                    { body: spinSlashCommands },
                    );
                    
                  } catch (error) {
                    console.error(error)
                  }
          
              });
                const folderPath2 = path.join(__dirname, 'slashcommand21');

                 client21.on('ready', async () => {
    for (const guild of client21.guilds.cache.values()) {
      try {
        const guildInvites = await guild.invites.fetch();
        client21.invites.set(guild.id, new Map(guildInvites.map(invite => [invite.code, invite.uses])));
      } catch (err) {
        console.error(`Failed to fetch invites for guild ${guild.id}:`, err);
      }
    }
  });

  client21.on('inviteCreate', async invite => {
    const guildInvites = client21.invites.get(invite.guild.id);
    guildInvites.set(invite.code, invite.uses);
    client21.invites.set(invite.guild.id, guildInvites);
  });

  client21.on('guildMemberAdd', async member => {
    try {
      const logChannelId = await spinDB.get(`invites_log_${member.guild.id}`);
      if (!logChannelId) return;

      const cachedInvites = client21.invites.get(member.guild.id);
      const newInvites = await member.guild.invites.fetch();

      const usedInvite = newInvites.find(invite => {
        const cachedUses = cachedInvites.get(invite.code) || 0;
        return invite.uses > cachedUses;
      });

      if (usedInvite) {
        const inviter = await client21.users.fetch(usedInvite.inviter.id);
        const currentInvites = await invitesDB.get(`invites_${member.guild.id}_${inviter.id}`) || 0;

        await invitesDB.set(`invites_${member.guild.id}_${inviter.id}`, currentInvites + 1);

        const logChannel = member.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            await logChannel.send(`> ⭐ <@${member.user.id}> انضم بواسطة <@${inviter.id}> (${currentInvites + 1} دعوات)`);
        }
      }

      client21.invites.set(member.guild.id, new Map(newInvites.map(invite => [invite.code, invite.uses])));
    } catch (err) {
      console.error('Error handling invite:', err);
    }
  });

  async function getInviteCount(guildId, userId) {
    return await invitesDB.get(`invites_${guildId}_${userId}`) || 0;
  }

 
  
  client21.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
      if (interaction.user.bot) return;

      const command = client21.spinSlashCommands.get(interaction.commandName);

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

  client21.on("interactionCreate", async (interaction) => {
    if (interaction.customId === "help_general") {
      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTitle('قائمة اوامر البوت')
          .addFields(
        {name : `\`/invites\`` , value : `لعرض عدد الدعوات`},
        {name : `\`${prefix}invites\`` , value : `لعرض عدد الدعوات`},
        {name : `\`${prefix}spin\`` , value : `لعمل سحب`},
        {name : `\`/prizes\`` , value : `لعرض الجوائز`},
        {name : `\`/help\`` , value : `لعرض قائمة الاوامر`},
        {name : `\`/support\`` , value : `للانضمام للسيرفر الداعم`},
          )        .setTimestamp()
        .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor('DarkButNotBlack');
      const btns = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐').setDisabled(true),
        new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Primary).setEmoji('👑'),
      );

      await interaction.update({ embeds: [embed], components: [btns] });
    } else if (interaction.customId === "help_owner") {
      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTitle('قائمة اوامر البوت')
        .addFields(
          { name: `\`/add-invites\``, value: `` },
          { name: `\`/remove-invites\``, value: `` },
          { name: `\`/set-invite-log\``, value: `` },
          { name: `\`/set-normal-prizes\``, value: `` },
          { name: `\`/set-vip-prizes\``, value: `` },
          { name: `\`/spin-settings\``, value: `` },
          { name: `\`/set-spin-invites normal\``, value: `` },
          { name: `\`/set-spin-invites vip\``, value: `` },
          { name: `\`/set-spin-results\``, value: `` },
          {name : `\`/bot- avatar\`` , value : `تغيير صورة البوت`},
          {name : `\`/bot- name\`` , value : ` تغيير اسم البوت`},
          {name : `\`/set-straming\`` , value : `تغيير حالة البوت`},
          {name : `\`/join-voice\`` , value : `الانضمام الى روم صوتي`},
          
          
        )
        .setTimestamp()
        .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor('DarkButNotBlack');
      const btns = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
        new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Primary).setEmoji('👑').setDisabled(true),
      );

      await interaction.update({ embeds: [embed], components: [btns] });
    }
  });

  client21.on("messageCreate", async (message) => {
    if (message.content.startsWith(`${prefix}spin`) && !message.author.bot) {
      // Add channel name check
      if (!message.channel.name.startsWith('ticket-')) {
        await message.delete().catch(console.error);
        try {
          await message.author.send({
            content: `❌ يمكن استخدام امر السحب فقط في الرومات التي تبدأ باسم ticket-`
          });
        } catch (error) {
          console.error('Could not send DM to user');
        }
        return;
      }

      const userInvites = await getInviteCount(message.guild.id, message.author.id);
      const normalRequired = await spinDB.get(`spin_invites_${message.guild.id}`) ?? 5;
      const vipRequired = await spinDB.get(`vip_spin_invites_${message.guild.id}`) ?? 10;

      if (userInvites < normalRequired) {
        await message.delete().catch(console.error);
        try {
          await message.author.send({
            content: `❌ لا يمكنك استخدام السحب! تحتاج ${normalRequired} دعوة على الأقل.\nدعواتك الحالية: ${userInvites}`
          });
        } catch (error) {
          console.error('Could not send DM to user');
        }
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('🎰 نظام السحب')
        .setDescription('اختر نوع السحب المطلوب')
        .setColor('Blue')
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('normal_spin')
            .setLabel('Normal Spin')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎲'),
          new ButtonBuilder()
            .setCustomId('vip_spin')
            .setLabel('VIP Spin')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🎯')
        );

      await message.reply({ embeds: [embed], components: [row] });
    }

    if (message.content.startsWith(`${prefix}invites`)) {
      const args = message.content.split(' ');
      const targetUser = message.mentions.users.first() || message.author;
      const invites = await invitesDB.get(`invites_${message.guild.id}_${targetUser.id}`) || 0;

      if (invites <= 0) {
        await message.delete().catch(console.error);
        try {
          await message.author.send({
            content: `❌ ليس لديك اي دعوات حالياً!\nعدد دعواتك: ${invites}`
          });
        } catch (error) {
          console.error('Could not send DM to user');
        }
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('📊 معلومات الدعوات')
        .setDescription(`**عضو:** <@${targetUser.id}>\n**عدد الدعوات:** ${invites}`)
        .setColor('Blue')
        .setTimestamp()
        .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

      await message.reply({ embeds: [embed] });
    }
  });

  client21.on("ready", async () => {
    client21.guilds.cache.forEach(async guild => {
      if (!await spinDB.has(`normal_prizes_${guild.id}`)) {
        await spinDB.set(`normal_prizes_${guild.id}`, []);
      }
      if (!await spinDB.has(`vip_prizes_${guild.id}`)) {
        await spinDB.set(`vip_prizes_${guild.id}`, []);
      }
    });
  });

  client21.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    const originalMessage = interaction.message;

    if (interaction.customId === "normal_spin") {
      await interaction.deferReply({ ephemeral: true });

      const requiredInvites = await spinDB.get(`spin_invites_${interaction.guild.id}`) ?? 5;
      const userInvites = await getInviteCount(interaction.guild.id, interaction.user.id);
      const prizes = await spinDB.get(`normal_prizes_${interaction.guild.id}`) || [];

      if (!prizes || !Array.isArray(prizes) || prizes.length === 0) {
        await originalMessage.delete().catch(console.error);
        return interaction.editReply({
          content: '❌ لم يتم تحديد جوائز السحب العادي بعد. الرجاء إعداد الجوائز أولاً',
          ephemeral: true
        });
      }

      if (userInvites < requiredInvites) {
        await originalMessage.delete().catch(console.error);
        return interaction.editReply({
          content: `❌ مطلوب ${requiredInvites} دعوة للسحب العادي. لديك حاليا ${userInvites} دعوة`,
          ephemeral: true
        });
      }

      // Deduct invites after successful spin
      await invitesDB.set(`invites_${interaction.guild.id}_${interaction.user.id}`, userInvites - requiredInvites);

      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      const resultsChannel = await spinDB.get(`spin_results_${interaction.guild.id}`);

      if (resultsChannel) {
        try {
          const channel = interaction.guild.channels.cache.get(resultsChannel);
          if (!channel) {
            console.error(`Results channel not found: ${resultsChannel}`);
            await interaction.followUp({ 
              content: '❌ قناة النتائج غير موجودة. الرجاء إعادة إعداد القناة',
              ephemeral: true 
            });
          } else {
            // Check bot permissions in the channel
            const permissions = channel.permissionsFor(interaction.guild.members.me);
            if (!permissions.has(['SendMessages', 'ViewChannel'])) {
              await interaction.followUp({
                content: '❌ البوت لا يملك صلاحيات الكتابة في قناة النتائج',
                ephemeral: true
              });
              return;
            }

            const resultEmbed = new EmbedBuilder()
              .setTitle('🎲 نتيجة السحب')
              .setDescription(`**الفائز:** ${interaction.user}\n**الجائزة:** ${randomPrize}`)
              .setColor('Green')
              .setTimestamp();

            await channel.send({ embeds: [resultEmbed] }).catch(error => {
              console.error('Failed to send result to channel:', error);
              interaction.followUp({
                content: '❌ حدث خطأ أثناء إرسال النتيجة لقناة النتائج',
                ephemeral: true
              });
            });
          }
        } catch (error) {
          console.error('Error handling results channel:', error);
        }
      }

      await originalMessage.delete().catch(console.error);
      await interaction.editReply({
        content: `🎉 مبروك! ربحت: ${randomPrize}`,
        ephemeral: false
      });
    }

    if (interaction.customId === "vip_spin") {
      await interaction.deferReply({ ephemeral: true });

      const requiredInvites = await spinDB.get(`vip_spin_invites_${interaction.guild.id}`) ?? 10;
      const userInvites = await getInviteCount(interaction.guild.id, interaction.user.id);
      const prizes = await spinDB.get(`vip_prizes_${interaction.guild.id}`) || [];

      if (!prizes || !Array.isArray(prizes) || prizes.length === 0) {
        await originalMessage.delete().catch(console.error);
        return interaction.editReply({
          content: '❌ لم يتم تحديد جوائز السحب VIP بعد. الرجاء إعداد الجوائز أولاً',
          ephemeral: true
        });
      }

      if (userInvites < requiredInvites) {
        await originalMessage.delete().catch(console.error);
        return interaction.editReply({
          content: `❌ مطلوب ${requiredInvites} دعوة للسحب VIP. لديك حاليا ${userInvites} دعوة`,
          ephemeral: true
        });
      }

      // Deduct invites after successful spin
      await invitesDB.set(`invites_${interaction.guild.id}_${interaction.user.id}`, userInvites - requiredInvites);

      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      const resultsChannel = await spinDB.get(`spin_results_${interaction.guild.id}`);

      if (resultsChannel) {
        try {
          const channel = interaction.guild.channels.cache.get(resultsChannel);
          if (!channel) {
            console.error(`Results channel not found: ${resultsChannel}`);
            await interaction.followUp({ 
              content: '❌ قناة النتائج غير موجودة. الرجاء إعادة إعداد القناة',
              ephemeral: true 
            });
          } else {
            // Check bot permissions in the channel
            const permissions = channel.permissionsFor(interaction.guild.members.me);
            if (!permissions.has(['SendMessages', 'ViewChannel'])) {
              await interaction.followUp({
                content: '❌ البوت لا يملك صلاحيات الكتابة في قناة النتائج',
                ephemeral: true
              });
              return;
            }

            const resultEmbed = new EmbedBuilder()
              .setTitle('🎯 VIP نتيجة سحب')
              .setDescription(`**الفائز:** ${interaction.user}\n**الجائزة:** ${randomPrize}`)
              .setColor('Gold')
              .setTimestamp();

            await channel.send({ embeds: [resultEmbed] }).catch(error => {
              console.error('Failed to send result to channel:', error);
              interaction.followUp({
                content: '❌ حدث خطأ أثناء إرسال النتيجة لقناة النتائج',
                ephemeral: true
              });
            });
          }
        } catch (error) {
          console.error('Error handling results channel:', error);
        }
      }

      await originalMessage.delete().catch(console.error);
      await interaction.editReply({
        content: `🎉 مبروك! ربحت: ${randomPrize}`,
        ephemeral: false
      });
    }
  });
                  
                
                  await client21.login(Bot_token).catch(async() => {
                    return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
                  })
                  if(!spin) {
                      await tokens.set(`spin` , [{token:Bot_token,prefix:Bot_prefix,clientId:client21.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`spin` , {token:Bot_token,prefix:Bot_prefix,clientId:client21.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
        
            
            }catch(error){
                console.error(error)
                return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
            }
        }
    }
  }
}