const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require("st.db");
const inviterDB = new Database("/Json-db/Bots/inviterDB.json");

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName('add-invites')
    .setDescription('Add invite points to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to add invites to')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of invites to add')
        .setRequired(true)
        .setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');

      const currentPoints = inviterDB.get(`invitePoints_${user.id}`) || 0;
      const newPoints = currentPoints + amount;

      inviterDB.set(`invitePoints_${user.id}`, newPoints);

      await interaction.reply({
        content: `✅ Successfully added **${amount}** invites to **${user.username}**.\nThey now have **${newPoints}** invite points.`,
        ephemeral: true
      });

    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ An error occurred while executing the command.',
        ephemeral: true
      });
    }
  },
};
