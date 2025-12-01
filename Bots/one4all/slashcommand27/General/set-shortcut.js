const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const shortcutDB = new Database("/Json-db/Others/shortcutDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('cmd-shortcut')
        .setDescription('Assign a shortcut for a specific command')
        .addStringOption(option =>
            option
                .setName('command')
                .setDescription('Select the command')
                .setRequired(true)
                .addChoices(
                    { name: 'avatar', value: 'avatar' },
                    { name: 'banner', value: 'banner' },
                    { name: 'user', value: 'user' },
                    { name: 'clear', value: 'clear' },
                    { name: 'lock', value: 'lock' },
                    { name: 'unlock', value: 'unlock' },
                    { name: 'hide', value: 'hide' },
                    { name: 'unhide', value: 'unhide' },
                    { name: 'server', value: 'server' },
                    { name: 'come', value: 'come' },
                    { name: 'say', value: 'say' },
                    { name: 'ban', value: 'ban' },
                    { name: 'kick', value: 'kick' },
                    { name: 'mute', value: 'mute' },
                    { name: 'unmute', value: 'unmute' },
                    { name: 'timeout', value: 'timeout' },
                    { name: 'unban', value: 'unban' },
                    { name: 'untimeout', value: 'untimeout' }
                )
        )
        .addStringOption(option =>
            option
                .setName('shortcut')
                .setDescription('The shortcut to assign')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const command = interaction.options.getString('command');
            const shortcut = interaction.options.getString('shortcut');

            await shortcutDB.set(`${command}_cmd_${interaction.guild.id}`, shortcut);

            return interaction.reply({
                content: `✅ Shortcut for command \`${command}\` has been set to: \`${shortcut}\``
            });
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: `❌ An error occurred. Please try again later.`,
                ephemeral: true
            });
        }
    }
};
