const { Events, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const { Database } = require('st.db');
const db = new Database('/Json-db/Bots/ticketDB');
const confirme = "هل انت متأكد من إغلاقك للتذكرة؟";
const discordTranscripts = require('discord-html-transcripts');

module.exports = (client7) => {
  client7.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      const { customId } = interaction;

      if (customId === 'close') {
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder().setCustomId('Yes11').setLabel('Close').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('No11').setLabel('Cancel').setStyle(ButtonStyle.Secondary),
          );

        await interaction.reply({ content: confirme, components: [row] });

      } else if (customId === 'Yes11') {
        const id = db.get('closed');
        const Ticket = db.get(`TICKET-PANEL_${interaction.channel.id}`);

        await interaction.channel.permissionOverwrites.edit(Ticket.author, { ViewChannel: false });
        const embed2 = new EmbedBuilder()
          .setDescription(`تم اغلاق تذكرة بواسطة ${interaction.user}`)
          .setColor("Yellow");
        const embed = new EmbedBuilder()
          .setDescription("```لوحة فريق الدعم.```")
          .setColor("DarkButNotBlack");
        const roww = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('Open').setLabel('Open').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('Tran').setLabel('Transcript').setStyle(ButtonStyle.Secondary),
          );

        await interaction.deferUpdate();

        await interaction.editReply({ 
            content: '', 
            embeds: [embed2, embed], 
            components: [roww]
        });

      } else if (customId === 'No11') {
        await interaction.deferUpdate();
        await interaction.deleteReply();

      } else if (customId === 'delete') {
        const Ticket = db.get(`TICKET-PANEL_${interaction.channel.id}`);
        
        // Create and send transcript to owner
        try {
            const channel = interaction.channel;
            const attachment = await discordTranscripts.createTranscript(channel);
            const ticketOwner = await interaction.guild.members.fetch(Ticket.author);
            
            const transcriptEmbed = new EmbedBuilder()
                .setTitle(`نسخة من التذكرة: ${channel.name}`)
                .setDescription('تم حذف التذكرة. مرفق نسخة من المحادثة')
                .setColor('Blue')
                .setTimestamp();

            await ticketOwner.send({
                embeds: [transcriptEmbed],
                files: [attachment]
            });
        } catch (error) {
            console.error('Failed to send transcript to user:', error);
        }

        await interaction.reply({ content: `سيتم حذف التذكرة خلال 5 ثواني`, ephemeral: true });
        setTimeout(async () => {
            await interaction.channel.delete();
            db.delete(`TICKET-PANEL_${interaction.channel.id}`);
        }, 5000);

      } else if (customId === 'Open') {
        const Ticket = db.get(`TICKET-PANEL_${interaction.channel.id}`);
        await interaction.channel.permissionOverwrites.edit(Ticket?.author, { ViewChannel: true });
        await interaction.deferUpdate();
        await interaction.deleteReply();

      } else if (customId === 'Tran') {
        const channel = interaction.channel;
        const attachment = await discordTranscripts.createTranscript(channel);

        const Logs = db.get(`LogsRoom_${interaction.guild.id}`);
        const Trans = db.get(`TransRoom_${interaction.guild.id}`);
        const logChannel = interaction.guild.channels.cache.get(Logs);
        const TransChannel = interaction.guild.channels.cache.get(Trans);
        const Ticket = db.get(`TICKET-PANEL_${interaction.channel.id}`);
        if (!TransChannel) {
          await interaction.reply({ content: "لم يتم تحديد روم لوغ، استخدم /set-log لتحديده.", ephemeral: true });
          return;
         }
        const embed = new EmbedBuilder()
          .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
          .setTitle('Transcripted Ticket')
          .setFields(
            { name: `Name Ticket`, value: `${interaction.channel.name}` },
            { name: `Owner Ticket`, value: `${Ticket.author}` },
            { name: `Transcript BY `, value: `${interaction.user}` },
          )
          .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

        logChannel?.send({ embeds: [embed] });
        TransChannel?.send({ files: [attachment] });
        await interaction.reply({ content: `#${interaction.channel.name} has been successfully Transcripted`, ephemeral: true });
      }
    }
  });
};
