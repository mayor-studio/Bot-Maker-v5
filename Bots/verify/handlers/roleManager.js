const { PermissionsBitField } = require('discord.js');

async function addRole(member, role) {
    try {
        if (!member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            throw new Error('Bot missing MANAGE_ROLES permission');
        }

        if (role.position >= member.guild.members.me.roles.highest.position) {
            throw new Error('Role is higher than bot\'s highest role');
        }

        await member.roles.add(role);
        return true;
    } catch (error) {
        console.error('Error adding role:', error);
        return false;
    }
}

async function removeRole(member, role) {
    try {
        if (!member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            throw new Error('Bot missing MANAGE_ROLES permission');
        }

        if (role.position >= member.guild.members.me.roles.highest.position) {
            throw new Error('Role is higher than bot\'s highest role');
        }

        await member.roles.remove(role);
        return true;
    } catch (error) {
        console.error('Error removing role:', error);
        return false;
    }
}

module.exports = { addRole, removeRole };
