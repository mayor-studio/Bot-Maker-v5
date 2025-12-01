const { Client, Collection, discord, GatewayIntentBits, Partials, EmbedBuilder, ApplicationCommandOptionType, Events, ActionRowBuilder, ButtonBuilder, MessageAttachment, ButtonStyle, Message, StringSelectMenuBuilder } = require("discord.js");
const { Database } = require("st.db");
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database("/database/usersdata/usersdata");
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens");
const { PermissionsBitField } = require('discord.js');
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions");
const applyDB = new Database("/Json-db/Bots/applyDB.json");
let apply = tokens.get("apply");
const path = require('path');
const { readdirSync } = require("fs");
const mainBot = require('../../index');

module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction) {
    if (interaction.isModalSubmit()) {
      if (interaction.customId == "BuyApply_Modal") {
        await interaction.deferReply({ ephemeral: true });
        let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`));
        const Bot_token = interaction.fields.getTextInputValue("Bot_token");
        const Bot_prefix = interaction.fields.getTextInputValue("Bot_prefix");
        const client13 = new Client({ intents: 131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember] });

        try {
          const owner = interaction.user.id;
          let price1 = prices.get(`apply_price_${interaction.guild.id}`) || 40;
          price1 = parseInt(price1);
          const newbalance = parseInt(userbalance) - parseInt(price1);
          await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newbalance);

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
          const { REST } = require('@discordjs/rest');
          const rest = new REST({ version: '10' }).setToken(Bot_token);
          const { Routes } = require('discord-api-types/v10');

          client13.on("ready", async () => {
            let doneembeduser = new EmbedBuilder()
              .setTitle("✅ Your bot was successfully created")
              .setDescription("**Invoice Information:**")
              .addFields(
                {
                  name: "Invoice",
                  value: `\`${invoice}\``,
                  inline: false
                },
                {
                  name: "Bot Type",
                  value: "`Apply Bot`",
                  inline: false
                },
                {
                  name: "Bot Token",
                  value: `\`${Bot_token}\``,
                  inline: false
                },
                {
                  name: "Prefix",
                  value: `\`${Bot_prefix}\``,
                  inline: false
                }
              );
            await invoices.set(`${invoice}_${interaction.guild.id}`, {
              type: "Applications",
              token: `${Bot_token}`,
              prefix: `${Bot_prefix}`,
              userid: `${interaction.user.id}`,
              guildid: `${interaction.guild.id}`,
              serverid: "General",
              price: price1
            });

            const thebut = new ButtonBuilder()
              .setLabel("Invite Bot")
              .setStyle(ButtonStyle.Link)
              .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client13.user.id}&permissions=8&scope=bot%20applications.commands`);

            const supportButton = new ButtonBuilder()
              .setLabel('Support Server')
              .setStyle(ButtonStyle.Link)
              .setURL('https://discord.gg/mayor'); // Replace with your support server invite

            const youtubeButton = new ButtonBuilder()
              .setLabel('YouTube')
              .setStyle(ButtonStyle.Link)
              .setURL('https://youtube.com/@3mran77'); // Replace with your YouTube channel

            const rowss = new ActionRowBuilder().addComponents(thebut, supportButton, youtubeButton);
            await interaction.user.send({ embeds: [doneembeduser], components: [rowss] });
          });

          // Create purchase embed and send to log channel
          let doneembedprove = new EmbedBuilder()
            .setColor('Aqua')
            .setTitle('New Purchase Process')
            .addFields(
              { name: 'Buyer', value: `${interaction.user} | \`${interaction.user.tag}\``, inline: true },
              { name: 'Bot Type', value: 'Apply Bot', inline: true },
              { name: 'User Balance', value: `\`${newbalance}\``, inline: true },
              { name: 'Bot Price', value: `\`${price1}\``, inline: true }
            )
            .setImage(interaction.guild.banner ? interaction.guild.bannerURL({ dynamic: true, size: 1024 }) : null)
            .setFooter({ text: `Developed by ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
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
          await theroom.send({ embeds: [doneembedprove], components: [logRow] });

          // Create webhook embed for official server logs
          const { WebhookClient } = require('discord.js');
          const { purchaseWebhookUrl } = require('../../config.json');
          const webhookClient = new WebhookClient({ url: purchaseWebhookUrl });
          const theEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('New Purchase Completed')
            .addFields(
              { name: "Bot Type", value: "`Applications`", inline: true },
              { name: "Bot Price", value: `\`${price1}\``, inline: true },
              { name: "Buyer", value: `\`${interaction.user.username} [${interaction.user.id}]\``, inline: true },
              { name: "Server", value: `\`${interaction.guild.name} [${interaction.guild.id}]\``, inline: true },
              { name: "Server Owner", value: `\`${interaction.guild.ownerId}\``, inline: true },
              { name: "Invoice", value: `\`${invoice}\``, inline: false },
            );
          await webhookClient.send({ embeds: [theEmbed] });

          // Increase user's bought bots count
          let userbots = usersdata.get(`bots_${interaction.user.id}_${interaction.guild.id}`);
          if (!userbots) {
            await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}`, 1);
          } else {
            userbots = userbots + 1;
            await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}`, userbots);
          }

          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('Green')
                .setDescription(`<:Verified:1401460125612507156> Your bot has been successfully created and ${price1} has been deducted from your balance.`)
            ]
          });

          /**
           * @desc : Apply bot codes here
           */
          client13.commands = new Collection();
          client13.events = new Collection();
          require("../../Bots/apply/handlers/events")(client13);
          require("../../events/requireBots/apply-commands")(client13);
          const folderPath = path.resolve(__dirname, '../../Bots/apply/slashcommand13');
          const prefix = Bot_prefix;
          client13.applySlashCommands = new Collection();
          const applySlashCommands = [];
          const ascii = require("ascii-table");
          const table = new ascii("apply commands").setJustify();
          for (let folder of readdirSync(folderPath).filter(
            (folder) => !folder.includes(".")
          )) {
            for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
              f.endsWith(".js")
            )) {
              let command = require(`${folderPath}/${folder}/${file}`);
              if (command) {
                applySlashCommands.push(command.data.toJSON());
                client13.applySlashCommands.set(command.data.name, command);
                if (command.data.name) {
                  table.addRow(`${command.data.name}`, "🟢 Working");
                } else {
                  table.addRow(`${command.data.name}`, "🔴 Not Working");
                }
              }
            }
          }

          const folderPath3 = path.resolve(__dirname, '../../Bots/apply/handlers');
          for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
            const event = require(path.join(folderPath3, file))(client13);
          }

          client13.on('ready', async () => {
            setInterval(async () => {
              let BroadcastTokenss = tokens.get("apply");
              let thiss = BroadcastTokenss.find(br => br.token == Bot_token);
              if (thiss) {
                if (thiss.timeleft <= 0) {
                  console.log(`${client13.user.id} Ended`);
                  await client13.destroy();
                }
              }
            }, 1000);
          });

          client13.on("ready", async () => {
            try {
              await rest.put(
                Routes.applicationCommands(client13.user.id),
                { body: applySlashCommands },
              );
            } catch (error) {
              console.error(error);
            }
          });

          const folderPath2 = path.resolve(__dirname, '../../Bots/apply/events');
          for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
            const event = require(path.join(folderPath2, file));
          }

          client13.on("interactionCreate", async (interaction) => {
            if (interaction.isChatInputCommand()) {
              if (interaction.user.bot) return;

              const command = client13.applySlashCommands.get(interaction.commandName);

              if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
              }

              if (command.ownersOnly === true) {
                if (owner != interaction.user.id) {
                  return interaction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor('Red')
                        .setDescription("❗ You cannot use this command.")
                    ],
                    ephemeral: true
                  });
                }
              }
              if (command.adminsOnly === true) {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                  return interaction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor('Red')
                        .setDescription("❗ You must have Administrator permission to use this command.")
                    ],
                    ephemeral: true
                  });
                }
              }

              try {
                await command.execute(interaction);
              } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
              }
            }
          });

          client13.on("interactionCreate", async (interaction) => {
            if (!interaction.isStringSelectMenu()) return;

            if (interaction.customId === "help_menu") {
              let embed;

              if (interaction.values[0] === "general") {
                embed = new EmbedBuilder()
                  .setAuthor({
                    name: interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                  })
                  .setTitle('Bot Command List')
                  .addFields(
                    { name: "/help", value: "Show the command list" },
                    { name: "/support", value: "Join the support server" },
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                  })
                  .setColor('DarkButNotBlack');
              }

              if (interaction.values[0] === "owner") {
                embed = new EmbedBuilder()
                  .setAuthor({
                    name: interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                  })
                  .setTitle('Owner-Only Commands')
                  .addFields(
                    { name: "/setup-apply", value: "Setup the apply system" },
                    { name: "/new-apply", value: "Create a new application" },
                    { name: "/dm-mode", value: "Send DM to applicant upon accept/deny" },
                    { name: "/close-apply", value: "Close an open application" },
                    { name: "/set-slogan", value: "Set application slogan" },
                    { name: "/change-avatar", value: "Change bot avatar" },
                    { name: "/change-name", value: "Change bot name" },
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                  })
                  .setColor('DarkButNotBlack');
              }

              const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("help_menu")
                .setPlaceholder("Choose a command category")
                .addOptions([
                  {
                    label: "General",
                    value: "general",
                    description: "General bot commands",
                    emoji: "🌐",
                    default: interaction.values[0] === "general",
                  },
                  {
                    label: "Owner",
                    value: "owner",
                    description: "Owner-only commands",
                    emoji: "👑",
                    default: interaction.values[0] === "owner",
                  },
                ]);

              const row = new ActionRowBuilder().addComponents(selectMenu);

              await interaction.update({ embeds: [embed], components: [row] });
            }
          });

          //-- Login with the bot token
          await client13.login(Bot_token).catch(async () => {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor('Red')
                  .setDescription("<:Warning:1401460074937057422> Verification failed, please enable the last three options in your bot settings.")
              ]
            });
          });

          if (!apply) {
            await tokens.set("apply", [{ token: Bot_token, prefix: Bot_prefix, clientId: client13.user.id, owner: interaction.user.id, timeleft: 2629744 }]);
          } else {
            await tokens.push("apply", { token: Bot_token, prefix: Bot_prefix, clientId: client13.user.id, owner: interaction.user.id, timeleft: 2629744 });
          }

        } catch (error) {
          console.error(error);
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription("<:Warning:1401460074937057422> Please activate the three options or verify the bot token and try again.")
            ]
          });
        }
      }
    }
  }
}
