const {
  SlashCommandBuilder,
  Events,
  Client,
  ActivityType,
  ModalBuilder,
  TextInputStyle,
  EmbedBuilder,
  PermissionsBitField,
  ButtonStyle,
  TextInputBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  MessageComponentCollector
} = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/BroadcastDB");

module.exports = (client2) => {
  client2.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      if (interaction.customId === "add_token_button") {
        try {
          const modal = new ModalBuilder()
            .setCustomId(`add_token_modal`)
            .setTitle(`Add a Broadcast Bot Token`);

          const tokenInput = new TextInputBuilder()
            .setCustomId('the_token')
            .setLabel(`Bot Token`)
            .setStyle(TextInputStyle.Short)
            .setMinLength(65)
            .setMaxLength(85);

          const firstActionRow = new ActionRowBuilder().addComponents(tokenInput);
          modal.addComponents(firstActionRow);

          await interaction.showModal(modal);
        } catch (error) {
          return interaction.reply({ content: `${error.message}` });
        }
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "add_token_modal") {
        try {
          await interaction.deferReply({ ephemeral: false });
          const theToken = interaction.fields.getTextInputValue(`the_token`);
          const existingTokens = db.get(`tokens_${interaction.guild.id}`);

          if (existingTokens && existingTokens.includes(theToken)) {
            return interaction.editReply({ content: `**This token already exists.**` });
          }

          const clienter = new Client({ intents: 131071 });
          await clienter.login(theToken);
          clienter.user.setActivity(`Hello I'm BC Bot`);

          const embed1 = new EmbedBuilder()
            .setTitle(`✅ Successfully Logged In`)
            .setTimestamp()
            .setColor('Aqua')
            .addFields(
              {
                name: `Bot Username`,
                value: `\`\`\`${clienter.user.tag}\`\`\``,
                inline: false
              },
              {
                name: `Bot ID`,
                value: `\`\`\`${clienter.user.id}\`\`\``,
                inline: false
              }
            );

          const inviteButton = new ButtonBuilder()
            .setLabel('Invite Bot')
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${clienter.user.id}&permissions=8&scope=bot`)
            .setStyle(ButtonStyle.Link);

          const row = new ActionRowBuilder().addComponents(inviteButton);
          await interaction.editReply({ embeds: [embed1], components: [row] });

          let tokens = db.get(`tokens_${interaction.guild.id}`);
          if (!tokens) {
            await db.set(`tokens_${interaction.guild.id}`, [theToken]);
          } else {
            await db.push(`tokens_${interaction.guild.id}`, theToken);
          }

          tokens = db.get(`tokens_${interaction.guild.id}`);
          const broadcastMsg = db.get(`broadcast_msg_${interaction.guild.id}`) ?? "No broadcast message set.";
          const msgId = db.get(`msgid_${interaction.guild.id}`);

          if (msgId) {
            interaction.channel.messages.fetch(msgId).then(async (msgg) => {
              const embed2 = new EmbedBuilder()
                .setTitle(`📢 Broadcast Control Panel`)
                .addFields(
                  {
                    name: `Registered Bots`,
                    value: `\`\`\`${tokens.length ?? "Unable to determine"} bot(s)\`\`\``,
                    inline: false
                  },
                  {
                    name: `Current Broadcast Message`,
                    value: `\`\`\`${broadcastMsg}\`\`\``,
                    inline: false
                  }
                )
                .setDescription(`Use the buttons below to control the bot.`)
                .setColor('Aqua')
                .setFooter({
                  text: interaction.user.username,
                  iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setAuthor({
                  name: interaction.guild.name,
                  iconURL: interaction.guild.iconURL({ dynamic: true })
                })
                .setTimestamp(Date.now());

              msgg.edit({ embeds: [embed2] });
            });
          }

        } catch (error) {
          return interaction.editReply({
            content: `❌ Please check the bot token or enable the last 3 options in the bot settings.`
          });
        }
      }
    }
  });
};
