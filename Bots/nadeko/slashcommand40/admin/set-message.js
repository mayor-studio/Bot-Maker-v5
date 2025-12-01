const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/nadekoDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-message')
        .setDescription('Set the welcome message')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The welcome message')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const message = interaction.options.getString('message');
        await db.set(`message_${interaction.guild.id}`, message);

        return interaction.editReply({ content: '**Welcome message set successfully!**' });
    }
};
