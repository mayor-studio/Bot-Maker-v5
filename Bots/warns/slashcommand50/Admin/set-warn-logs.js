const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require("st.db");
const db = new Database('/Json-db/Bots/warnsDB');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-warn-log')
    .setDescription('تحديد روم لوج التحذيرات')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('حدد الروم')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    db.set(`warnlog_${interaction.guild.id}`, channel.id);
    await interaction.reply({ content: `✅ تم تحديد روم لوج التحذيرات: <#${channel.id}>`, ephemeral: true });
  }
};