const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle } = require("discord.js");
const { Database } = require("st.db");

const usersdata = new Database(`/database/usersdata/usersdata`)
module.exports ={
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('coins')
    .setDescription('View balance for yourself or another user')
    .addUserOption(Option => Option
        .setName(`user`)
        .setDescription(`user`)
        .setRequired(false)),
    async execute(interaction, client) {
        await interaction.deferReply({ephemeral: true})
        const user = interaction.options.getUser(`user`) ?? interaction.user
        let userbalance = usersdata.get(`balance_${user.id}_${interaction.guild.id}`) ?? 0;

        const englishEmbed = new EmbedBuilder()
            .setDescription(`**Current Balance for ${user}: \`${userbalance}\` coins**`)
            .setColor('Aqua')
            .setTimestamp();

        const arabicEmbed = new EmbedBuilder()
            .setDescription(`**رصيد ${user} الحالي هو : \`${userbalance}\`**`)
            .setColor('Aqua')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('translate_balance')
                    .setEmoji('<:translate:1351235289602981979>')
                    .setStyle(ButtonStyle.Secondary)
            );

        try {
            const msg = await interaction.user.send({ 
                embeds: [englishEmbed],
                components: [row]
            });

            const collector = msg.createMessageComponentCollector({ time: 60000 });
            collector.on('collect', async i => {
                if(i.customId === 'translate_balance') {
                    const currentEmbed = i.message.embeds[0].data.description.includes('Current') ? 
                        arabicEmbed : englishEmbed;
                    await i.update({ embeds: [currentEmbed] });
                }
            });

            return interaction.editReply({
                content: "**✅ Balance details sent to your DMs**",
                ephemeral: true
            });
        } catch (error) {
            return interaction.editReply({
                content: "**❌ Couldn't send DM. Please check your privacy settings**",
                ephemeral: true
            });
        }
    }
}