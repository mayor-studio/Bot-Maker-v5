const { SlashCommandBuilder, EmbedBuilder , ChatInputCommandInteraction , Client , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle } = require("discord.js");
const { Database } = require("st.db");
const usersdata = new Database(`/database/usersdata/usersdata`)
const buyerCheckerDB = new Database('/Json-db/Others/buyerChecker.json')
const setting = new Database("/database/settingsdata/setting")
const mainBot = require('../../../index');

module.exports ={
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('buy-coins')
    .setDescription('لشراء كوينز')
    .addNumberOption(option => option
                                .setName('amount')
                                .setDescription('عدد الكوينز')
                                .setMinValue(1)
                                .setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        let amount = interaction.options.getNumber('amount')

        let buyCheck = buyerCheckerDB.get(`buyer-${interaction.user.id}-${interaction.guild.id}`);
        if(buyCheck && buyCheck === true) return interaction.reply({content : `**يبدو انك تمتلك عملية شراء اخرى . يرجى انتظار دقيقة اخرى و محاولة الشراء مرة اخرى**` , ephemeral : true})

        let price1 = setting.get(`balance_price_${interaction.guild.id}`) ?? 1000;
        let recipient = setting.get(`recipient_${interaction.guild.id}`)
        let logroom =  setting.get(`log_room_${interaction.guild.id}`)
        let probot = setting.get(`probot_${interaction.guild.id}`)
        let clientrole = setting.get(`client_role_${interaction.guild.id}`)
        if(!price1 || !recipient || !logroom || !probot || !clientrole) return interaction.reply({content:`**لم يتم تحديد الاعدادات . اتصل بالمسؤولين**`})
        let price2 = Math.floor(parseInt(price1 * amount))
        let price3 = Math.floor((price2) * (20/19) + (1))

        const now = new Date();
        const targetTime = new Date(now.getTime() + 1 * 60 * 1000); // 5 minutes in milliseconds
        let TransferEmbed = new EmbedBuilder()
                            .setTitle('**الرجاء التحويل لاكمال عملية الشراء**')
                            .setDescription(`\`\`\`js\n#credit ${recipient} ${price3} ${amount}coin\n\`\`\``)
                            .setColor('Yellow')
                            .setTimestamp();
        let btn = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId(`copyTransfer-${interaction.user.id}`).setLabel('Copy').setEmoji(`💭`).setStyle(ButtonStyle.Secondary)
        )

        const reply = await interaction.reply({content : `<t:${Math.floor(targetTime.getTime() / 1000)}:R>` ,embeds : [TransferEmbed] , components : [btn]})

        const collectorFilter = m => (m.content.includes(price2) && m.content.includes(price2) && (m.content.includes(recipient) || m.content.includes(`<@${recipient}>`)) && m.author.id == probot)
        const collector = await interaction.channel.createMessageCollector({ filter:collectorFilter, max: 1, time: 1000 * 60 * 1 });
        await buyerCheckerDB.set(`buyer-${interaction.user.id}-${interaction.guild.id}` , true)

        let transfered = false;
        collector.on('collect', async() => {
            transfered = true;
            await buyerCheckerDB.delete(`buyer-${interaction.user.id}-${interaction.guild.id}`)
            
            // Delete command messages
            await interaction.deleteReply().catch(() => {});
            
            // Handle balance update
            let userbalance = usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`)
            if(!userbalance) {
                await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, amount)
            } else {
                const newbalance = parseInt(userbalance) + parseInt(amount)
                await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newbalance)
            }

            // Send success DM
            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Purchase Successful')
                .setDescription(`You have purchased \`${amount}\` coins\nNew Balance: \`${userbalance + amount}\` coins`)
                .setTimestamp();

            try {
                await interaction.user.send({ embeds: [successEmbed] });
            } catch (error) {
                console.log('Failed to send DM:', error);
            }

            const clientrole = setting.get(`client_role_${interaction.guild.id}`)
            if(clientrole) {
              const therole = interaction.guild.roles.cache.find(ro => ro.id == clientrole)
              if(therole) {
                await interaction.guild.members.cache.get(interaction.user.id).roles.add(therole).catch(async() => {return;})
              }
            }

            let doneembedprove = new EmbedBuilder()
                                        .setColor('Green')
                                        .setDescription(`**تم شراء \`${amount}\` كوين بواسطة : ${interaction.user}**`)
                                        .setTimestamp();
            let logroom =  await setting.get(`log_room_${interaction.guild.id}`)
            let theroom = interaction.guild.channels.cache.find(ch => ch.id == logroom)
            await theroom.send({embeds:[doneembedprove]}).catch((err) => {console.log('error : ' , err)})

            const { WebhookClient } = require('discord.js');
            const { purchaseWebhookUrl } = require('../../../config.json');
            const webhookClient = new WebhookClient({ url : purchaseWebhookUrl });
            let purchaseEmbeds = new EmbedBuilder()
                                      .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
                                      .setTitle('عملية شراء كوينز جديدة')
                                      .addFields(
                                        {name : `السيرفر` , value : `\`\`\`${interaction.guild.name} (${interaction.guild.id})\`\`\``},
                                        {name : `المشتري` , value : `\`\`\`${interaction.user.username} (${interaction.user.id})\`\`\``},
                                        {name : `عدد الكوينز` , value : `\`\`\`${amount}\`\`\``},
                                        {name : `سعر 1 كوين` , value : `\`\`\`${price1}\`\`\``},
                                        {name : `حساب البنك` , value : `\`\`\`${recipient}\`\`\``})
            await webhookClient.send({embeds : [purchaseEmbeds]});
        });

        collector.on("end", async() => {
            if(transfered === false) {
                await buyerCheckerDB.delete(`buyer-${interaction.user.id}-${interaction.guild.id}`)
                
                // Delete command messages
                await interaction.deleteReply().catch(() => {});

                // Send failure DM
                const failedEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Purchase Failed')
                    .setDescription(`Your purchase of \`${amount}\` coins has failed due to timeout.\nPlease try again.`)
                    .setTimestamp();

                try {
                    await interaction.user.send({ embeds: [failedEmbed] });
                } catch (error) {
                    console.log('Failed to send DM:', error);
                }

                await interaction.channel.send(`**🙅🏻‍♀️ <@${interaction.user.id}> لقد انتهى الوقت لا تقم بالتحويل**`)
            }
        });
    }
}