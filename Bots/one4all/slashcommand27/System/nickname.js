const {ChatInputCommandInteraction , Client , SlashCommandBuilder, EmbedBuilder , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle } = require("discord.js");
const DB = require("../../../../database/settings")

module.exports ={
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Set a nickname for a user')
    .addUserOption(Option => Option
        .setName(`user`)
        .setDescription(`The user`)
        .setRequired(true))
    .addStringOption(Option => Option
            .setName(`nickname`)
            .setDescription(`The nickname`)
            .setRequired(false)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
        const sent = await interaction.deferReply({ fetchReply: true , ephemeral:false});

        const user = interaction.options.getUser(`user`);
        const member = interaction.options.getMember(`user`);
        const nickname = interaction.options.getString(`nickname`)

        if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) 
            return interaction.editReply({content:`**You do not have permission to do that**`})
        
        if(!member) 
            return interaction.editReply({content : `**Member not found**`})
        
        if(nickname){
            await member.setNickname(nickname).then(() => {
                return interaction.editReply({content:`**Nickname has been set for __${user.username}__**`})
            }).catch((error) => {
                console.log(`🔴 | error in nickname command` , error)
                return interaction.editReply({content: `**You do not have permission to do that**` })
            })
        }else{
            await member.setNickname(` `).then(() => {
                return interaction.editReply({content:`**Nickname has been reset for __${user.username}__**`})
            }).catch((error) => {
                console.log(`🔴 | error in nickname command` , error)
                return interaction.editReply({content: `**You do not have permission to do that**` })
            })
        }        
        } catch (error){
            console.log(`🔴 | error in nickname command` , error)
            return interaction.editReply({content:`**An error occurred, please contact the developers**`})
        }
    }
}
