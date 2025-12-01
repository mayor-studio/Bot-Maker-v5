const { SlashCommandBuilder } = require('discord.js');
const twitchUrl = "https://www.twitch.tv/mazika1gamer";

module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
        .setName('set-streaming')
        .setDescription('اضافة حالة ستريمنق خاصة بالبوت')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('The name of the stream')
                .setRequired(true)),
    
    async execute(interaction) {
        const streamName = interaction.options.getString('name');
        try {
            await interaction.client.user.setActivity(streamName, {
                type: 1,
                url: twitchUrl
            });
            
            await interaction.reply({
                content: `✅ تم تغيير الحالة بإسم: "${streamName}"`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ حدث خطأ أثناء تغيير الحالة',
                ephemeral: true
            });
        }
    },
};