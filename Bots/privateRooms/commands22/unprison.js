const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/privateRoomsDB.json");

module.exports = {
    name: "unprison",
    description: "Release a member from prison",
    run: async (client, message, args) => {
        const adminRoleId = db.get(`prison_admin_role_${message.guild.id}`);
        if (!adminRoleId) return message.reply("❌ **The prison admin role has not been set.**");

        if (!message.member.roles.cache.has(adminRoleId) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ **You must have the designated prison admin role to use this command.**");
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("❌ **Mention the user or provide their ID.**");

        const prisonRole = message.guild.roles.cache.find(r => r.name === "prison");
        if (!prisonRole || !target.roles.cache.has(prisonRole.id)) {
            return message.reply("❌ **This member is not currently imprisoned.**");
        }

        const prisonData = db.get(`prison_${message.guild.id}_${target.id}`);

        // Remove prison role and restore original roles
        await target.roles.remove(prisonRole).catch(console.error);
        if (prisonData && prisonData.roles) {
            await target.roles.add(prisonData.roles).catch(console.error);
        }

        // Send DM notification about the release
        const releaseDmEmbed = new EmbedBuilder()
            .setTitle("🔓 You Have Been Released")
            .setDescription(`**You have been released from prison in ${message.guild.name}.\nYour previous roles have been restored.**`)
            .setColor("Green")
            .setTimestamp();

        await target.send({ embeds: [releaseDmEmbed] }).catch(() => {
            message.channel.send(`❌ **Couldn't send a DM to ${target}.**`);
        });

        db.delete(`prison_${message.guild.id}_${target.id}`);
        return message.reply(`✅ **${target.user.tag} has been released from prison.**`);
    }
};
