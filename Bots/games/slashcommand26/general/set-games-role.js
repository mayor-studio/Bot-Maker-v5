const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const gamesDB = new Database("/Json-db/Bots/gamesDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-games-role')
        .setDescription('تحديد رتبة الألعاب')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('الرتبة')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ يجب أن تكون لديك صلاحية "Administrator" لاستخدام هذا الأمر.', ephemeral: true });
        }

        try {
            const role = interaction.options.getRole('role');
            await gamesDB.set(`games_role_${interaction.guild.id}`, role.id);
            return interaction.reply({ content: `**تم تحديد الرتبة بنجاح**` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `حدث خطأ ما، حاول مرة أخرى.`, ephemeral: true });
        }
    }
};
