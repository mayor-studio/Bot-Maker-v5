const { ChatInputCommandInteraction, Client, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

const thumbnailChoices = [
  { name: 'Server Icon', value: 'server' },
  { name: 'Bot Avatar', value: 'bot' },
  { name: 'User Avatar', value: 'user' },
  { name: 'Keep Current', value: 'keep' },
  { name: 'Remove Thumbnail', value: 'none' },
];

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName('edit-embed')
    .setDescription('تعديل رسالة تحتوي على امبد (خاص للمالك فقط)')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('معرف الرسالة')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('العنوان الجديد للامبد')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('الوصف الجديد')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('رابط صورة جديدة')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('thumbnail')
        .setDescription('مصدر الصورة المصغرة')
        .addChoices(...thumbnailChoices)
        .setRequired(false))
    .addStringOption(option =>
      option.setName('footer')
        .setDescription('نص الفوتر الجديد')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false });

    const messageId = interaction.options.getString('message_id');
    const newTitle = interaction.options.getString('title');
    const newDescription = interaction.options.getString('description');
    const newImage = interaction.options.getString('image');
    const thumbnailChoice = interaction.options.getString('thumbnail');
    const newFooter = interaction.options.getString('footer');

    try {
      const msg = await interaction.channel.messages.fetch(messageId);
      const embeds = msg.embeds;
      if (!embeds.length) {
        return interaction.editReply({ content: `❌ لا توجد امبد في هذه الرسالة.`, ephemeral: true });
      }

      const orig = embeds[0];
      const editedEmbed = EmbedBuilder.from(orig)
        .setTitle(newTitle ?? orig.title ?? null)
        .setDescription(newDescription ?? orig.description ?? null)
        .setImage(newImage ?? orig.image?.url ?? null)
        .setFooter(newFooter ? { text: newFooter } : orig.footer ?? null);

      // معالجة اختيار الصورة المصغرة
      let thumbnailURL = orig.thumbnail?.url ?? null;
      if (thumbnailChoice === 'server') {
        thumbnailURL = interaction.guild.iconURL({ dynamic: true });
      } else if (thumbnailChoice === 'bot') {
        thumbnailURL = client.user.displayAvatarURL({ dynamic: true });
      } else if (thumbnailChoice === 'user') {
        thumbnailURL = interaction.user.displayAvatarURL({ dynamic: true });
      } else if (thumbnailChoice === 'none') {
        thumbnailURL = null;
      }

      editedEmbed.setThumbnail(thumbnailURL);

      await msg.edit({ embeds: [editedEmbed] });
      return interaction.editReply({ content: `✅ تم تحديث الامبد بنجاح.` });
    } catch (err) {
      console.error(err);
      return interaction.editReply({ content: `❌ حدث خطأ أثناء تعديل الامبد.` });
    }
  }
};
