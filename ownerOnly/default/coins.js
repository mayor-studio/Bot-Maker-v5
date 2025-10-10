const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");
const { Database } = require("st.db");
const { mainguild, commandsRoom } = require('../../config.json');
const usersdata = new Database(`/database/usersdata/usersdata`);

module.exports = {
  ownersOnly: false,
  data: new SlashCommandBuilder()
    .setName('coins')
    .setDescription("View your balance or another user's balance")
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to view balance for')
        .setRequired(false)
    ),
  async execute(interaction, client) {
    if (interaction.guild.id === mainguild && interaction.channel.id !== commandsRoom) {
      const embed = new EmbedBuilder()
        .setDescription(`**All commands must be used in <#${commandsRoom}>**`)
        .setColor('#A6D3CF');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const user = interaction.options.getUser('user') ?? interaction.user;
    const userbalance = usersdata.get(`balance_${user.id}_${interaction.guild.id}`) ?? 0;

    const balanceEmbed = new EmbedBuilder()
      .setTitle(`Balance for ${user.username}`)
      .setDescription(`<:mayor:1401446453972303955> **Current Balance:** \`${userbalance}\` coins`)
      .setColor('#A6D3CF')
      .setTimestamp();

    try {
      await interaction.user.send({ embeds: [balanceEmbed] });

      const confirmEmbed = new EmbedBuilder()
        .setDescription("<:Verified:1401460125612507156> Balance details sent to your DMs")
        .setColor('#A6D3CF');

      return interaction.editReply({ embeds: [confirmEmbed], ephemeral: true });
    } catch (error) {
      const failEmbed = new EmbedBuilder()
        .setDescription("<:Warning:1401460074937057422> Couldn't send DM. Please check your privacy settings.")
        .setColor('#A6D3CF');

      return interaction.editReply({ embeds: [failEmbed], ephemeral: true });
    }
  }
};
