const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  WebhookClient,
} = require("discord.js");
const { Database } = require("st.db");
const usersdata = new Database(`/database/usersdata/usersdata`);
const buyerCheckerDB = new Database("/Json-db/Others/buyerChecker.json");
const setting = new Database("/database/settingsdata/setting");
const { mainguild, commandsRoom, purchaseWebhookUrl } = require("../../config.json");

module.exports = {
  ownersOnly: false,
  data: new SlashCommandBuilder()
    .setName("buy-coins")
    .setDescription("Buy coins")
    .addNumberOption(option =>
      option
        .setName("amount")
        .setDescription("Number of coins")
        .setMinValue(1)
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (interaction.guild.id == mainguild && interaction.channel.id !== commandsRoom) {
      const embed = new EmbedBuilder()
        .setDescription(`**⚠️ All commands are only allowed in <#${commandsRoom}>**`)
        .setColor("#A6D3CF");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let amount = interaction.options.getNumber("amount");
    let buyCheck = buyerCheckerDB.get(`buyer-${interaction.user.id}-${interaction.guild.id}`);
    if (buyCheck) {
      const embed = new EmbedBuilder()
        .setDescription(`**⚠️ You already have an active purchase. Please wait a minute and try again.**`)
        .setColor("#A6D3CF");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let price1 = setting.get(`balance_price_${interaction.guild.id}`) ?? 1000;
    let recipient = setting.get(`recipient_${interaction.guild.id}`);
    let logroom = setting.get(`log_room_${interaction.guild.id}`);
    let probot = setting.get(`probot_${interaction.guild.id}`);
    let clientrole = setting.get(`client_role_${interaction.guild.id}`);

    if (!price1 || !recipient || !logroom || !probot || !clientrole) {
      const embed = new EmbedBuilder()
        .setDescription(`**⚠️ Settings are not configured. Please contact an admin.**`)
        .setColor("#A6D3CF");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let price2 = Math.floor(price1 * amount);
    let price3 = Math.floor(price2 * (20 / 19) + 1);
    const targetTime = Math.floor(Date.now() / 1000) + 60;

    const TransferEmbed = new EmbedBuilder()
      .setTitle("💰 Please transfer the amount to complete the purchase")
      .setDescription(`\`\`\`js\n#credit ${recipient} ${price3} ${amount}coin\n\`\`\``)
      .setColor("#A6D3CF")
      .setTimestamp();

    const btn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`copyTransfer-${interaction.user.id}`)
        .setEmoji("💰")
        .setStyle(ButtonStyle.Secondary)
    );

    const reply = await interaction.reply({
      embeds: [TransferEmbed],
      components: [btn],
      fetchReply: true,
    });

    const collectorFilter = m =>
      m.content.includes(price2.toString()) &&
      (m.content.includes(recipient) || m.content.includes(`<@${recipient}>`)) &&
      m.author.id === probot;

    const collector = interaction.channel.createMessageCollector({
      filter: collectorFilter,
      max: 1,
      time: 60 * 1000,
    });

    await buyerCheckerDB.set(`buyer-${interaction.user.id}-${interaction.guild.id}`, true);

    let transfered = false;

    collector.on("collect", async () => {
      transfered = true;
      await buyerCheckerDB.delete(`buyer-${interaction.user.id}-${interaction.guild.id}`);

      const currentBalance = usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`) || 0;
      await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, currentBalance + amount);

      const therole = interaction.guild.roles.cache.get(clientrole);
      if (therole) {
        interaction.guild.members.cache.get(interaction.user.id)?.roles.add(therole).catch(() => {});
      }

      const successEmbed = new EmbedBuilder()
        .setDescription(`\`\`\`js\nPurchase successful\n\`\`\``)
        .setColor("#A6D3CF");

      await reply.edit({ components: [] }); // Remove buttons

      try {
        await interaction.user.send({ embeds: [successEmbed] });
      } catch {
        // DMs might be closed
      }

      const notifyEmbed = new EmbedBuilder()
        .setDescription(`✅ <@${interaction.user.id}> purchased \`${amount} coins\` successfully.`)
        .setColor("#A6D3CF");

      await interaction.channel.send({ embeds: [notifyEmbed] });

      const doneLog = new EmbedBuilder()
        .setDescription(`**\`${amount}\` coins purchased by: ${interaction.user}**`)
        .setColor("#A6D3CF")
        .setTimestamp();

      const logChannel = interaction.guild.channels.cache.get(logroom);
      logChannel?.send({ embeds: [doneLog] });

      const webhookClient = new WebhookClient({ url: purchaseWebhookUrl });
      const purchaseLog = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTitle("New Coin Purchase")
        .addFields(
          { name: "Server", value: `\`\`\`${interaction.guild.name} (${interaction.guild.id})\`\`\`` },
          { name: "Buyer", value: `\`\`\`${interaction.user.username} (${interaction.user.id})\`\`\`` },
          { name: "Amount", value: `\`\`\`${amount}\`\`\`` },
          { name: "Coin Price", value: `\`\`\`${price1}\`\`\`` },
          { name: "Bank", value: `\`\`\`${recipient}\`\`\`` }
        )
        .setColor("#A6D3CF");

      await webhookClient.send({ embeds: [purchaseLog] });
    });

    collector.on("end", async () => {
      if (!transfered) {
        await buyerCheckerDB.delete(`buyer-${interaction.user.id}-${interaction.guild.id}`);

        const failEmbed = new EmbedBuilder()
          .setDescription(`\`\`\`js\nPurchase failed\n\`\`\``)
          .setColor("Red");

        await reply.edit({ components: [] }); // Remove buttons

        try {
          await interaction.user.send({ embeds: [failEmbed] });
        } catch {}

        const timeoutEmbed = new EmbedBuilder()
          .setDescription(`⚠️ <@${interaction.user.id}> Purchase time expired. Use /buy-coins to try again.`)
          .setColor("#A6D3CF");

        await interaction.channel.send({ embeds: [timeoutEmbed] });
      }
    });
  }
};
