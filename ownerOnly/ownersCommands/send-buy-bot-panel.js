const {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/database/data");
const setting = new Database("/database/settingsdata/setting");
const prices = new Database("/database/settingsdata/prices.json");
const { mainguild } = require('../../config.json');

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName('send-buy-bot-panel')
    .setDescription('Send Bot and subs Panel'),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false });

    let price1 = await setting.get(`balance_price_${interaction.guild.id}`) ?? 5000;
    let recipient = await setting.get(`recipient_${interaction.guild.id}`);
    let logroom = await setting.get(`log_room_${interaction.guild.id}`);
    let probot = await setting.get(`probot_${interaction.guild.id}`);
    let clientrole = await setting.get(`client_role_${interaction.guild.id}`);
    let buybotroom = await setting.get(`buy_bot_room${interaction.guild.id}`);

    if (!price1 || !recipient || !logroom || !probot || !clientrole || !buybotroom)
      return interaction.editReply({ content: `**Settings are not configured**` });

    let theroom = interaction.guild.channels.cache.find(ch => ch.id == buybotroom);

    const mainImageUrl = "https://i.ibb.co/mVXFfWj3/Picsart-25-08-03-10-36-29-710-jpg.jpg";

    const select = new StringSelectMenuBuilder()
      .setCustomId('select_buy')
      .setPlaceholder('Please choose from the list')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setEmoji(`🤖`)
          .setLabel('Buy bot')
          .setDescription('Buy a bot that works 24/7')
          .setValue('selectBuyBot'),
        new StringSelectMenuOptionBuilder()
          .setEmoji(`<:loading:1402222246155522118>`)
          .setLabel('Reset')
          .setDescription('Reset the select menu')
          .setValue('Reset_Selected'),
      );
    const row0 = new ActionRowBuilder().addComponents(select);

    // Send image as embed, not file
    await theroom.send({
      embeds: [
        new EmbedBuilder()
          .setImage(mainImageUrl)
      ],
      components: [row0]
    });

    // Subscription panel
    if (setting.has(`subscribe_room_${interaction.guild.id}`)) {
      let subscriptionRoomId = setting.get(`subscribe_room_${interaction.guild.id}`);
      let subscriptionRoom = interaction.guild.channels.cache.find(ch => ch.id == subscriptionRoomId);

      const subscriptionImageUrl = "https://i.ibb.co/KjYX2MkT/Picsart-25-08-05-08-55-53-086-png.png";

      const select2 = new StringSelectMenuBuilder()
        .setCustomId('select_bot')
        .setPlaceholder('Choose subscription plan')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setEmoji(`🤖`)
            .setLabel('P1')
            .setDescription('Subscribe to Prime Maker Bot')
            .setValue('Bot_Maker_Subscribe'),
          new StringSelectMenuOptionBuilder()
            .setEmoji(`🤖`)
            .setLabel('P2')
            .setDescription('Subscribe to Ultimate Maker Bot')
            .setValue('Bot_Maker_Ultimate_Subscribe'),
          new StringSelectMenuOptionBuilder()
            .setEmoji(`🤖`)
            .setLabel('P3')
            .setDescription('Subscribe to Ultimate Plus Maker Bot')
            .setValue('Bot_Maker_Ultimate_Plus_Subscribe'),
          new StringSelectMenuOptionBuilder()
            .setEmoji(`<:loading:1402222246155522118>`)
            .setLabel('Reset')
            .setDescription('Reset selection')
            .setValue('Reset_Selected')
        );
      const row2 = new ActionRowBuilder().addComponents(select2);

      await subscriptionRoom.send({
        embeds: [
          new EmbedBuilder()
            .setImage(subscriptionImageUrl)
        ],
        components: [row2]
      });
    }

    return interaction.editReply({ content: `**Message sent successfully**` });
  }
};
