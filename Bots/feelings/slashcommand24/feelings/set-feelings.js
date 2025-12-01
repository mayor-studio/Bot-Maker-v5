const { SlashCommandBuilder } = require('discord.js');
const { Database } = require("st.db");
const feelingsDB = new Database("/Json-db/Bots/feelingsDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-feelings-room')
        .setDescription('Set the feelings channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to be used as a feelings channel')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('first-reaction')
                .setDescription('First emoji reaction')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('second-reaction')
                .setDescription('Second emoji reaction')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('third-reaction')
                .setDescription('Third emoji reaction')
                .setRequired(false)),
    adminsOnly: true,

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const reaction1 = interaction.options.getString('first-reaction') || '❤️';
        const reaction2 = interaction.options.getString('second-reaction') || '👍';
        const reaction3 = interaction.options.getString('third-reaction') || '🌟';

        // Validate emojis by trying to react with them
        const testMsg = await interaction.channel.send('Testing reactions...');
        try {
            await testMsg.react(reaction1);
            await testMsg.react(reaction2);
            await testMsg.react(reaction3);
            await testMsg.delete();
        } catch (error) {
            await testMsg.delete();
            return interaction.reply({
                content: '❌ One or more invalid reaction emojis provided!',
                ephemeral: true
            });
        }

        await feelingsDB.set(`feelings_room_${interaction.guild.id}`, channel.id);
        await feelingsDB.set(`feelings_reactions_${interaction.guild.id}`, {
            reaction1,
            reaction2,
            reaction3
        });

        await interaction.reply({
            content: `✅ Feelings channel has been set to ${channel}\nReactions: ${reaction1} ${reaction2} ${reaction3}`,
            ephemeral: true
        });
    }
};
