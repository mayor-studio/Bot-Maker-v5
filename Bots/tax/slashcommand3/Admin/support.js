const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('join the support server for help with the bot!'),
    async execute(interaction, client) {
        interaction.reply('join the support server! discord.gg/mayor');
    }
}