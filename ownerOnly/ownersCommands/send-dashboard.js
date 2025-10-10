const { ChatInputCommandInteraction , Client , SlashCommandBuilder,SelectMenuBuilder,StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle, Embed } = require("discord.js");
const { Database } = require("st.db")
const db = new Database("/database/data")
const setting = new Database("/database/settingsdata/setting")
const prices = new Database("/database/settingsdata/prices.json")
const statuses = new Database("/database/settingsdata/statuses")
const { mainguild } = require('../../config.json')

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('control-panel')
        .setDescription('Send the bot control Panel'),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction , client) {
        await interaction.deferReply({ephemeral: false});

        let dashboardRoom = await setting.get(`dashboard_room_${interaction.guild.id}`);
        if (!dashboardRoom) return interaction.editReply({ content: `**لم يتم تحديد الاعدادات**` });

        let theroom = interaction.guild.channels.cache.find(ch => ch.id == dashboardRoom);
        if (!theroom) return interaction.editReply({ content: `**تاكد من روم الداشبورد**` });

        let btns = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("MyBots")
                .setLabel("My Bots")
                .setStyle(ButtonStyle.Secondary),
        );

        await theroom.send({
            content: 'https://media.discordapp.net/attachments/1376530407830323293/1394325902392823910/Picsart_25-07-14_17-32-40-463.jpg?ex=687666b0&is=68751530&hm=baf2c21ba6ada2153713919c8530075277935751e6dff5738074575c97ae3b2d&=&format=webp&width=1327&height=489',
            components: [btns]
        });

        return interaction.editReply({ content: `**تم ارسال الرسالة بنجاح**` });
    }
}