const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/protectDB.json");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('anti-delete-rooms')
        .setDescription('Configure the protection system against channel deletions')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Enable or disable the system')
                .setRequired(true)
                .addChoices(
                    { name: 'On', value: 'on' },
                    { name: 'Off', value: 'off' }
                )
        )
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Allowed number of channel deletions per day')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        try {
            const status = interaction.options.getString('status');
            const limit = interaction.options.getInteger('limit');

            await db.set(`antideleterooms_status_${interaction.guild.id}`, status);
            await db.set(`antideleterooms_limit_${interaction.guild.id}`, limit);
            await db.set(`roomsdelete_users_${interaction.guild.id}`, []);

            return interaction.editReply({
                content: `✅ **Channel deletion protection system set to \`${status.toUpperCase()}\` with a limit of \`${limit}\` deletions per day.**\nMake sure my role is at the top of the server roles list.`
            });
        } catch (err) {
            console.error(err);
            return interaction.editReply({
                content: '❌ **An error occurred while configuring the system.**'
            });
        }
    }
};
