const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const db = new Database('/Json-db/Bots/warnsDB');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('تحذير عضو وإضافة تحذير له')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('العضو الذي تريد تحذيره')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('سبب التحذير')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('image')
        .setDescription('رابط صورة (اختياري)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const member = interaction.options.getUser('member');
    const reason = interaction.options.getString('reason') || "لم يتم تحديد سبب";
    const imageUrl = interaction.options.getString('image');
    const guildId = interaction.guild.id;

    // Add warn to DB
    let warns = db.get(`warns_${member.id}_${guildId}`) || [];
    warns.push({
      moderator: interaction.user.id,
      reason,
      date: Date.now(),
      image: imageUrl || null
    });
    db.set(`warns_${member.id}_${guildId}`, warns);

    // Embed for logging/DM
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('⚠️ تم تحذير عضو')
      .addFields(
        { name: 'العضو', value: `<@${member.id}>`, inline: true },
        { name: 'المشرف', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'السبب', value: reason, inline: false },
        { name: 'عدد التحذيرات', value: `${warns.length}`, inline: true }
      )
      .setTimestamp();

    if (imageUrl) embed.setImage(imageUrl);

    // Log to warn log room if set
    const logRoomId = db.get(`warnlog_${guildId}`);
    if (logRoomId) {
      const logChannel = interaction.guild.channels.cache.get(logRoomId);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }

    // Send DM to member
    try {
      await member.send({ embeds: [embed.setTitle('⚠️ لقد تم تحذيرك').setFooter({ text: interaction.guild.name })] });
    } catch (err) {
      // Ignore if DM is closed
    }

    await interaction.reply({ content: `✅ تم تحذير <@${member.id}> (${member.tag})\nالسبب: ${reason}\nالتحذيرات الكلية: ${warns.length}`, ephemeral: true });
  }
};