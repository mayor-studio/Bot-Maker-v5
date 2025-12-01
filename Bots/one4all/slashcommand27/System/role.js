const { Client, Collection,PermissionsBitField,SlashCommandBuilder, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const systemDB = new Database("/Json-db/Bots/systemDB.json")
module.exports = {
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Give or remove a role from a user')
    .addUserOption(Option => Option
        .setName(`member`)
        .setDescription(`The member`)
        .setRequired(true))
        .addRoleOption(Option => Option
            .setName(`role`)
            .setDescription(`The role`)
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
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) 
        return interaction.reply({content:`**You do not have permission to do that**` , ephemeral:true})

    const member = interaction.options.getMember(`member`)
    const role = interaction.options.getRole(`role`)
    const give_or_remove = interaction.options.getString(`give_or_remove`)

    if(give_or_remove == "Give") {
        await member.roles.add(role).catch(async() => {
            return interaction.reply({content:`**Please check my permissions then try again**` , ephemeral:true})
        })
        return interaction.reply({content:`**The role has been given to the member successfully**`})
    }

    if(give_or_remove == "Remove") {
        if(!member.roles.cache.some(rolee => rolee == role)) 
            return interaction.reply({content:`**This member does not have that role to remove**`})

        await member.roles.remove(role).catch(async() => {
            return interaction.reply({content:`**Please check my permissions then try again**` , ephemeral:true})
        })
        return interaction.reply({content:`**The role has been removed from the member successfully**`})
    }
}
}
