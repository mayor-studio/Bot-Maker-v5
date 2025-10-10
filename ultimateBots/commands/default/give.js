const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle } = require("discord.js");
const { Database } = require("st.db");

const usersdata = new Database(`/database/usersdata/usersdata`)
module.exports ={
    ownersOnly:true,
    data: new SlashCommandBuilder()
    .setName('add-coins')
    .setDescription('Give coins to a user')
    .addUserOption(Option => Option
        .setName(`user`)
        .setDescription(` user`)
        .setRequired(true))
    .addIntegerOption(Option => Option
        .setName(`quantity`)
        .setDescription(`Amount of coins`)
        .setRequired(true)),
    async execute(interaction, client) {
        await interaction.deferReply({ephemeral: true})
        let user = interaction.options.getUser(`user`)
        let quantity = interaction.options.getInteger(`quantity`)
        let userbalance = usersdata.get(`balance_${user.id}_${interaction.guild.id}`);

        if(!userbalance) {
            await usersdata.set(`balance_${user.id}_${interaction.guild.id}`, quantity)
        } else {
            let newuserbalance = parseInt(userbalance) + parseInt(quantity)
            await usersdata.set(`balance_${user.id}_${interaction.guild.id}`, newuserbalance)
        }
        
        userbalance = usersdata.get(`balance_${user.id}_${interaction.guild.id}`)
        
        const englishEmbed = new EmbedBuilder()
            .setDescription(`**Successfully given ${quantity} coins to ${user}\nCurrent Balance: \`${userbalance}\`**`)
            .setColor('Green')
            .setTimestamp();

        const arabicEmbed = new EmbedBuilder()
            .setDescription(`**تم اعطاء ${user} ${quantity} عملة\nالرصيد الحالي: \`${userbalance}\`**`)
            .setColor('Green')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('translate_give')
                    .setEmoji('<:translate:1351235289602981979>')
                    .setStyle(ButtonStyle.Secondary)
            );

        try {
            const msg = await user.send({
                embeds: [englishEmbed],
                components: [row]
            });

            const collector = msg.createMessageComponentCollector({ time: 60000 });
            collector.on('collect', async i => {
                if(i.customId === 'translate_give') {
                    const currentEmbed = i.message.embeds[0].data.description.includes('Successfully') ? 
                        arabicEmbed : englishEmbed;
                    await i.update({ embeds: [currentEmbed] });
                }
            });

            return interaction.editReply({
                content: `**✅ Successfully given ${quantity} coins to ${user.username} and sent DM notification**`,
                ephemeral: true
            });
        } catch (error) {
            return interaction.editReply({
                content: `**✅ Given ${quantity} coins to ${user.username} but couldn't send DM notification**`,
                ephemeral: true
            });
        }
    }
}