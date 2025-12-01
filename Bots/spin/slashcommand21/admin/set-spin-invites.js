const { SlashCommandBuilder } = require('discord.js');
const { Database } = require("st.db");
const spinDB = new Database("/Json-db/Bots/spinDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-spin-invites')
        .setDescription('Set the number of required invites for spin access')
        .addSubcommand(sub => 
            sub.setName('normal')
                .setDescription('Set required invites for normal spin')
                .addIntegerOption(opt => 
                    opt.setName('invites')
                        .setDescription('Number of invites required')
                        .setRequired(true)
                        .setMinValue(1)))
        .addSubcommand(sub => 
            sub.setName('vip')
                .setDescription('Set required invites for VIP spin')
                .addIntegerOption(opt => 
                    opt.setName('invites')
                        .setDescription('Number of invites required')
                        .setRequired(true)
                        .setMinValue(1))),

    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        const invites = interaction.options.getInteger('invites');

        if (subCommand === 'normal') {
            await spinDB.set(`spin_invites_${interaction.guild.id}`, invites);
            await interaction.reply({ 
                content: `✅ Required invites for **normal spin** set to: ${invites}`, 
                ephemeral: true 
            });
        }

        if (subCommand === 'vip') {
            await spinDB.set(`vip_spin_invites_${interaction.guild.id}`, invites);
            await interaction.reply({ 
                content: `✅ Required invites for **VIP spin** set to: ${invites}`, 
                ephemeral: true 
            });
        }
    }
};
