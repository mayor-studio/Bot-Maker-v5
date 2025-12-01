const { PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/privateRoomsDB.json");

module.exports = {
    name: "prison",
    description: "Imprison a member",
    run: async (client, message, args) => {
        const adminRoleId = db.get(`prison_admin_role_${message.guild.id}`);
        if (!adminRoleId) return message.reply("❌ **The prison admin role has not been set.**");
        
        if (!message.member.roles.cache.has(adminRoleId) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ **You must have the designated prison admin role to use this command.**");
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("❌ **Mention the user or provide their ID.**");

        if (target.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply("❌ **You cannot imprison someone with a higher or equal role.**");
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId('prison_duration')
            .setPlaceholder('Select imprisonment duration')
            .addOptions([
                { label: '1 Hour', value: '1h', description: 'Imprison for 1 hour' },
                { label: '10 Hours', value: '10h', description: 'Imprison for 10 hours' },
                { label: '1 Day', value: '1d', description: 'Imprison for 1 day' },
                { label: '5 Days', value: '5d', description: 'Imprison for 5 days' },
                { label: '7 Days', value: '7d', description: 'Imprison for 7 days' },
            ]);

        const row = new ActionRowBuilder().addComponents(select);
        const embed = new EmbedBuilder()
            .setTitle('⌛ Select Imprisonment Duration')
            .setDescription(`Target: ${target}`)
            .setColor('Red');

        // Store target info for the collector
        await db.set(`prison_pending_${message.guild.id}`, {
            targetId: target.id
        });

        const msg = await message.reply({ embeds: [embed], components: [row] });

        // Add timeout to clean up pending data
        setTimeout(() => {
            db.delete(`prison_pending_${message.guild.id}`);
            msg.delete().catch(() => {});
        }, 30000); // 30 seconds timeout
    }
};
