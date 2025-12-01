const { Client, Collection,PermissionsBitField,SlashCommandBuilder, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const systemDB = new Database("/Json-db/Bots/systemDB.json")
module.exports = {
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member')
    .addUserOption(Option => Option
        .setName(`member`)
        .setDescription(`The member`)
        .setRequired(true))
        .addStringOption(Option => Option
            .setName(`reason`)
            .setDescription(`Reason`)
            .setRequired(false))
        , // or false
async execute(interaction) {
    try {
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) 
            return interaction.reply({content:`**You do not have permission to do that**` , ephemeral:true})
        const member = interaction.options.getMember(`member`)
        const reason = `${interaction.options.getString(`reason`)} ,  By : ${interaction.user.id}` ?? `By : ${interaction.user.id}`
        await member.kick({reason:reason}).catch(async() => {
            return interaction.reply({content:`**Please check my permissions then try again**` , ephemeral:true})
        })
        return interaction.reply({content:`**The member has been kicked successfully**`})
    } catch (error) {
        interaction.reply({content : `An error occurred, please contact the developers.` , ephemeral : true})
        console.log(error);
    }
}
}
