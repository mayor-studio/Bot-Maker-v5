const { Client, Collection, PermissionsBitField, SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const systemDB = new Database("/Json-db/Bots/systemDB.json");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something')
        .addStringOption(option =>
            option
                .setName('sentence')
                .setDescription('The message to send')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                content: `❌ You do not have permission to use this command.`,
                ephemeral: true
            });
        }

        const sentence = interaction.options.getString('sentence');
        await interaction.channel.send({ content: sentence });

        return interaction.reply({
            content: `✅ Message sent.`,
            ephemeral: true
        }).then(async (msg) => {
            setTimeout(() => {
                msg.delete().catch(() => {}); // Catch to avoid error if already deleted
            }, 1500);
        });
    }
};
