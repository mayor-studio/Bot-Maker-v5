const {ChatInputCommandInteraction , Client , SlashCommandBuilder, EmbedBuilder , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle } = require("discord.js");
const DB = require("../../../../database/settings")

module.exports ={
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('come')
    .setDescription('Call someone')
    .addUserOption(Option => Option
        .setName(`user`)
        .setDescription(`The person to call`)
        .setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
        const sent = await interaction.deferReply({ fetchReply: true , ephemeral:false});
        const user = interaction.options.getUser(`user`)

        if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.editReply({content:`**You do not have permission to do that**`})

            user.send({content:`**You have been called by: ${interaction.user}\nIn: ${interaction.channel}**`}).then(async() => {
                return interaction.editReply({content:`**Message sent to the user successfully**`})
            }).catch(async() => {
                return interaction.editReply({content:`**I couldn't send the message to the user**`})
            })
        } catch {
            return interaction.editReply({content:`**I couldn't send the message to the user**`})
        }
    }
}
