const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType } = require("discord.js");
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const prices = new Database("/database/settingsdata/prices");
const { PermissionsBitField } = require('discord.js');
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const tempvoiceDB = new Database("/Json-db/Bots/tempvoiceDB.json");


let tempvoice = tokens.get(`tempvoice`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuyTempvoice_Modal") {
            await interaction.deferReply({ephemeral:true})
            let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`))
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            
            const client8 = new Client({intents: 131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try{
              const owner = interaction.user.id
                let price1 = prices.get(`tempvoice_price_${interaction.guild.id}`) || 40;
                price1 = parseInt(price1)
                const newbalance = parseInt(userbalance) - parseInt(price1)
                await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newbalance)

                function generateRandomCode() {
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
                        name:`**نوع البوت**`,value:`**\`Temp Voice Bot\`**`,inline:false
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
                    type:`Temp Voice`,
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
                client8.on('ready' , async() => {

                  const thebut = new ButtonBuilder()
                    .setLabel(`دعوة البوت`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client8.user.id}&permissions=8&scope=bot%20applications.commands`);

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
                        {name: 'نوع البوت', value: '`**Temp Voice Bot**`', inline: true},
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
                                                  {name : `نوع البوت` , value : `\`\`\`Temp Voice\`\`\`` , inline : true},
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
                client8.commands = new Collection();
            client8.events = new Collection();
            require("../../Bots/tempvoice/handlers/events")(client8)
            require("../../events/requireBots/tempvoice-commands")(client8);
            const folderPath = path.resolve(__dirname, '../../Bots/tempvoice/slashcommand8');
            const prefix = Bot_prefix
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
client8.on('ready' , async() => {
  setInterval(async() => {
    let tempvoiceTokenss = tokens.get(`tempvoice`)
    let thiss = tempvoiceTokenss.find(br => br.token == Bot_token)
    if(thiss) {
      if(thiss.timeleft <= 0) {
        console.log(`${client8.user.id} Ended`)
        await client8.destroy();
      }
    }
  }, 1000);
})
const folderPath3 = path.resolve(__dirname, '../../Bots/tempvoice/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client8);
}
client8.on('guildMemberAdd' , async(member) => {
  const dataFind = tempvoiceDB.get(`tempvoice_${member.guild.id}`)
  if(dataFind) {
    if(!dataFind.includes(member.user.id)) return;
    const roleFind = tempvoiceDB.get(`tempvoice_role_${member.guild.id}`)
    if(roleFind) {
      try {
        member.roles.add(roleFind)
      } catch {
        return;
      }
    }
  }
})

//// temp voice

const tempChannels = new Map();

// Find the voiceStateUpdate event handler and replace it with this:

client8.on('voiceStateUpdate', async (oldState, newState) => {
  try {
      const config = tempvoiceDB.get(`tempvoice_${newState.guild.id}`);
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

// Handle button interactions
client8.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() && !interaction.isModalSubmit()) return;

  try {
      if (interaction.isButton() && interaction.customId.startsWith('temp_')) {
          const member = interaction.member;
          const voiceChannel = member.voice.channel;

          if (!voiceChannel || !tempChannels.has(voiceChannel.id)) {
              return interaction.reply({
                  content: '❌ You must be in your temporary voice channel to use these controls!',
                  ephemeral: true
              });
          }

          if (tempChannels.get(voiceChannel.id) !== member.id) {
              return interaction.reply({
                  content: '❌ Only the channel owner can use these controls!',
                  ephemeral: true
              });
          }

          switch (interaction.customId) {
              case 'temp_lock': {
                  const isLocked = voiceChannel.permissionsFor(interaction.guild.roles.everyone).has(PermissionsBitField.Flags.Connect);
                  await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                      Connect: !isLocked
                  });
                  await interaction.reply({
                      content: `🔒 Channel ${isLocked ? 'locked' : 'unlocked'}!`,
                      ephemeral: true
                  });
                  break;
              }

              case 'temp_limit': {
                  const modal = new ModalBuilder()
                      .setCustomId('temp_limit_modal')
                      .setTitle('Set User Limit');

                  const limitInput = new TextInputBuilder()
                      .setCustomId('limit_input')
                      .setLabel('Enter user limit (0-99)')
                      .setStyle(TextInputStyle.Short)
                      .setPlaceholder('Enter a number between 0 and 99')
                      .setMinLength(1)
                      .setMaxLength(2)
                      .setRequired(true);

                  modal.addComponents(new ActionRowBuilder().addComponents(limitInput));
                  await interaction.showModal(modal);
                  break;
              }

              case 'temp_rename': {
                  const modal = new ModalBuilder()
                      .setCustomId('temp_rename_modal')
                      .setTitle('Rename Channel');

                  const nameInput = new TextInputBuilder()
                      .setCustomId('name_input')
                      .setLabel('Enter new channel name')
                      .setStyle(TextInputStyle.Short)
                      .setPlaceholder('Enter a new name for your channel')
                      .setMinLength(1)
                      .setMaxLength(32)
                      .setRequired(true);

                  modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
                  await interaction.showModal(modal);
                  break;
              }
              case 'temp_claim': {
                const currentOwner = tempChannels.get(voiceChannel.id);
                const currentOwnerMember = await interaction.guild.members.fetch(currentOwner).catch(() => null);
                const claimingMember = interaction.member;
            
                // Check if current owner exists and is in the voice channel
                const isOwnerInChannel = currentOwnerMember?.voice?.channel?.id === voiceChannel.id;
            
                // Allow claim if owner left or isn't in the channel
                if (!isOwnerInChannel) {
                    // Ensure claiming member is in the voice channel
                    if (claimingMember.voice.channel?.id === voiceChannel.id) {
                        // Update ownership in the Map
                        tempChannels.set(voiceChannel.id, claimingMember.id);
            
                        // Set new owner permissions
                        await voiceChannel.permissionOverwrites.edit(claimingMember.id, {
                            ManageChannels: true,
                            MoveMembers: true,
                            Connect: true,
                            Speak: true
                        });
            
                        // Remove old owner's permissions
                        if (currentOwner && currentOwner !== claimingMember.id) {
                            await voiceChannel.permissionOverwrites.edit(currentOwner, {
                                ManageChannels: false,
                                MoveMembers: false
                            });
                        }
            
                        // Update channel name to new owner
                        await voiceChannel.setName(`${claimingMember.user.username}'s Channel`);
            
                        await interaction.reply({
                            content: '👑 You are now the channel owner! The channel has been updated with your name.',
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            content: '❌ You must be in the voice channel to claim ownership!',
                            ephemeral: true
                        });
                    }
                } else {
                    await interaction.reply({
                        content: '❌ The current owner is still in the channel!',
                        ephemeral: true
                    });
                }
                break;
            }
              case 'temp_delete': {
                  await voiceChannel.delete();
                  tempChannels.delete(voiceChannel.id);
                  await interaction.reply({
                      content: '✅ Channel deleted!',
                      ephemeral: true
                  });
                  break;
              }
          }
      }

      // Handle modal submissions
      if (interaction.isModalSubmit()) {
          const voiceChannel = interaction.member.voice.channel;

          if (!voiceChannel || !tempChannels.has(voiceChannel.id)) {
              return interaction.reply({
                  content: '❌ You must be in your temporary voice channel!',
                  ephemeral: true
              });
          }

          switch (interaction.customId) {
              case 'temp_limit_modal': {
                  const limit = parseInt(interaction.fields.getTextInputValue('limit_input'));

                  if (isNaN(limit) || limit < 0 || limit > 99) {
                      return interaction.reply({
                          content: '❌ Please enter a valid number between 0 and 99!',
                          ephemeral: true
                      });
                  }

                  await voiceChannel.setUserLimit(limit);
                  await interaction.reply({
                      content: `✅ User limit set to ${limit}!`,
                      ephemeral: true
                  });
                  break;
              }

              case 'temp_rename_modal': {
                  const newName = interaction.fields.getTextInputValue('name_input');
                  await voiceChannel.setName(newName);
                  await interaction.reply({
                      content: '✅ Channel renamed successfully!',
                      ephemeral: true
                  });
                  break;
              }
          }
      }
  } catch (error) {
      console.error('Error handling temporary voice interaction:', error);
      if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
              content: '❌ An error occurred while processing your request.',
              ephemeral: true
          }).catch(() => {});
      }
  }
});

// Add this to your messageCreate event handler

client8.on('messageCreate', async (message) => {
  if (!message.content.startsWith(`${prefix}temp`) || message.author.bot) return;

  // Check permissions
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ You need Administrator permissions to use this command!');
  }

  try {
      const config = tempvoiceDB.get(`tempvoice_${message.guild.id}`);
      if (!config) {
          return message.reply('❌ Temporary voice system is not set up! Use `/tempvoice setup` first.');
      }

      // Create embed for the panel
      const embed = new EmbedBuilder()
          .setTitle('🎙️ Temporary Voice Channel Controls')
          .setDescription('Join the voice channel to create your own temporary voice channel!\n\n**Controls:**')
          .addFields(
              { name: '🔒 Lock/Unlock', value: 'Control who can join your channel' },
              { name: '👥 User Limit', value: 'Set the maximum number of users' },
              { name: '✏️ Rename', value: 'Change your channel name' },
              { name: '👑 Claim', value: 'Claim ownership if the owner left' },
              { name: '❌ Delete', value: 'Delete your temporary channel' }
          )
          .setColor('Blue')
          .setTimestamp();

      // Create buttons
      const row = new ActionRowBuilder()
          .addComponents(
              new ButtonBuilder()
                  .setCustomId('temp_lock')
                  .setLabel('Lock/Unlock')
                  .setStyle(ButtonStyle.Primary)
                  .setEmoji('🔒'),
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
                  .setCustomId('temp_claim')
                  .setLabel('Claim')
                  .setStyle(ButtonStyle.Success)
                  .setEmoji('👑'),
              new ButtonBuilder()
                  .setCustomId('temp_delete')
                  .setLabel('Delete')
                  .setStyle(ButtonStyle.Danger)
                  .setEmoji('❌')
          );


          await message.channel.send({
          embeds: [embed],
          components: [row]
      });


      await message.delete().catch(() => {});

  } catch (error) {
      console.error('Error sending voice panel:', error);
      await message.reply('❌ An error occurred while creating the voice panel.');
  }
});

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
              const folderPath2 = path.resolve(__dirname, '../../Bots/tempvoice/events');

            for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
                const event = require(path.join(folderPath2, file));
            }
                client8.on("interactionCreate" , async(interaction) => {
                    if (interaction.isChatInputCommand()) {
                        if(interaction.user.bot) return;
                      
                      const command = client8.tempvoiceSlashCommands.get(interaction.commandName);
                        
                      if (!command) {
                        console.error(`No command matching ${interaction.commandName} was found.`);
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
                            console.error(`Error executing ${interaction.commandName}`);
                            console.error(error);
                        }
                    }
                  } )
                
                  await client8.login(Bot_token).catch(async() => {
                    return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
                  })
                  if(!tempvoice) {
                      await tokens.set(`tempvoice` , [{token:Bot_token,prefix:Bot_prefix,clientId:client8.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`tempvoice` , {token:Bot_token,prefix:Bot_prefix,clientId:client8.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
        
            
            }catch(error){
                console.error(error)
                return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
            }
        }
    }
  }
}