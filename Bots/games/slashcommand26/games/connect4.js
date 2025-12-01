const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { Connect4 } = require("discord-gamecord");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`connect4`)
    .setDescription(`لعبة Connect4`)
    .addUserOption((options) =>
      options
        .setName("المنافس")
        .setDescription("المستخدم الذي تريد اللعب معه.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const Game = new Connect4({
      message: interaction,
      isSlashGame: true,
      opponent: interaction.options.getUser("المنافس"),
      embed: {
        title: "لعبة Connect4",
        statusTitle: "الحالة",
        color: "#5865F2",
      },
      emojis: {
        board: "⚪",
        player1: "🔴",
        player2: "🟡",
      },
      mentionUser: true,
      timeoutTime: 60000,
      buttonStyle: "PRIMARY",
      turnMessage: "{emoji} | دور اللاعب **{player}**.",
      winMessage: "{emoji} | **{player}** فاز في لعبة Connect4.",
      tieMessage: "اللعبة انتهت بالتعادل! لم يفز أحد!",
      timeoutMessage: "اللعبة لم تكتمل! لم يفز أحد!",
      playerOnlyMessage: "فقط {player} و {opponent} يمكنهما استخدام هذه الأزرار.",
    });

    Game.startGame();
  },
};
