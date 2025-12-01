const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { TwoZeroFourEight } = require("discord-gamecord");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`2048`)
    .setDescription(`لعبة 2048`),
  async execute(interaction) {
    const Game = new TwoZeroFourEight({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "2048",
        color: "#5865F2",
      },
      emojis: {
        up: "⬆️",
        down: "⬇️",
        left: "⬅️",
        right: "➡️",
      },
      timeoutTime: 60000,
      buttonStyle: "PRIMARY",
      playerOnlyMessage: "فقط {player} يمكنه استخدام هذه الأزرار.",
    });

    Game.startGame();
  },
};
