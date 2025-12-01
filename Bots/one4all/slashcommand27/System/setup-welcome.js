const { SlashCommandBuilder } = require('@discordjs/builders');
const { Database } = require('st.db');
const systemDB = new Database('/Json-db/Bots/systemDB.json');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('setup-welcome')
        .setDescription('Configure the welcome system')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send welcome messages')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to assign to new members')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Image URL for the welcome embed')
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');
        const image = interaction.options.getString('image');

        await systemDB.set(`welcome_channel_${interaction.guild.id}`, channel.id);

        if (role) {
            await systemDB.set(`welcome_role_${interaction.guild.id}`, role.id);
        } else {
            await systemDB.delete(`welcome_role_${interaction.guild.id}`);
        }

        if (image) {
            await systemDB.set(`welcome_image_${interaction.guild.id}`, image);
        } else {
            await systemDB.delete(`welcome_image_${interaction.guild.id}`);
        }

        await interaction.reply({ content: `✅ Welcome settings have been updated successfully.`, ephemeral: true });
    },
};
