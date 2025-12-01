const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const giveawayDB = new Database("/Json-db/Bots/giveawayDB.json");
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gstart')
        .setDescription('Start a giveaway')
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Giveaway duration (1m, 1h, 1d)')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('winners')
                .setDescription('Number of winners')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('Prize to win')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Add an image to the giveaway'))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The emoji for the giveaway')),
    adminsOnly: true,

    async execute(interaction) {
        const duration = ms(interaction.options.getString('duration'));
        const winnersCount = interaction.options.getInteger('winners');
        const prize = interaction.options.getString('prize');
        const image = interaction.options.getAttachment('image');
        const customEmoji = interaction.options.getString('emoji') || await giveawayDB.get(`giveaway_emoji_${interaction.guild.id}`) || '🎉';

        try {
            // Test if emoji is valid
            await interaction.channel.send(customEmoji).then(msg => msg.delete());
        } catch (error) {
            return interaction.reply({
                content: '❌ Invalid emoji! Default emoji 🎉 will be used.',
                ephemeral: true
            });
        }

        if (!duration) {
            return interaction.reply({ 
                content: '❌ Please provide a valid time! Example: 1m, 1h, 1d', 
                ephemeral: true 
            });
        }

        const endTime = Date.now() + duration;

        const giveawayEmbed = new EmbedBuilder()
            .setTitle(`${customEmoji} GIVEAWAY ${customEmoji}`)
            .setDescription(`**Prize:** ${prize}\n**Winners:** ${winnersCount}\n**Ends:** <t:${Math.floor(endTime/1000)}:R>\n\nClick ${customEmoji} to enter!`)
            .setColor('#FF0000')
            .setTimestamp(endTime)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Hosted by: ${interaction.user.tag}` });

        if (image) {
            giveawayEmbed.setImage(image.url);
        }

        const message = await interaction.channel.send({ embeds: [giveawayEmbed] });
        await message.react(customEmoji);

        await giveawayDB.set(`giveaway_${message.id}`, {
            messageId: message.id,
            channelId: interaction.channel.id,
            guildId: interaction.guild.id,
            prize: prize,
            winnersCount: winnersCount,
            endTime: endTime,
            hosterId: interaction.user.id,
            emoji: customEmoji,
            imageUrl: image ? image.url : null,
            ended: false
        });

        await interaction.reply({ 
            content: `✅ Giveaway started!`, 
            ephemeral: true 
        });

        // Set timeout to end giveaway
        setTimeout(() => endGiveaway(message.id, interaction.client), duration);
    }
};

async function endGiveaway(messageId, client) {
    try {
        const giveawayData = await giveawayDB.get(`giveaway_${messageId}`);
        if (!giveawayData || giveawayData.ended) return;

        const { channelId, prize, winnersCount, emoji } = giveawayData;
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel) return;

        const message = await channel.messages.fetch(messageId).catch(() => null);
        if (!message) return;

        let validParticipants = [];
        try {
            // Handle both custom and default emojis
            const customEmoji = emoji || '🎉';
            const reaction = message.reactions.cache.find(r => 
                r.emoji.name === customEmoji || 
                r.emoji.toString() === customEmoji ||
                r.emoji.id === customEmoji
            );

            if (reaction) {
                const users = await reaction.users.fetch();
                validParticipants = users.filter(user => !user.bot).map(u => u.id);
                console.log(`Found ${validParticipants.length} valid participants`);
            } else {
                console.log(`No reaction found for emoji: ${customEmoji}`);
            }
        } catch (error) {
            console.error('Error fetching reaction users:', error);
            return;
        }

        const winners = [];
        if (validParticipants.length > 0) {
            for (let i = 0; i < Math.min(winnersCount, validParticipants.length); i++) {
                const winnerIndex = Math.floor(Math.random() * validParticipants.length);
                winners.push(validParticipants[winnerIndex]);
                validParticipants.splice(winnerIndex, 1);
            }
        }

        const endEmbed = EmbedBuilder.from(message.embeds[0])
            .setTitle('🎉 GIVEAWAY ENDED 🎉')
            .setDescription(`**Prize:** ${prize}\n**Winners:** ${winners.length > 0 ? winners.map(w => `<@${w}>`).join(', ') : 'No valid participants'}`)
            .setThumbnail(winners.length > 0 ? 
                (await client.users.fetch(winners[0])).displayAvatarURL({ dynamic: true }) : 
                message.guild.iconURL({ dynamic: true }));

        await message.edit({ embeds: [endEmbed] });

        if (winners.length > 0) {
            await channel.send({
                content: `🎊 Congratulations ${winners.map(w => `<@${w}>`).join(', ')}! You won **${prize}**!`,
                allowedMentions: { users: winners }
            });
        } else {
            await channel.send('❌ No winners chosen - not enough participants.');
        }

        await giveawayDB.set(`giveaway_${messageId}`, {
            ...giveawayData,
            ended: true,
            winners
        });
    } catch (error) {
        console.error('Error in endGiveaway:', error);
    }
}
