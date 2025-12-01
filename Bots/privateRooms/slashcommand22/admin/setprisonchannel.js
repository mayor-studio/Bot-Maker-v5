const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/privateRoomsDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-prison-channel')
        .setDescription('Set the prison channel')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to be used as the prison')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ **You do not have sufficient permissions.**',
                ephemeral: true
            });
        }

        const channel = interaction.options.getChannel('channel');
        
        try {
            await db.set(`prison_channel_${interaction.guild.id}`, channel.id);
            
            const prisonRole = interaction.guild.roles.cache.find(r => r.name === "prison");
            if (prisonRole) {
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    ViewChannel: false,
                    SendMessages: false
                });

                await channel.permissionOverwrites.edit(prisonRole, {
                    ViewChannel: true,
                    SendMessages: true,
                    AddReactions: true
                });
            }

            await interaction.reply({
                content: `✅ **${channel} has been set as the prison channel.**`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ **An error occurred while executing the command.**',
                ephemeral: true
            });
        }
    }
};
