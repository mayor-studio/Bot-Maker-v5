const {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/protectDB.json");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('protection-status')
        .setDescription('Check the current protection system status'),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false });

        try {
            const banStatus = db.get(`ban_status_${interaction.guild.id}`) || null;
            const banLimit = db.get(`ban_limit_${interaction.guild.id}`);

            const botsStatus = db.get(`antibots_status_${interaction.guild.id}`) || null;
            const botsLimit = "Not Set";

            const deleteRolesStatus = db.get(`antideleteroles_status_${interaction.guild.id}`) || null;
            const deleteRolesLimit = db.get(`antideleteroles_limit_${interaction.guild.id}`) || "Not Set";

            const deleteRoomsStatus = db.get(`antideleterooms_status_${interaction.guild.id}`) || null;
            const deleteRoomsLimit = db.get(`antideleterooms_limit_${interaction.guild.id}`) || "Not Set";

            const embed = new EmbedBuilder()
                .setTitle('Protection System Status')
                .addFields(
                    {
                        name: `Anti-Bots`,
                        value: `Status: ${botsStatus === "on" ? "🟢 Enabled" : "🔴 Disabled"}\nAllowed per day: \`${botsLimit}\``
                    },
                    {
                        name: `Anti-Ban`,
                        value: `Status: ${banStatus === "on" ? "🟢 Enabled" : "🔴 Disabled"}\nAllowed per day: \`${banLimit >= 0 ? banLimit : "Not Set"}\``
                    },
                    {
                        name: `Anti-Channel Delete`,
                        value: `Status: ${deleteRoomsStatus === "on" ? "🟢 Enabled" : "🔴 Disabled"}\nAllowed per day: \`${deleteRoomsLimit}\``
                    },
                    {
                        name: `Anti-Role Delete`,
                        value: `Status: ${deleteRolesStatus === "on" ? "🟢 Enabled" : "🔴 Disabled"}\nAllowed per day: \`${deleteRolesLimit}\``
                    }
                );

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error('Error retrieving protection status:', err);
            await interaction.editReply({ content: '❌ Failed to fetch protection system status.', ephemeral: true });
        }
    }
};
