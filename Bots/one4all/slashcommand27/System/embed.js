const { ChatInputCommandInteraction , Client, Collection,PermissionsBitField,SlashCommandBuilder, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");


module.exports = {
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Say something in an embed')
    .addStringOption((option) => option
    .setName('title')
    .setDescription(`Title`)
    .setRequired(true))
    .addAttachmentOption((option) => option
    .setName('image')
    .setDescription(`Image`)
    .setRequired(false))
    .addChannelOption((option) => option
    .setName('channel')
    .setDescription(`Mention the channel`)
    .setRequired(false))
    .addStringOption((option) => option
    .setName('color')
    .setDescription(`Color`)
    .addChoices(
        {name : `Red` , value : 'Red'},
        {name : `Blue` , value : 'Blue'},
        {name : `Aqua` , value : 'Aqua'},
        {name : `Green` , value : 'Green'},
        {name : `Yellow` , value : 'Yellow'},
        {name : `Black` , value : 'Black'},
        {name : `Gold` , value : 'Gold'},
        {name : `White` , value : 'White'},
        {name : `Orange` , value : 'Orange'},
        {name : `Grey` , value : 'Grey'},
        {name : `No Color` , value : 'DarkButNotBlack'},
        {name : `Random` , value : 'Random'},
    )
    .setRequired(false)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
    */
    async execute(interaction) {
        try {
            if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) 
                return interaction.reply({content:`**You do not have permission to do that**` , ephemeral:true})
            
            let title = await interaction.options.getString('title');
            let imageOption = interaction.options.getAttachment('image');
            let color = interaction.options.getString('color') || "Random";
            let image = imageOption ? imageOption.proxyURL : null;
            let channel = await interaction.options.getChannel('channel') || interaction.channel;

            let embed = new EmbedBuilder().setColor(`${color}`);

            if(title){
                embed.setTitle(`${title}`)
            }
            if(image){
                embed.setImage(`${image}`)
            }


            await interaction.reply({content: "Please type the message you want to put in the embed", ephemeral: true});

            const filter = (msg) => msg.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

            collector.on('collect', async (msg) => {
                embed.setDescription(msg.content);

                await msg.delete();

                await channel.send({embeds : [embed]});
                return interaction.followUp({content:`**Embed sent successfully**` , ephemeral:true});
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.followUp({content: "No message was received. Operation canceled.", ephemeral: true});
                }
            });
        } catch (error) {
            interaction.reply({content : `An error occurred, please contact the developers.` , ephemeral : true});
            console.log(error);
        }
    }
}
