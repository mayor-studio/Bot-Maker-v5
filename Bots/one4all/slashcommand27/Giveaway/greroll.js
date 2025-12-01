const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const giveawayDB = new Database("/Json-db/Bots/giveawayDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('greroll')
        .setDescription('Reroll a giveaway\'s winners')
        .addStringOption(option => 
            option.setName('message_id')
                .setDescription('The message ID of the giveaway')
                .setRequired(true)),
    adminsOnly: true,

    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');
        const giveawayData = await giveawayDB.get(`giveaway_${messageId}`);

        if (!giveawayData || !giveawayData.ended) {
            return interaction.reply({
                content: '❌ No ended giveaway was found with that message ID!',
                ephemeral: true
            });
        }

        try {
            const channel = await interaction.guild.channels.fetch(giveawayData.channelId);
            const message = await channel.messages.fetch(messageId);
            const reaction = message.reactions.cache.get(giveawayData.emoji || '🎉');
            const users = await reaction.users.fetch();
            const validParticipants = users.filter(user => !user.bot).map(u => u.id);

            if (validParticipants.length === 0) {
                return interaction.reply({
                    content: '❌ No valid participants found to reroll!',
                    ephemeral: true
                });
            }

            const winners = [];
            for (let i = 0; i < Math.min(giveawayData.winnersCount, validParticipants.length); i++) {
                const winnerIndex = Math.floor(Math.random() * validParticipants.length);
                winners.push(validParticipants[winnerIndex]);
                validParticipants.splice(winnerIndex, 1);
            }

            const rerollEmbed = new EmbedBuilder()
                .setTitle('🎉 Giveaway Rerolled 🎉')
                .setDescription(`**Prize:** ${giveawayData.prize}\n**New Winners:** ${winners.map(w => `<@${w}>`).join(', ')}`)
                .setColor('#FF0000')
                .setTimestamp();

            await interaction.reply({ embeds: [rerollEmbed] });

            await channel.send({
                content: `🎊 Congratulations ${winners.map(w => `<@${w}>`).join(', ')}! You won **${giveawayData.prize}**! (Reroll)`,
                allowedMentions: { users: winners }
            });

            await giveawayDB.set(`giveaway_${messageId}`, {
                ...giveawayData,
                winners
            });

        } catch (error) {
            console.error('Reroll error:', error);
            return interaction.reply({
                content: '❌ An error occurred while rerolling the giveaway!',
                ephemeral: true
            });
        }
    }
};
