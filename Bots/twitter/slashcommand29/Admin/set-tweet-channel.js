const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require('st.db');
const twitterDB = new Database('/Json-db/Bots/twitterDB.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-tweet-channel')
    .setDescription('Set the channel where tweets will be sent')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel for tweets')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    await twitterDB.set(`tweet_channel_${interaction.guild.id}`, channel.id);
    await interaction.reply({ content: `✅ Tweet channel has been set to ${channel}!`, ephemeral: true });
  },
};