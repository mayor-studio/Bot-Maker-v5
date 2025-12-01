const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const ticketDB = new Database("/Json-db/Bots/ticketDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-ticket-log')
        .setDescription('Set the ticket log channel')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of log')
                .setRequired(true)
                .addChoices(
                    { name: 'Log', value: 'log' },
                    { name: 'Transcript', value: 'transcript' }
                )
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Select the channel')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ You must be an administrator to use this command.', ephemeral: true });
        }

        try {
            const type = interaction.options.getString('type');
            const channel = interaction.options.getChannel('channel');

            if (!channel || !channel.id) {
                return interaction.reply({ content: '❌ The selected channel does not exist.', ephemeral: true });
            }

            let key;
            if (type === 'log') {
                key = `LogsRoom_${interaction.guild.id}`;
            } else if (type === 'transcript') {
                key = `TransRoom_${interaction.guild.id}`;
            } else {
                return interaction.reply({ content: '❌ Invalid log type.', ephemeral: true });
            }

            await ticketDB.set(key, channel.id);

            return interaction.reply({ content: `✅ Successfully set the channel <#${channel.id}> for ${type}.` });
        } catch (error) {
            console.error('Error setting ticket log:', error);
            return interaction.reply({ content: '❌ An error occurred, please try again.', ephemeral: true });
        }
    }
};
