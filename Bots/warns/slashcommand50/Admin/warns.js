const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const db = new Database('/Json-db/Bots/warnsDB');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('عرض تحذيرات العضو')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('العضو لعرض تحذيراته')
        .setRequired(true)
    ),
  async execute(interaction) {
    const member = interaction.options.getUser('member');
    const guildId = interaction.guild.id;
    let warns = db.get(`warns_${member.id}_${guildId}`) || [];

    if (warns.length === 0) {
      return interaction.reply({ content: `✅ لا يوجد تحذيرات على <@${member.id}>`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('Orange')
      .setTitle(`تحذيرات ${member.tag}`)
      .setDescription(warns.map((w, i) => `**${i + 1}.** بواسطة <@${w.moderator}> - ${w.reason} *(<t:${Math.floor(w.date / 1000)}:R>)*`).join('\n'))
      .setFooter({ text: `عدد التحذيرات: ${warns.length}` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};