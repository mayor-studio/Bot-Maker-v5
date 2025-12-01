const { Client, Collection, AuditLogEvent, discord, GatewayIntentBits, Partials, EmbedBuilder, ApplicationCommandOptionType, Events, ActionRowBuilder, ButtonBuilder, MessageAttachment, ButtonStyle, Message, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { Database } = require("st.db")
const tempVoiceDB = new Database("/Json-db/Bots/tempvoiceDB.json");
const fs = require('fs');
const axios = require("axios");
const tokens = new Database("/tokens/tokens")
const { PermissionsBitField } = require('discord.js')
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let tempvoice = tokens.get('tempvoice')
if(!tempvoice) return;
const path = require('path');
const { readdirSync } = require("fs");
let theowner;
tempvoice.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client8 = new Client({intents: 131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client8.commands = new Collection();
  require(`./handlers/events`)(client8);
  client8.events = new Collection();
  client8.setMaxListeners(1000)

  require(`../../events/requireBots/tempvoice-commands`)(client8);
  const rest = new REST({ version: '10' }).setToken(token);
  client8.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client8.user.id),
          { body: tempvoiceSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client8.once('ready', () => {
    client8.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`tempvoice bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client8.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`tempvoice`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client8.users.cache.get(owner) || await client8.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : تمب فويس\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`tempvoice`, filtered);
          await client8.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 1000);
  });
    require(`./handlers/events`)(client8)
  const folderPath = path.join(__dirname, 'slashcommand8');
  client8.tempvoiceSlashCommands = new Collection();
  const tempvoiceSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("tempvoice commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          tempvoiceSlashCommands.push(command.data.toJSON());
          client8.tempvoiceSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand8');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/tempvoice-commands`)(client8)
require("./handlers/events")(client8)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client8.once(event.name, (...args) => event.execute(...args));
	} else {
		client8.on(event.name, (...args) => event.execute(...args));
	}
	}




  client8.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client8.tempvoiceSlashCommands.get(interaction.commandName);
	    
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


//// temp voice

const tempChannels = new Map();

client8.on('voiceStateUpdate', async (oldState, newState) => {
  try {
      const config = tempVoiceDB.get(`tempvoice_${newState.guild.id}`);
      if (!config) return;

      // Creating a temporary channel
      if (newState.channelId === config.joinChannelId) {
          const channel = await newState.guild.channels.create({
              name: `${newState.member.user.username}'s Channel`,
              type: ChannelType.GuildVoice,
              parent: config.categoryId,
              permissionOverwrites: [
                  {
                      id: newState.member.id,
                      allow: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.MoveMembers]
                  }
              ]
          });

          // Immediately move the member to their new channel
          try {
              await newState.member.voice.setChannel(channel.id);
              tempChannels.set(channel.id, newState.member.id);
          } catch (moveError) {
              console.error('Error moving member to new channel:', moveError);
              // If moving fails, delete the created channel
              await channel.delete().catch(console.error);
          }
      }

      // Deleting empty temporary channels
      if (oldState.channel && tempChannels.has(oldState.channelId)) {
          if (oldState.channel.members.size === 0) {
              tempChannels.delete(oldState.channelId);
              await oldState.channel.delete().catch(console.error);
          }
      }
  } catch (error) {
      console.error('Error in temporary voice system:', error);
  }
});

client8.on('interactionCreate', async interaction => {
    // Only handle buttons and modals
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    try {
        // Button Interactions
        if (interaction.isButton()) {
            const member = interaction.member;
            const voiceChannel = member.voice.channel;

            // Validate user is in their temp voice channel
            if (!voiceChannel || !tempChannels.has(voiceChannel.id)) {
                return interaction.reply({
                    content: '❌ يجب أن تكون في رومك الصوتي المؤقت!',
                    ephemeral: true
                });
            }

            // Validate user owns the channel
            if (tempChannels.get(voiceChannel.id) !== member.id) {
                return interaction.reply({
                    content: '❌ فقط مالك الروم يمكنه استخدام هذه الاوامر!',
                    ephemeral: true
                });
            }

            // Handle different button actions
            switch (interaction.customId) {
                case 'temp_lock':
                    await voiceChannel.permissionOverwrites.edit(interaction.guild.id, { Connect: false });
                    await interaction.reply({ content: '🔒 تم قفل الروم!', ephemeral: true });
                    break;

                case 'temp_unlock':
                    await voiceChannel.permissionOverwrites.edit(interaction.guild.id, { Connect: true });
                    await interaction.reply({ content: '🔓 تم فتح الروم!', ephemeral: true });
                    break;

                case 'temp_limit': {
                    const modal = new ModalBuilder()
                        .setCustomId('temp_limit_modal')
                        .setTitle('تحديد العدد');
                    
                    const limitInput = new TextInputBuilder()
                        .setCustomId('limit_input')
                        .setLabel('ادخل العدد (0-99)')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    
                    modal.addComponents(new ActionRowBuilder().addComponents(limitInput));
                    await interaction.showModal(modal);
                    break;
                }

                case 'temp_rename': {
                    const modal = new ModalBuilder()
                        .setCustomId('temp_rename_modal')
                        .setTitle('تغيير الاسم');
                    
                    const nameInput = new TextInputBuilder()
                        .setCustomId('name_input')
                        .setLabel('اسم الروم الجديد')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    
                    modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
                    await interaction.showModal(modal);
                    break;
                }

                case 'temp_block': {
                    const modal = new ModalBuilder()
                        .setCustomId('temp_block_modal')
                        .setTitle('حظر عضو');
                    
                    const userInput = new TextInputBuilder()
                        .setCustomId('user_input')
                        .setLabel('ايدي العضو')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    
                    modal.addComponents(new ActionRowBuilder().addComponents(userInput));
                    await interaction.showModal(modal);
                    break;
                }

                case 'temp_unblock': {
                    const modal = new ModalBuilder()
                        .setCustomId('temp_unblock_modal')
                        .setTitle('الغاء حظر عضو');
                    
                    const userInput = new TextInputBuilder()
                        .setCustomId('user_input')
                        .setLabel('ايدي العضو')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    
                    modal.addComponents(new ActionRowBuilder().addComponents(userInput));
                    await interaction.showModal(modal);
                    break;
                }

                case 'temp_transfer': {
                    const modal = new ModalBuilder()
                        .setCustomId('temp_transfer_modal')
                        .setTitle('نقل الملكية');
                    
                    const userInput = new TextInputBuilder()
                        .setCustomId('user_input')
                        .setLabel('ايدي العضو الجديد')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    
                    modal.addComponents(new ActionRowBuilder().addComponents(userInput));
                    await interaction.showModal(modal);
                    break;
                }

                case 'temp_kick': {
                    const modal = new ModalBuilder()
                        .setCustomId('temp_kick_modal')
                        .setTitle('طرد عضو');
                    
                    const userInput = new TextInputBuilder()
                        .setCustomId('user_input')
                        .setLabel('ايدي العضو')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    
                    modal.addComponents(new ActionRowBuilder().addComponents(userInput));
                    await interaction.showModal(modal);
                    break;
                }

                case 'temp_delete':
                    await voiceChannel.delete();
                    tempChannels.delete(voiceChannel.id);
                    await interaction.reply({ content: '✅ تم حذف الروم!', ephemeral: true });
                    break;
            }
        }

        // Modal Submissions
        if (interaction.isModalSubmit()) {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel || !tempChannels.has(voiceChannel.id)) {
                return interaction.reply({
                    content: '❌ يجب أن تكون في رومك الصوتي المؤقت!',
                    ephemeral: true
                });
            }

            switch (interaction.customId) {
                case 'temp_limit_modal': {
                    const limit = parseInt(interaction.fields.getTextInputValue('limit_input'));
                    if (isNaN(limit) || limit < 0 || limit > 99) {
                        return interaction.reply({ content: '❌ يرجى ادخال رقم من 0 الى 99', ephemeral: true });
                    }
                    await voiceChannel.setUserLimit(limit);
                    await interaction.reply({ content: `✅ تم تحديد العدد: ${limit}`, ephemeral: true });
                    break;
                }

                case 'temp_rename_modal': {
                    const newName = interaction.fields.getTextInputValue('name_input');
                    await voiceChannel.setName(newName);
                    await interaction.reply({ content: '✅ تم تغيير اسم الروم!', ephemeral: true });
                    break;
                }

                case 'temp_block_modal': {
                    const userId = interaction.fields.getTextInputValue('user_input');
                    const member = await interaction.guild.members.fetch(userId).catch(() => null);
                    if (!member) return interaction.reply({ content: '❌ لم يتم العثور على العضو!', ephemeral: true });
                    
                    await voiceChannel.permissionOverwrites.edit(member.id, { Connect: false });
                    if (member.voice.channelId === voiceChannel.id) {
                        await member.voice.disconnect();
                    }
                    await interaction.reply({ content: `✅ تم حظر ${member.user.tag}`, ephemeral: true });
                    break;
                }

                case 'temp_unblock_modal': {
                    const userId = interaction.fields.getTextInputValue('user_input');
                    const member = await interaction.guild.members.fetch(userId).catch(() => null);
                    if (!member) return interaction.reply({ content: '❌ لم يتم العثور على العضو!', ephemeral: true });
                    
                    await voiceChannel.permissionOverwrites.delete(member.id);
                    await interaction.reply({ content: `✅ تم الغاء حظر ${member.user.tag}`, ephemeral: true });
                    break;
                }

                case 'temp_kick_modal': {
                    const userId = interaction.fields.getTextInputValue('user_input');
                    const member = await interaction.guild.members.fetch(userId).catch(() => null);
                    if (!member) return interaction.reply({ content: '❌ لم يتم العثور على العضو!', ephemeral: true });
                    
                    if (member.voice.channelId === voiceChannel.id) {
                        await member.voice.disconnect();
                        await interaction.reply({ content: `✅ تم طرد ${member.user.tag}`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: '❌ العضو غير متواجد في الروم!', ephemeral: true });
                    }
                    break;
                }

                case 'temp_transfer_modal': {
                    const userId = interaction.fields.getTextInputValue('user_input');
                    const newOwner = await interaction.guild.members.fetch(userId).catch(() => null);
                    if (!newOwner) return interaction.reply({ content: '❌ لم يتم العثور على العضو!', ephemeral: true });

                    tempChannels.set(voiceChannel.id, newOwner.id);
                    await voiceChannel.permissionOverwrites.edit(newOwner.id, {
                        Connect: true,
                        ManageChannels: true,
                        MoveMembers: true
                    });
                    await voiceChannel.setName(`${newOwner.user.username}'s Channel`);
                    await interaction.reply({ content: `✅ تم نقل ملكية الروم الى ${newOwner.user.tag}`, ephemeral: true });
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Error in temp voice interaction:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ حدث خطأ اثناء تنفيذ العملية', ephemeral: true });
        }
    }
});

client8.on('messageCreate', async (message) => {
  if (!message.content.startsWith(`${prefix}temp`) || message.author.bot) return;

  // Check permissions
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ تحتاج إلى صلاحيات الإدارة لاستخدام هذا الأمر!');
  }

  try {
      const config = tempVoiceDB.get(`tempvoice_${message.guild.id}`);
      if (!config) {
          return message.reply('❌ نظام الرومات المؤقتة غير مفعل! استخدم `/tempvoice setup` للتفعيل');
      }

      // Create embed for the panel
      const embed = new EmbedBuilder()
          .setTitle('🎙️ Temporary Voice Channel Controls')
          .setDescription('Join the voice channel to create your own temporary voice channel!\n\n**Controls:**')
          .addFields(
              { name: '🔒 Lock', value: 'Prevent users from joining' },
              { name: '🔓 Unlock', value: 'Allow users to join' },
              { name: '👥 User Limit', value: 'Set the maximum number of users' },
              { name: '✏️ Rename', value: 'Change your channel name' },
              { name: '🚫 Block', value: 'Block specific users' },
              { name: '✅ Unblock', value: 'Unblock specific users' },
              { name: '📨 Invite', value: 'Invite a user (sends DM)' },
              { name: '👑 Transfer', value: 'Transfer ownership by ID' },
              { name: '🚪 Kick', value: 'Kick a user from channel' },
              { name: '❌ Delete', value: 'Delete your temporary channel' }
          )
          .setColor('Blue')
          .setTimestamp();

      // Create buttons
      const row = new ActionRowBuilder()
          .addComponents(
              new ButtonBuilder()
                  .setCustomId('temp_lock')
                  .setLabel('Lock')
                  .setStyle(ButtonStyle.Danger)
                  .setEmoji('🔒'),
              new ButtonBuilder()
                  .setCustomId('temp_unlock')
                  .setLabel('Unlock')
                  .setStyle(ButtonStyle.Success)
                  .setEmoji('🔓'),
              new ButtonBuilder()
                  .setCustomId('temp_limit')
                  .setLabel('User Limit')
                  .setStyle(ButtonStyle.Primary)
                  .setEmoji('👥'),
              new ButtonBuilder()
                  .setCustomId('temp_rename')
                  .setLabel('Rename')
                  .setStyle(ButtonStyle.Primary)
                  .setEmoji('✏️'),
              new ButtonBuilder()
                  .setCustomId('temp_invite')
                  .setLabel('Invite')
                  .setStyle(ButtonStyle.Success)
                  .setEmoji('📨')
          );

      const row2 = new ActionRowBuilder()
          .addComponents(
              new ButtonBuilder()
                  .setCustomId('temp_block')
                  .setLabel('Block')
                  .setStyle(ButtonStyle.Danger)
                  .setEmoji('🚫'),
              new ButtonBuilder()
                  .setCustomId('temp_unblock')
                  .setLabel('Unblock')
                  .setStyle(ButtonStyle.Success)
                  .setEmoji('✅'),
              new ButtonBuilder()
                  .setCustomId('temp_transfer')
                  .setLabel('Transfer')
                  .setStyle(ButtonStyle.Primary)
                  .setEmoji('👑'),
              new ButtonBuilder()
                  .setCustomId('temp_kick')
                  .setLabel('Kick')
                  .setStyle(ButtonStyle.Danger)
                  .setEmoji('🚪')
          );

      const row3 = new ActionRowBuilder()
          .addComponents(
              new ButtonBuilder()
                  .setCustomId('temp_delete')
                  .setLabel('Delete')
                  .setStyle(ButtonStyle.Danger)
                  .setEmoji('❌')
          );

      await message.channel.send({
          embeds: [embed],
          components: [row, row2, row3]
      });

      await message.delete().catch(() => {});

  } catch (error) {
      console.error('Error sending voice panel:', error);
      await message.reply('❌ حدث خطأ أثناء إنشاء لوحة التحكم.');
  }

});

  
  client8.on("interactionCreate" , async(interaction) => {
    if(interaction.customId === "help_general"){
      const embed = new EmbedBuilder()
          .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
          .setTitle('قائمة اوامر البوت')
          .addFields(
        {name : `\`/help\`` , value : `عرض قائمة الأوامر`},
        {name : `\`/support\`` , value : `رابط سيرفر الدعم الفني`},
        {name : `\`${prefix}help\`` , value : `عرض قائمة الأوامر`},
      )
          .setTimestamp()
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
        {name : `\`/tempvoice setup\`` , value : `تفعيل نظام الرومات المؤقتة`},
        {name : `\`/tempvoice disable\`` , value : `تعطيل نظام الرومات المؤقتة`},
        {name : `\`/tempvoice panel\`` , value : `عرض لوحة التحكم بالرومات المؤقتة`},
        {name : `\`/bot- avatar\`` , value : `تغيير صورة البوت`},
        {name : `\`/bot- name\`` , value : ` تغيير اسم البوت`},
        {name : `\`/set-straming\`` , value : `تغيير حالة البوت`},
        {name : `\`/join-voice\`` , value : `الانضمام الى روم صوتي`},
        {name : `\`${prefix}temp\`` , value : `عرض لوحة التحكم بالرومات المؤقتة`},

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





client8.login(token)
  .catch(async(err) => {
    const filtered = tempvoice.filter(bo => bo != data)
    await tokens.set(`tempvoice` , filtered)
    console.log(`${clientId} Not working and removed `)
  });
})