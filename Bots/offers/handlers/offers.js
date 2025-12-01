const {
  Events,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder
} = require("discord.js");
const discordTranscripts = require("discord-html-transcripts");
const { Database } = require("st.db");
const offersDB = new Database("/Json-db/Bots/offersDB.json");

module.exports = (client31) => {
  client31.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    let [type, userId] = interaction.customId.split("_");

    // Handle ticket creation
    if (type === "aord") {
      const categoryId = offersDB.get(`offers_category_${interaction.guild.id}`);
      const category = interaction.guild.channels.cache.get(categoryId);

      if (!category || category.type !== ChannelType.GuildCategory) {
        return interaction.reply({
          content: "❌ The system has not been set up properly by an admin.",
          ephemeral: true,
        });
      }

      const user = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!user) {
        return interaction.reply({
          content: "❌ The seller is no longer in the server.",
          ephemeral: true,
        });
      }

      // Prevent multiple tickets by checking for existing ones
      const existing = interaction.guild.channels.cache.find(
        c =>
          c.parentId === category.id &&
          c.name === `order-${user.user.username}` &&
          c.permissionsFor(userId)?.has(PermissionsBitField.Flags.ViewChannel)
      );
      if (existing) {
        return interaction.reply({
          content: `⚠️ A ticket already exists: <#${existing.id}>`,
          ephemeral: true,
        });
      }

      const channelName = `order-${user.user.username}`;
      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: userId,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      const embedDescription =
        offersDB.get(`ticket_embed_description_${interaction.guild.id}`) ||
        `✅ Your ticket has been created. Please wait for the seller to respond.\n\n**Reminder:** The server is not responsible for any deals without a trusted middleman.`;

      const embed = new EmbedBuilder()
        .setDescription(embedDescription)
        .setColor("Random")
        .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`scome_${userId}`)
          .setLabel("Ping Seller")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`closeoffer`)
          .setLabel("Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `<@${interaction.user.id}>, <@${userId}>`,
        embeds: [embed],
        components: [row],
      });

      try {
        await user.send(`📬 You have a new order: <#${channel.id}>`);
      } catch (err) {
        console.log(`⚠️ Could not DM user: ${userId}`);
      }

      return interaction.reply({ content: `✅ Ticket created: <#${channel.id}>`, ephemeral: true });
    }

    // Delete the offer post
    if (type === "deloff") {
      if (interaction.user.id !== userId) {
        return interaction.reply({ content: "❌ You are not the owner of this post.", ephemeral: true });
      }

      const message = await interaction.channel.messages.fetch(interaction.message.id);
      if (message) {
        await message.delete();
        return interaction.reply({ content: "✅ Post deleted successfully.", ephemeral: true });
      } else {
        return interaction.reply({ content: "⚠️ The post is already deleted.", ephemeral: true });
      }
    }

    // Seller summon button (Ping Seller) with 12h cooldown
    if (type === "scome") {
      const user = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!user) {
        return interaction.reply({ content: "❌ The seller is no longer in the server.", ephemeral: true });
      }

      const ticketData = offersDB.get(`ticket_${interaction.channel.id}`);
      const now = Date.now();

      if (ticketData?.lastPing && now - ticketData.lastPing < 43200000) { // 12h in ms
        const remaining = 43200000 - (now - ticketData.lastPing);
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        return interaction.reply({
          content: `⏳ You can ping the seller again in **${hours}h ${minutes}m**.`,
          ephemeral: true
        });
      }

      try {
        await user.send(`🔔 You've been summoned to: <#${interaction.channel.id}>`);
        await offersDB.set(`ticket_${interaction.channel.id}`, {
          sellerId: userId,
          lastPing: now,
        });
        return interaction.reply({ content: "✅ The seller has been notified.", ephemeral: true });
      } catch (err) {
        return interaction.reply({ content: "⚠️ Could not notify the seller in DMs.", ephemeral: true });
      }
    }

    // Ticket delete confirmation prompt
    if (type === "closeoffer") {
      return interaction.reply({
        content: "**Are you sure you want to close this ticket?**",
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`confirmDelete_${interaction.channel.id}`)
              .setLabel("Yes")
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId(`cancelDelete_${interaction.channel.id}`)
              .setLabel("No")
              .setStyle(ButtonStyle.Secondary)
          ),
        ],
        ephemeral: false,
      });
    }

    // Confirm ticket delete
    if (type === "confirmDelete") {
      const channel = interaction.guild.channels.cache.get(userId); // userId = channel.id in this case

      if (!channel) return;

      const attachment = await discordTranscripts.createTranscript(channel, {
        poweredBy: false,
        footerText: `System Store By MAYOR Host`,
      });

      const transcriptsChannelId = offersDB.get(`trans_cha_${interaction.guild.id}`);
      const transcriptsChannel = interaction.guild.channels.cache.get(transcriptsChannelId);

      if (transcriptsChannel) {
        const embed = new EmbedBuilder()
          .setTitle(`📜 Transcript for: ${channel.name}`)
          .setColor("Random");

        await transcriptsChannel.send({ embeds: [embed], files: [attachment] });
      }

      await channel.delete();
    }

    // Cancel ticket delete
    if (type === "cancelDelete") {
      return interaction.message.delete();
    }
  });
};
