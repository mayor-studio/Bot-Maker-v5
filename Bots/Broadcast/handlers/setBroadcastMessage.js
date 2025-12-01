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
  MessageComponentCollector,
} = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/BroadcastDB");

module.exports = (client2) => {
  client2.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      if (interaction.customId == "broadcast_message_button") {
        try {
          const modal = new ModalBuilder()
            .setCustomId(`broadcast_message_modal`)
            .setTitle(`Set Broadcast Message`);
          const tokenn = new TextInputBuilder()
            .setCustomId("the_message")
            .setLabel(`Message`)
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(1)
            .setMaxLength(4000);
          const firstActionRow = new ActionRowBuilder().addComponents(tokenn);
          modal.addComponents(firstActionRow);
          await interaction.showModal(modal);
        } catch (error) {
          return interaction.reply({ content: `${error.message}` });
        }
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId == "broadcast_message_modal") {
        await interaction.deferReply({ ephemeral: false });
        const themessage = interaction.fields.getTextInputValue(`the_message`);
        await db.set(`broadcast_msg_${interaction.guild.id}`, themessage);
        const broadcast_msg =
          db.get(`broadcast_msg_${interaction.guild.id}`) ?? themessage;
        const msgid = db.get(`msgid_${interaction.guild.id}`);
        let tokens = db.get(`tokens_${interaction.guild.id}`);
        if (!tokens) {
          await db.set(`tokens_${interaction.guild.id}`, []);
        }
        tokens = db.get(`tokens_${interaction.guild.id}`);
        if (msgid) {
          interaction.channel.messages.fetch(msgid).then(async (msgg) => {
            const embed2 = new EmbedBuilder()
              .setTitle(`**Broadcast Control Panel**`)
              .addFields(
                {
                  name: `**Number of Registered Bots**`,
                  value: `**\`\`\`${tokens.length ?? "Unable to detect"} bots\`\`\`**`,
                  inline: false,
                },
                {
                  name: `**Current Broadcast Message**`,
                  value: `**\`\`\`${broadcast_msg}\`\`\`**`,
                  inline: false,
                }
              )
              .setDescription(`**You can control the broadcast using the buttons below**`)
              .setColor("Aqua")
              .setFooter({
                text: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
              })
              .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
              })
              .setTimestamp(Date.now());
            msgg.edit({ embeds: [embed2] });
          });
        }
        return interaction.editReply({ content: `**Message set successfully**` });
      }
    }
  });
};
