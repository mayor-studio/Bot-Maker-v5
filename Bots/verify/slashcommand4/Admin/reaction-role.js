const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require("st.db");
const verifyDB = new Database("/Json-db/Bots/verifyDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('reaction-role')
        .setDescription('انشاء ايمبد للرتب التفاعلية')
        .addStringOption(option => 
            option
                .setName('title')
                .setDescription('عنوان الايمبد')
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('description')
                .setDescription('وصف الايمبد')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('emoji')
                .setDescription('الايموجي المطلوب للتفاعل')
                .setRequired(true))
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('الرتبة التي سيتم اعطائها')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('image')
                .setDescription('رابط الصورة (اختياري)')
                .setRequired(false)),

    async execute(interaction) {
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const emoji = interaction.options.getString('emoji');
        const role = interaction.options.getRole('role');
        const image = interaction.options.getString('image');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor('Random')
            .setTimestamp();

        if (image) embed.setImage(image);

        const msg = await interaction.channel.send({ embeds: [embed] });
        await msg.react(emoji);

        // Save reaction role data
        const reactionRoles = verifyDB.get(`reaction_roles_${interaction.guild.id}`) || [];
        
        reactionRoles.push({
            messageId: msg.id,
            channelId: msg.channel.id,
            emoji: emoji,
            roleId: role.id
        });

        await verifyDB.set(`reaction_roles_${interaction.guild.id}`, reactionRoles);
        
        await interaction.reply({ 
            content: `✅ تم انشاء رتبة تفاعلية:\nالايموجي: ${emoji}\nالرتبة: ${role}`, 
            ephemeral: true 
        });
    }
};
