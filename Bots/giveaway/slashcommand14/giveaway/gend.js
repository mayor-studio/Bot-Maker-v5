const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const giveawayDB = new Database("/Json-db/Bots/giveawayDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gend')
        .setDescription('End a giveaway early')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('The message ID of the giveaway')
                .setRequired(true)),
    adminsOnly: true,

    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');
        const giveawayData = await giveawayDB.get(`giveaway_${messageId}`);

        if (!giveawayData || giveawayData.ended) {
            return interaction.reply({
                content: '❌ No active giveaway found with that message ID!',
                ephemeral: true
            });
        }

        try {
            const channel = await interaction.guild.channels.fetch(giveawayData.channelId);
            const message = await channel.messages.fetch(messageId);
            const reaction = message.reactions.cache.get(giveawayData.emoji || '🎉');
            const users = await reaction.users.fetch();
            const validParticipants = users.filter(user => !user.bot).map(u => u.id);

            const winners = [];
            for (let i = 0; i < Math.min(giveawayData.winnersCount, validParticipants.length); i++) {
                const winnerIndex = Math.floor(Math.random() * validParticipants.length);
                winners.push(validParticipants[winnerIndex]);
                validParticipants.splice(winnerIndex, 1);
            }

            const endEmbed = EmbedBuilder.from(message.embeds[0])
                .setTitle('🎉 Giveaway Ended 🎉')
                .setDescription(`**Prize:** ${giveawayData.prize}\n**Winners:** ${winners.length > 0 ? winners.map(w => `<@${w}>`).join(', ') : 'No valid winners'}`);

            await message.edit({ embeds: [endEmbed] });

            if (winners.length > 0) {
                await channel.send({
                    content: `🎊 Congratulations ${winners.map(w => `<@${w}>`).join(', ')}! You won **${giveawayData.prize}**!`,
                    allowedMentions: { users: winners }
                });
            } else {
                await channel.send('❌ No winners selected – not enough participants.');
            }

            await giveawayDB.set(`giveaway_${messageId}`, {
                ...giveawayData,
                ended: true,
                winners
            });

            await interaction.reply({
                content: '✅ The giveaway has been successfully ended!',
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: '❌ An error occurred while ending the giveaway!',
                ephemeral: true
            });
        }
    }
};
