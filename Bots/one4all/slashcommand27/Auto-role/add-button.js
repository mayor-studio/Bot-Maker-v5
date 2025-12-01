const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { Database } = require('st.db');

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName('add-button')
    .setDescription('Add a button to assign a role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('label')
        .setDescription('Button label')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message-id')
        .setDescription('ID of the message to attach the button to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Button color')
        .setRequired(true)
        .addChoices(
          { name: 'Blue', value: '1' },
          { name: 'Red', value: '4' },
          { name: 'Green', value: '3' },
          { name: 'Gray', value: '2' },
        )),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const label = interaction.options.getString('label');
    const messageId = interaction.options.getString('message-id');
    const color = interaction.options.getString('color');
    const guildId = interaction.guild.id;

    const button = new ButtonBuilder()
      .setCustomId(`getrole_${guildId}_${role.id}`)
      .setLabel(label)
      .setStyle(ButtonStyle[color]);

    try {
      const targetMessage = await interaction.channel.messages.fetch(messageId);
      if (!targetMessage) {
        return await interaction.reply({
          content: 'Please use this command in the same channel as the target message.',
          ephemeral: true
        });
      }

      const newRow = new ActionRowBuilder();

      if (targetMessage.components.length > 0) {
        const existingRow = targetMessage.components[0];
        existingRow.components.forEach(existingButton => {
          newRow.addComponents(existingButton);
        });
      }

      newRow.addComponents(button);

      await targetMessage.edit({ components: [newRow] });

      await interaction.reply({
        content: '✅ Button added successfully!',
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '⚠️ An error occurred while adding the button!',
        ephemeral: true
      });
    }
  }
};
