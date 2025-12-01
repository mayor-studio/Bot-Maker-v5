const {
    Client,
    PermissionsBitField,
    SlashCommandBuilder
} = require("discord.js");

const { Database } = require("st.db");
const systemDB = new Database("/Json-db/Bots/systemDB.json");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('unhide')
        .setDescription('Unhide the current channel for everyone'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({
                content: `**You don't have permission to do that.**`,
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: false });

        await interaction.channel.permissionOverwrites.edit(
            interaction.guild.roles.everyone,
            { ViewChannel: true }
        );

        return interaction.editReply({
            content: `✅ **${interaction.channel} has been unhidden for everyone.**`
        });
    }
};
