const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { Snake } = require("discord-gamecord");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`snake`)
    .setDescription(`الثعبان`),
  async execute(interaction) {
    console.log("TEST");

    const Game = new Snake({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "لعبة الثعبان",
        overTitle: "انتهت اللعبة",
        color: "#5865F2",
      },
      emojis: {
        board: "⬛",
        food: "🍎",
        up: "⬆️",
        down: "⬇️",
        left: "⬅️",
        right: "➡️",
      },
      snake: { head: "🟢", body: "🟩", tail: "🟢", over: "💀" },
      foods: ["🍎", "🍇", "🍊", "🫐", "🥕", "🥝", "🌽"],
      stopButton: "إيقاف",
      timeoutTime: 60000,
      playerOnlyMessage: "فقط {player} يمكنه استخدام هذه الأزرار.",
    });

    Game.startGame();
  },
};
