const { Client, Collection,PermissionsBitField,SlashCommandBuilder, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const systemDB = new Database("/Json-db/Bots/systemDB.json")
module.exports = {
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Give or remove mute from a member')
    .addUserOption(Option => Option
        .setName(`member`)
        .setDescription(`The member`)
        .setRequired(true))
            .addStringOption(Option => Option
                .setName(`give_or_remove`)
                .setDescription(`Give or remove`)
                .setRequired(true)
                .addChoices(
                    {
                        name:`Give` , value:`Give`,
                    },
                    {
                        name:`Remove` , value:`Remove`
                    }
                )), // or false
async execute(interaction) {
        try {
            if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({content:`**You do not have permission to do that**` , ephemeral:true})
            const member = interaction.options.getMember(`member`)
            let role = interaction.guild.roles.cache.find(ro => ro.name == "Muted")
            if(!role) {
                await interaction.guild.roles.create({
                        name:`Muted`,
                        permissions:[]
                }).then(async (createRole) => { interaction.guild.channels.cache.filter((c) => c.type == 0).forEach((c) => { c.permissionOverwrites.edit(createRole, { SendMessages: false }); }); });}
            role = interaction.guild.roles.cache.find(ro => ro.name == "Muted")
            const give_or_remove = interaction.options.getString(`give_or_remove`)
                if(give_or_remove == "Give") {
                    await member.roles.add(role).catch(async() => {return interaction.reply({content:`**Please check my permissions then try again**` , ephemeral:true})})
                    return interaction.reply({content:`**The member has been muted successfully**`})
                }
                if(give_or_remove == "Remove") {
                    if(!member.roles.cache.some(rolee => rolee == role)) return interaction.reply({content:`**This member does not have a mute role to remove**`})
                    await member.roles.remove(role).catch(async() => {return interaction.reply({content:`**Please check my permissions then try again**` , ephemeral:true})})
                    return interaction.reply({content:`**Mute has been removed from the member successfully**`})
                }
        } catch (error) {
            interaction.reply({content : `An error occurred, please contact the developers` , ephemeral : true})
            console.log(error);
        }
    
}
}
