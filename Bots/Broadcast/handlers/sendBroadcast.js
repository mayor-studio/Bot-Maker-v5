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

// Simple delay helper
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = (client2) => {
  client2.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      if (interaction.customId === "run_broadcast_button") {
        await interaction.deferReply({ ephemeral: true });

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("send_online")
            .setLabel("إرسال للأونلاين")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("send_offline")
            .setLabel("إرسال للأوفلاين")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("send_all")
            .setLabel("إرسال للجميع")
            .setStyle(ButtonStyle.Primary)
        );

        await interaction.editReply({
          content: "اختر نوع الارسال:",
          components: [buttons],
          ephemeral: true,
        });
      }

      if (
        interaction.customId === "send_online" ||
        interaction.customId === "send_offline" ||
        interaction.customId === "send_all"
      ) {
        await interaction.deferReply({ ephemeral: false });

        const thetokens = db.get(`tokens_${interaction.guild.id}`);
        if (!thetokens || thetokens.length <= 0)
          return interaction.editReply({
            content: `**لم يتم اضافة اي توكن لبوتات البرودكاست**`,
            ephemeral: true,
          });
        const broadcast_msg = db.get(`broadcast_msg_${interaction.guild.id}`);
        if (!broadcast_msg)
          return interaction.reply({
            content: `**لم يتم تحديد رسالة البرودكاست**`,
            ephemeral: true,
          });

        await interaction.guild.members.fetch();
        let allMembers = interaction.guild.members.cache;

        if (interaction.customId === "send_online") {
          allMembers = allMembers.filter(
            (mem) =>
              !mem.user.bot &&
              (mem.presence?.status === "online" ||
                mem.presence?.status === "dnd" ||
                mem.presence?.status === "idle" ||
                mem.presence?.activities.some(
                  (activity) => activity.type === ActivityType.Streaming
                ))
          );
        } else if (interaction.customId === "send_offline") {
          allMembers = allMembers.filter(
            (mem) => !mem.user.bot && (!mem.presence || mem.presence.status === "offline")
          );
        } else if (interaction.customId === "send_all") {
          allMembers = allMembers.filter((mem) => !mem.user.bot);
        }

        const allMemberIds = allMembers.map((mem) => mem.user.id);

        const botsNum = thetokens.length;
        // divide members into chunks for each bot
        const membersPerBot = Math.ceil(allMemberIds.length / botsNum);
        const submembers = [];
        for (let i = 0; i < allMemberIds.length; i += membersPerBot) {
          submembers.push(allMemberIds.slice(i, i + membersPerBot));
        }

        let donemembers = 0;
        let faildmembers = 0;

        const embedStatus = new EmbedBuilder()
          .setTitle(`**تم البدأ في ارسال رسالة البرودكاست**`)
          .setColor("Aqua")
          .setDescription(
            `**⚫ عدد الاعضاء : \`${allMemberIds.length}\`\n🟢 تم الارسال الى : \`${donemembers}\`\n🔴 فشل الارسال الى : \`${faildmembers}\`**`
          );
        const mesg = await interaction.editReply({ embeds: [embedStatus] });

        // Login all clients once
        const clients = [];
        for (const token of thetokens) {
          const clienter = new Client({ intents: 131071 });
          try {
            await clienter.login(token);
            clients.push(clienter);
          } catch {
            // skip tokens that can't login
            faildmembers += membersPerBot;
          }
        }

        for (let i = 0; i < submembers.length; i++) {
          const clienter = clients[i];
          if (!clienter) continue;

          for (const userId of submembers[i]) {
            try {
              const user = await clienter.users.fetch(userId);
              await user.send({ content: `**${broadcast_msg}\n<@${userId}>**` });
              donemembers++;
            } catch {
              faildmembers++;
            }

            // Update progress every 5 messages or at end
            if ((donemembers + faildmembers) % 5 === 0 || (donemembers + faildmembers) === allMemberIds.length) {
              const embedUpdate = new EmbedBuilder()
                .setTitle(`**جارٍ ارسال رسالة البرودكاست**`)
                .setColor("Aqua")
                .setDescription(
                  `**⚫ عدد الاعضاء : \`${allMemberIds.length}\`\n🟢 تم الارسال الى : \`${donemembers}\`\n🔴 فشل الارسال الى : \`${faildmembers}\`**`
                );
              await mesg.edit({ embeds: [embedUpdate] });
            }

            // Delay 1500ms between messages to avoid ratelimits & bans
            await delay(1500);
          }

          // Logout client after finishing
          await clienter.destroy();
        }

        // Final summary
        const embedDone = new EmbedBuilder()
          .setTitle(`**تم الانتهاء من ارسال رسالة البرودكاست**`)
          .setColor("Green")
          .setDescription(
            `**⚫ عدد الاعضاء : \`${allMemberIds.length}\`\n🟢 تم الارسال الى : \`${donemembers}\`\n🔴 فشل الارسال الى : \`${faildmembers}\`**`
          );
        await mesg.edit({ embeds: [embedDone] });
      }
    }
  });
};
