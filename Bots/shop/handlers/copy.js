const { Events } = require("discord.js");

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      const { customId } = interaction;

      if (customId === "copynitro") {
        const embed = interaction.message.embeds[0];
        
        if (embed) {
          let description = embed.description || "";
          description = description.replace(/```/g, '').trim(); 

          description = description.split('\n')
                                   .filter(line => !line.includes("منتجاتك:"))
                                   .join('\n');

          await interaction.reply({ content: description, ephemeral: true });
        }
      }
    }
  });
};
