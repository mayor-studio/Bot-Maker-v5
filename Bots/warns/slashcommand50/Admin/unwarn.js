const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const db = new Database('/Json-db/Bots/warnsDB');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('حذف آخر تحذير من عضو')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('العضو الذي تريد إزالة تحذيره')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const member = interaction.options.getUser('member');
    const guildId = interaction.guild.id;

    let warns = db.get(`warns_${member.id}_${guildId}`) || [];
    if (warns.length === 0) {
      return interaction.reply({ content: `❌ لا يوجد تحذيرات لهذا العضو`, ephemeral: true });
    }
    warns.pop();
    db.set(`warns_${member.id}_${guildId}`, warns);

    await interaction.reply({ content: `✅ تم حذف آخر تحذير من <@${member.id}>.\nعدد التحذيرات المتبقية: ${warns.length}`, ephemeral: true });
  }
};