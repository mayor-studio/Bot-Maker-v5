const { Events, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = (client11) => {
  client11.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      let [type, value] = interaction.customId.split('_');
      
      if (type === "tax") {
        await interaction.reply({ content: `${value}`, ephemeral: true });
      }

      if (type === "mediator") {
        await interaction.reply({ content: `${value}`, ephemeral: true });
      }
    }
  });
};
