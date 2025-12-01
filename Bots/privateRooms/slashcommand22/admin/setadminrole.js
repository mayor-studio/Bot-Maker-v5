const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/privateRoomsDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-prison-admin')
        .setDescription('Set the prison admin role')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role responsible for managing the prison')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const role = interaction.options.getRole('role');
        
        await db.set(`prison_admin_role_${interaction.guild.id}`, role.id);
        
        await interaction.reply({
            content: `✅ **${role} has been set as the prison admin role.**`,
            ephemeral: true
        });
    }
};
