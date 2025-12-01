const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/privateRoomsDB.json");
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prisoners')
        .setDescription('Show the list of prisoners'),

    async execute(interaction) {
        const adminRoleId = db.get(`prison_admin_role_${interaction.guild.id}`);
        if (!adminRoleId) return interaction.reply("❌ **The prison admin role has not been set.**");

        if (!interaction.member.roles.cache.has(adminRoleId) && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply("❌ **You must have the designated prison admin role to use this command.**");
        }

        await interaction.deferReply();

        const prisonRole = interaction.guild.roles.cache.find(r => r.name === "prison");
        if (!prisonRole) {
            return interaction.editReply("❌ **There are currently no prisoners.**");
        }

        const prisoners = prisonRole.members;
        if (!prisoners.size) {
            return interaction.editReply("❌ **There are currently no prisoners.**");
        }

        const embed = new EmbedBuilder()
            .setTitle("📜 Prisoners List")
            .setColor("Red")
            .setTimestamp();

        let description = "";
        for (const [id, member] of prisoners) {
            const prisonData = db.get(`prison_${interaction.guild.id}_${id}`);
            if (prisonData) {
                const timeLeft = prisonData.releaseTime - Date.now();
                const timeLeftStr = timeLeft > 0 ? ms(timeLeft, { long: true }) : "No specified time";
                description += `👤 ${member.user.tag}\n⏰ Time left: ${timeLeftStr}\n\n`;
            } else {
                description += `👤 ${member.user.tag}\n⏰ Time left: No specified time\n\n`;
            }
        }

        embed.setDescription(description || "There are currently no prisoners.");
        await interaction.editReply({ embeds: [embed] });
    }
};
