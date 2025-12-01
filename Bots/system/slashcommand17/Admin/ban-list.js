  const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-banned')
        .setDescription('List Banned Members')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        try {
            const bannedMembers = await interaction.guild.bans.fetch();

            if (bannedMembers.size === 0) {
                return interaction.reply({ content: '**`No Banned Members In thise server`**', ephemeral: true });
            }

            const banEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('**Banned List**')
                .setDescription('Thise Is The List')
                .setTimestamp();

            bannedMembers.forEach((ban, index) => {
                banEmbed.addFields({ name: `**${index + 1}. ${ban.user.tag}**`, value: `**ID: ${ban.user.id}**`, inline: false });
            });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('unban_select')
                .setPlaceholder('Choose Member To Unban')
                .addOptions(
                    bannedMembers.map(ban => ({
                        label: ban.user.tag,
                        description: `ID: ${ban.user.id}`,
                        value: ban.user.id
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({ embeds: [banEmbed], components: [row], ephemeral: true });

            const filter = i => i.customId === 'unban_select' && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                const userId = i.values[0];
                try {
                    await interaction.guild.members.unban(userId);

                    await i.update({
                        content: `**✅ Succes Unban Member**`,
                        components: [],
                        embeds: []
                    });
                } catch (error) {
                    console.error(error);
                    await i.update({
                        content: '**An Error Detected**',
                        components: [],
                        embeds: []
                    });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: '** Time Ran Out **', components: [], embeds: [] });
                }
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '** An Error Detected **', ephemeral: true });
        }
    },
};
  