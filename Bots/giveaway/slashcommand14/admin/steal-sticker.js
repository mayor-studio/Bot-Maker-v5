const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steal-sticker')
        .setDescription('اضافة ستيكرات الى سيرفرك')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {

        await interaction.reply(`**  يرجى ارسال الاستيكر الذي تريد إضافته**`)
        const filter = (m) => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({filter: filter, time: 15000, max: 1});

        collector.on('collect', async m => {
            const sticker = m.stickers.first();

            const {guild} = interaction;
            
            if (m.stickers.size == 0) return await interaction.editReply(`**تسوقها؟ هذا مو ستيكر 🦦 **`)

            if (sticker.url.endsWith('.json')) return await interaction.editReply(`**حدث خطأ اثناء اضافة الستيكر ❌ **`)

            if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) return await interaction.editReply(`**حدث خطأ اثناء اضافة الستيكر  يرجى التاكد من صلاحياتي اولا ❌ **`)
            try {
            const newSticker = await guild.stickers.create({
                name: sticker.name,
                description: sticker.description || '',
                tags: sticker.tags,
                file: sticker.url
            })

            await interaction.editReply(`**تم اضافة الستيكر بنجاح  ☑️** **${newSticker.name}** `)
        } catch (err) {
            console.log(err)
            await interaction.editReply(`**لا يمكنك اضافة المزيد من الستيكرات يرجى حذف ستيكر اولا ❌ **`)
        }
            
        })

        collector.on('end', async reason => {
            if (reason === 'time') return await interaction.editReply(`Ran out of time..`)
            
        })
    }
}