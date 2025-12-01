const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { Database } = require("st.db");
const warnsDB = new Database("/Json-db/Bots/warnsDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('The member to warn')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
            .setDescription('Reason for the warning')
            .setRequired(false)),
    adminsOnly: true,

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const guildId = interaction.guild.id;
        const userId = user.id;

        let userWarns = await warnsDB.get(`warns_${guildId}_${userId}`) || [];
        userWarns.push({
            moderator: interaction.user.id,
            reason: reason,
            timestamp: Date.now()
        });

        await warnsDB.set(`warns_${guildId}_${userId}`, userWarns);

        // Create DM embed
        const dmEmbed = new EmbedBuilder()
            .setTitle(`You have been warned in ${interaction.guild.name}`)
            .setDescription(`You have received a warning from ${interaction.user.tag}`)
            .addFields(
                { name: 'Reason', value: reason },
                { name: 'Total warnings', value: `${userWarns.length}` }
            )
            .setColor('Red')
            .setTimestamp();

        // Try to send DM
        try {
            await user.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.error("Couldn't send DM to the user");
        }

        // Confirmation embed
        const embed = new EmbedBuilder()
            .setTitle('Warning issued')
            .setDescription(`${user.tag} has been warned`)
            .addFields(
                { name: 'Reason', value: reason },
                { name: 'Total warnings', value: `${userWarns.length}` }
            )
            .setColor('Red')
            .setTimestamp();

        // Create buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`delete_warn_${user.id}`)
                    .setLabel('Delete message')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`show_warns_${user.id}`)
                    .setLabel('Show warnings')
                    .setStyle(ButtonStyle.Primary)
            );

        const response = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        // Create button collector
        const collector = response.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'You cannot use this button', ephemeral: true });
            }

            if (i.customId === `delete_warn_${user.id}`) {
                await i.message.delete().catch(() => null);
                collector.stop();
            }
            
            if (i.customId === `show_warns_${user.id}`) {
                const warns = userWarns.map((warn, index) => {
                    return `**#${index + 1}** by <@${warn.moderator}>\n**Reason:** ${warn.reason}\n**Date:** <t:${Math.floor(warn.timestamp / 1000)}:R>`;
                }).join('\n\n');

                const warnsEmbed = new EmbedBuilder()
                    .setTitle(`Warnings for ${user.tag}`)
                    .setDescription(warns || 'No warnings')
                    .setColor('Blue')
                    .setTimestamp();

                await i.reply({ embeds: [warnsEmbed], ephemeral: true });
            }
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`delete_warn_${user.id}`)
                        .setLabel('Delete message')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`show_warns_${user.id}`)
                        .setLabel('Show warnings')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                );
            response.edit({ components: [disabledRow] }).catch(() => null);
        });
    }
};
