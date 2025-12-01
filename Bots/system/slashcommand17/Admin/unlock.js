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
        .setName('unlock')
        .setDescription('Unlock the current channel'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({
                content: `❌ You don't have permission to use this command.`,
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: false });

        try {
            await interaction.channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone,
                { SendMessages: true }
            );

            return interaction.editReply({
                content: `✅ ${interaction.channel} has been unlocked.`
            });
        } catch (error) {
            console.error(error);
            return interaction.editReply({
                content: `❌ Failed to unlock the channel. Make sure I have the correct permissions.`
            });
        }
    }
};
