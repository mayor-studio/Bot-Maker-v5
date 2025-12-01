const { ChatInputCommandInteraction, Client, SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('List all server roles with their member counts'),
    
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return interaction.reply({ content: `❌ You do not have permission to use this command.`, ephemeral: true });
            }

            let rolesText = "";
            const roleNames = interaction.guild.roles.cache.map(role => role.name);
            const longestLength = roleNames.reduce((max, name) => Math.max(max, name.length), 0);

            interaction.guild.roles.cache
                .sort((a, b) => b.position - a.position) // Sort roles by position (top to bottom)
                .forEach(role => {
                    rolesText += `${role.name.padEnd(longestLength)} : ${role.members.size} members\n`;
                });

            const chunkSizeLimit = 1990; // Leave room for code block delimiters

            for (let i = 0; i < rolesText.length; i += chunkSizeLimit) {
                const chunk = rolesText.substring(i, i + chunkSizeLimit);
                const formatted = `\`\`\`js\n${chunk}\n\`\`\``;

                if (i === 0) {
                    await interaction.reply(formatted);
                } else {
                    await interaction.followUp(formatted);
                }
            }

        } catch (error) {
            console.error(`Error in /roles command:`, error);
            return interaction.reply({ content: `❌ An error occurred. Please contact the developers.`, ephemeral: true });
        }
    }
};
