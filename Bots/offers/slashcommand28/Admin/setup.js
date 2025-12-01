const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { Database } = require("st.db");
const offersDB = new Database("/Json-db/Bots/offersDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the offers system with role and room')
        .addRoleOption(option => 
            option
                .setName('role')
                .setDescription('Ping role for offers')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('mode')
                .setDescription('Offer mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Redirect to ticket channel', value: 'link' },
                    { name: 'Create private ticket between buyer and seller', value: 'custom' }
                )
        )
        .addChannelOption(option => 
            option
                .setName('room')
                .setDescription('Ticket channel (link mode)')
                .setRequired(false)
                .addChannelTypes([ChannelType.GuildText])
        )
        .addChannelOption(option =>
            option
                .setName('category')
                .setDescription('Ticket category (custom mode)')
                .setRequired(false)
                .addChannelTypes([ChannelType.GuildCategory])
        )
        .addChannelOption(option =>
            option
                .setName('transcript')
                .setDescription('Transcript channel (custom mode)')
                .setRequired(false)
                .addChannelTypes([ChannelType.GuildText])
        ),
        
    async execute(interaction) {
        try {
            const role = interaction.options.getRole('role');
            const room = interaction.options.getChannel('room');
            const category = interaction.options.getChannel('category');
            const mode = interaction.options.getString('mode');
            const transcript = interaction.options.getChannel('transcript');

            const roomlink = room ? `https://discord.com/channels/${interaction.guild.id}/${room.id}` : null;
            
            await offersDB.set(`offers_role_${interaction.guild.id}`, role.id);
            await offersDB.set(`offers_mode_${interaction.guild.id}`, mode);
            
            if (room) {
                await offersDB.set(`offers_roomlink_${interaction.guild.id}`, roomlink);
            }
            if (category) {
                await offersDB.set(`offers_category_${interaction.guild.id}`, category.id);
            }
            if (transcript) {
                await offersDB.set(`trans_cha_${interaction.guild.id}`, transcript.id);
            }
            
            return interaction.reply({ content: `✅ Setup completed successfully!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `❌ An error occurred while setting up.`, ephemeral: true });
        }
    }
};
