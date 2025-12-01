const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require("st.db");
const inviterDB = new Database("/Json-db/Bots/inviterDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('invites-room')
        .setDescription('Set the invite tracking channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set for invite messages')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel('channel');

            if (!channel.isTextBased()) {
                return interaction.reply({
                    content: '❌ The selected channel must be a text channel.',
                    ephemeral: true
                });
            }

            inviterDB.set(`welcomeChannel_${interaction.guild.id}`, channel.id);

            await interaction.reply({
                content: `✅ Invite messages will now be sent in ${channel}.`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ An error occurred while executing the command.',
                ephemeral: true
            });
        }
    },
};
