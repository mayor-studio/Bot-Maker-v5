const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle } = require("discord.js");
const { Database } = require("st.db");

const usersdata = new Database(`/database/usersdata/usersdata`)
module.exports ={
    ownersOnly:true,
    data: new SlashCommandBuilder()
    .setName('remove-coins')
    .setDescription('Remove coins from a user')
    .addUserOption(Option => Option
        .setName(`user`)
        .setDescription(`Target user to remove coins from`)
        .setRequired(true))
    .addIntegerOption(Option => Option
        .setName(`quantity`)
        .setDescription(`Amount to remove`)
        .setRequired(true)),
    async execute(interaction, client) {
        await interaction.deferReply({ephemeral: true})
        let user = interaction.options.getUser(`user`)
        let quantity = interaction.options.getInteger(`quantity`)
        let userbalance = usersdata.get(`balance_${user.id}_${interaction.guild.id}`);

        const englishEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTimestamp();

        const arabicEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTimestamp();

        if(!userbalance || parseInt(userbalance) < parseInt(quantity)) {
            await usersdata.set(`balance_${user.id}_${interaction.guild.id}`, 0)
            englishEmbed.setDescription(`**Insufficient balance to remove ${quantity} coins**`)
            arabicEmbed.setDescription(`**هذا الشخص رصيده اقل من الرصيد المراد ازالته**`)
            
            return interaction.editReply({
                content: "**❌ User has insufficient balance**",
                ephemeral: true
            });
        }

        let newuserbalance = parseInt(userbalance) - parseInt(quantity)
        await usersdata.set(`balance_${user.id}_${interaction.guild.id}`, newuserbalance)
        userbalance = usersdata.get(`balance_${user.id}_${interaction.guild.id}`)
        
        englishEmbed.setDescription(`**${quantity} coins have been removed from your balance\nCurrent Balance: \`${userbalance}\`**`)
        arabicEmbed.setDescription(`**تم خصم ${quantity} من رصيدك\nرصيدك الحالي: \`${userbalance}\`**`)

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('translate_remove')
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
                if(i.customId === 'translate_remove') {
                    const currentEmbed = i.message.embeds[0].data.description.includes('removed') ? 
                        arabicEmbed : englishEmbed;
                    await i.update({ embeds: [currentEmbed] });
                }
            });

            return interaction.editReply({
                content: `**✅ Removed ${quantity} coins from ${user.username} and sent DM notification**`,
                ephemeral: true
            });
        } catch (error) {
            return interaction.editReply({
                content: `**✅ Removed ${quantity} coins from ${user.username} but couldn't send DM notification**`,
                ephemeral: true
            });
        }
    }
}