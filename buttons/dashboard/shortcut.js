const { Interaction, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require("discord.js");
const { Database } = require("st.db");
const shortcutDB = new Database("/Json-db/Others/shortcutDB.json");

module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId === 'shortcut') {
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('selectCommand')
          .setPlaceholder('اختر الأمر')
          .addOptions([
            { label: 'clear', value: 'clear' },
            { label: 'lock', value: 'lock' },
            { label: 'unlock', value: 'unlock' },
            { label: 'hide', value: 'hide' },
            { label: 'hnhide', value: 'unhide' },
            { label: 'server', value: 'server' },
            { label: 'come', value: 'come' },
            { label: 'tax', value: 'tax' },
            { label: 'say', value: 'say' },
            { label: 'تقييم', value: 'rate' }
          ]);

        const row33 = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.reply({ content: 'اختر الأمر الذي تود تعيين اختصار له:', components: [row33], ephemeral: true });
      }
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'selectCommand') {
        const selectedCommand = interaction.values[0];

        const modal33 = new ModalBuilder().setCustomId('shortcutModal').setTitle('اضافة اختصار');

        const serverIdInput = new TextInputBuilder()
          .setCustomId('serverId')
          .setLabel('ايدي السرفر')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('مثال : 1194008473109803159')
          .setRequired(true);

        const shortcutInput = new TextInputBuilder()
          .setCustomId('shortcut')
          .setLabel('الاختصار')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('مثال : hide , c , تعال')
          .setRequired(true);

        const row34 = new ActionRowBuilder().addComponents(serverIdInput);
        const row35 = new ActionRowBuilder().addComponents(shortcutInput);

        modal33.addComponents(row34, row35);
        await interaction.showModal(modal33);
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'shortcutModal') {
        const serverId = interaction.fields.getTextInputValue('serverId');
        const shortcut = interaction.fields.getTextInputValue('shortcut');
        const command = interaction.message.components[0].components[0].customId;

        await shortcutDB.set(`${command}_cmd_${serverId}`, shortcut);

        return interaction.reply({ content: `تم تعيين الاختصار \`${shortcut}\` للأمر \`${command}\` بنجاح في السيرفر \`${serverId}\`.`, ephemeral: true });
      }
    }
  }
};
