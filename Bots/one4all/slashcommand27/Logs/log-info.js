const { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('logs-info')
        .setDescription('Information about the logging system in the server'),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction) {
        await interaction.deferReply();

        // Messages
        let messagedelete = await db.get(`log_messagedelete_${interaction.guild.id}`);
        let messageupdate = await db.get(`log_messageupdate_${interaction.guild.id}`);
        // Roles
        let rolecreate = await db.get(`log_rolecreate_${interaction.guild.id}`);
        let roledelete = await db.get(`log_roledelete_${interaction.guild.id}`);
        let rolegive = await db.get(`log_rolegive_${interaction.guild.id}`);
        let roleremove = await db.get(`log_roleremove_${interaction.guild.id}`);
        // Channels
        let channelcreate = await db.get(`log_channelcreate_${interaction.guild.id}`);
        let channeldelete = await db.get(`log_channeldelete_${interaction.guild.id}`);
        // Bots
        let botadd = await db.get(`log_botadd_${interaction.guild.id}`);
        // Ban and kick
        let banadd = await db.get(`log_banadd_${interaction.guild.id}`);
        let bandelete = await db.get(`log_bandelete_${interaction.guild.id}`);
        let kickadd = await db.get(`log_kickadd_${interaction.guild.id}`);

        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTitle('**Logging System Information**')
            .addFields(
                { name: `Message Deleted`, value: `${messagedelete ? `<#${messagedelete}>` : '```Not Set```'}`, inline: true },
                { name: `Message Updated`, value: `${messageupdate ? `<#${messageupdate}>` : '```Not Set```'}`, inline: true },
                { name: `\n`, value: `\n`, inline: true },
                { name: `Role Created`, value: `${rolecreate ? `<#${rolecreate}>` : '```Not Set```'}`, inline: true },
                { name: `Role Deleted`, value: `${roledelete ? `<#${roledelete}>` : '```Not Set```'}`, inline: true },
                { name: `Role Given`, value: `${rolegive ? `<#${rolegive}>` : '```Not Set```'}`, inline: true },
                { name: `Role Removed`, value: `${roleremove ? `<#${roleremove}>` : '```Not Set```'}`, inline: true },
                { name: `\n`, value: `\n`, inline: true },
                { name: `\n`, value: `\n`, inline: true },
                { name: `Channel Created`, value: `${channelcreate ? `<#${channelcreate}>` : '```Not Set```'}`, inline: true },
                { name: `Channel Deleted`, value: `${channeldelete ? `<#${channeldelete}>` : '```Not Set```'}`, inline: true },
                { name: `\n`, value: `\n`, inline: true },
                { name: `Bot Added`, value: `${botadd ? `<#${botadd}>` : '```Not Set```'}`, inline: true },
                { name: `\n`, value: `\n`, inline: true },
                { name: `\n`, value: `\n`, inline: true },
                { name: `Ban Added`, value: `${banadd ? `<#${banadd}>` : '```Not Set```'}`, inline: true },
                { name: `Ban Removed`, value: `${bandelete ? `<#${bandelete}>` : '```Not Set```'}`, inline: true },
                { name: `Kick`, value: `${kickadd ? `<#${kickadd}>` : '```Not Set```'}`, inline: true }
            )
            .setColor('Random')
            .setTimestamp()
            .setFooter({ text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        await interaction.editReply({ embeds: [embed] });
    }
};
