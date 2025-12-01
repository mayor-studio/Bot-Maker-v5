const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { MatchPairs } = require("discord-gamecord");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`matchpairs`)
    .setDescription(`مطابقة الأزواج`),
  async execute(interaction) {
    const Game = new MatchPairs({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "لعبة مطابقة الأزواج",
        color: "#5865F2",
        description:
          "**انقر على الأزرار لمطابقة الرموز التعبيرية مع أزواجها.**",
      },
      timeoutTime: 60000,
      emojis: [
        "🍉",
        "🍇",
        "🍊",
        "🥭",
        "🍎",
        "🍏",
        "🥝",
        "🥥",
        "🍓",
        "🍌",
        "🍍",
        "🥕",
        "🥔",
      ],
      winMessage:
        "**لقد فزت في اللعبة! قمت بقلب `{tilesTurned}` من البلاطات.**",
      loseMessage:
        "**لقد خسرت اللعبة! قمت بقلب `{tilesTurned}` من البلاطات.**",
      playerOnlyMessage: "فقط {player} يمكنه استخدام هذه الأزرار.",
    });

    Game.startGame();
  },
};
