const { 
    SlashCommandBuilder, 
    PermissionsBitField 
} = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot send a message')
        .addStringOption(option =>
            option.setName('sentence')
                .setDescription('The message to send')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('The ID of the message to reply to (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: `**You don't have permission to do that.**`, ephemeral: true });
        }

        const sentence = interaction.options.getString('sentence');
        const messageId = interaction.options.getString('message_id');

        try {
            if (messageId) {
                const msgToReply = await interaction.channel.messages.fetch(messageId).catch(() => null);
                if (!msgToReply) {
                    return interaction.reply({ content: `**Message with that ID was not found in this channel.**`, ephemeral: true });
                }

                await msgToReply.reply({ content: sentence });
            } else {
                await interaction.channel.send({ content: sentence });
            }

            const reply = await interaction.reply({ content: `**Done.**`, ephemeral: true });
            setTimeout(() => reply.delete().catch(() => {}), 1500);

        } catch (err) {
            console.error(err);
            return interaction.reply({ content: `**An error occurred.**`, ephemeral: true });
        }
    }
};
