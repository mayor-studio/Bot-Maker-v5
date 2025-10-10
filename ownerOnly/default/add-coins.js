const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { Database } = require("st.db");

const usersdata = new Database(`/database/usersdata/usersdata`);

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName('add-coins')
    .setDescription('Add coins to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to give coins to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('Number of coins to give')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.options.getUser('user');
    const quantity = interaction.options.getInteger('quantity');

    let balance = usersdata.get(`balance_${user.id}_${interaction.guild.id}`) || 0;
    balance += quantity;
    await usersdata.set(`balance_${user.id}_${interaction.guild.id}`, balance);

    const dmEmbed = new EmbedBuilder()
      .setColor('#A6D3CF')
      .setDescription(`<:mayor:1401446453972303955> You have received **${quantity}** coins from ${interaction.user}.\nYour new balance is \`${balance}\`.`)
      .setTimestamp();

    try {
      await user.send({ embeds: [dmEmbed] });

      return interaction.editReply({
        content: `<:Verified:1401460125612507156> Successfully added **${quantity}** coins to **${user.username}** and sent a DM notification.`,
        ephemeral: true
      });
    } catch (error) {
      return interaction.editReply({
        content: `<:Verified:1401460125612507156> Added **${quantity}** coins to **${user.username}**, but could not send them a DM.`,
        ephemeral: true
      });
    }
  }
};
