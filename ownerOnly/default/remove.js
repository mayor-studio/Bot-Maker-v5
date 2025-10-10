const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");
const { Database } = require("st.db");

const usersdata = new Database(`/database/usersdata/usersdata`);

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName('remove-coins')
    .setDescription('Remove coins from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to remove coins from')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('The amount of coins to remove')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.options.getUser('user');
    const quantity = interaction.options.getInteger('quantity');
    let balance = usersdata.get(`balance_${user.id}_${interaction.guild.id}`) || 0;

    if (balance < quantity) {
      await usersdata.set(`balance_${user.id}_${interaction.guild.id}`, 0);
      return interaction.editReply({
        content: "<:Warning:1401460074937057422> The user doesn't have enough balance to remove that amount.",
        ephemeral: true
      });
    }

    const newBalance = balance - quantity;
    await usersdata.set(`balance_${user.id}_${interaction.guild.id}`, newBalance);

    const dmEmbed = new EmbedBuilder()
      .setColor('#A6D3CF')
      .setDescription(`<:Verified:1401460125612507156> ${quantity} coins have been removed from your balance by ${interaction.user}.\nYour new balance is \`${newBalance}\`.`)
      .setTimestamp();

    try {
      await user.send({ embeds: [dmEmbed] });

      return interaction.editReply({
        content: `<:Verified:1401460125612507156> Successfully removed **${quantity}** coins from **${user.username}** and sent a DM notification.`,
        ephemeral: true
      });
    } catch (error) {
      return interaction.editReply({
        content: `<:Verified:1401460125612507156> Removed **${quantity}** coins from **${user.username}**, but could not send them a DM.`,
        ephemeral: true
      });
    }
  }
};
