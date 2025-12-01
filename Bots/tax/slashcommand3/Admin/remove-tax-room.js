const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/taxDB");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-tax-room')
        .setDescription('حذف روم الضريبة التلقائية'),

    async execute(interaction) {
        // Check permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: '**لا تمتلك صلاحية لفعل ذلك**', ephemeral: true });
        }

        const key = `tax_room_${interaction.guild.id}`;
        const exists = db.has(key);

        if (!exists) {
            return interaction.reply({ content: '**لم يتم تحديد روم للضريبة مسبقًا.**', ephemeral: true });
        }

        await db.delete(key);

        return interaction.reply({ content: '**تم حذف روم الضريبة بنجاح.**' });
    }
};
