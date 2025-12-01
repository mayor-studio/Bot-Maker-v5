const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { Minesweeper } = require("discord-gamecord");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`minesweeper`)
    .setDescription(`العب لعبة كاسحة الألغام`),
  async execute(interaction) {
    const Game = new Minesweeper({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "لعبة كاسحة الألغام",
        color: "#5865F2",
        description: "انقر على الأزرار لكشف المربعات باستثناء الألغام.",
      },
      emojis: { flag: "🚩", mine: "💣" },
      mines: 5,
      timeoutTime: 60000,
      winMessage: "لقد فزت في اللعبة! تجنبت جميع الألغام بنجاح.",
      loseMessage: "لقد خسرت اللعبة! احذر من الألغام في المرة القادمة.",
      playerOnlyMessage: "فقط {player} يمكنه استخدام هذه الأزرار.",
    });

    Game.startGame();
  },
};
