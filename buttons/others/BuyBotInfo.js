const { Interaction , SlashCommandBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,Events, EmbedBuilder , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle } = require("discord.js");
const { Database } = require("st.db");
const setting = new Database("/database/settingsdata/setting")
module.exports = {
  name: Events.InteractionCreate,
    /**
    * @param {Interaction} interaction
  */
  async execute(interaction){
    if(interaction.isButton()) {
        if(interaction.customId == "buyBotInfo") {
            await interaction.deferReply({ephemeral : true});

            const embed = new EmbedBuilder()
                                    .setColor('White')
                                    .setTitle('شروط الخدمة')
                                    .setDescription(`**
جميع البوتات شغالة 24/7 وتحت تطويرات على مدار الاسبوع <:emoji_121:1378818767064137798> 

- لماذا خدمتنا <:qs:1355964602793328759> 
<:emoji_123:1378818808206069900> ببساطة لانها الافضل والاحدث في ديسكورد 

- كيف يمكنني الحصول على كوينز مجانا <:qs:1355964602793328759> 
<:emoji_123:1378818808206069900>  اما عن طريق الفعالية بالسيرفر
<:emoji_123:1378818808206069900> او دعم السيرفر بالبوست وكتابة امر !boost  <:boost:1355961272318820503> 

- هل يوجد ضمان <:qs:1355964602793328759> 
<:emoji_123:1378818808206069900> نعم يوجد ضمان على جميع البوتات ماعدا البرودكاست
**`)
                                    .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
                                    .setFooter({text : `Last Update : 13/03/2025` , iconURL : interaction.client.user.displayAvatarURL({dynamic : true})});
            
            await interaction.editReply({embeds : [embed]})
        }
    }
}
};