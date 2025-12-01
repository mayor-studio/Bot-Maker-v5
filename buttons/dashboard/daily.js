const { Interaction, EmbedBuilder, Events } = require("discord.js");
const { Database } = require("st.db");
const usersdata = new Database(`/database/usersdata/usersdata`);
const freeCooldownsDB = new Database(`/Json-db/Others/daily`);

module.exports = {
    name: Events.InteractionCreate,
    /**
     * @param {Interaction} interaction
     */
    async execute(interaction) {
        if (interaction.isButton() && interaction.customId === 'dailymship') {
            const cooldownTimestamp = await freeCooldownsDB.get(`cooldown_${interaction.user.id}_${interaction.guild.id}`);
            const currentTime = Date.now();
            const cooldownDuration = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

            if (cooldownTimestamp && (currentTime - cooldownTimestamp) < cooldownDuration) {
                return interaction.reply({ content: `**يمكنك استخدام الزر مرة كل 24 ساعة فقط**`, ephemeral: true });
            } else {
                let userbalance = await usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`) ?? 0;

                // Define the roles and their respective coin rewards
                const rolesRewards = [
                    { id: '1378799129446056067', coins: 10 },
                    { id: '1391496484586782821', coins: 20 },
                    { id: '1391506214919077970', coins: 30 }
                ];

                // Check the highest role the user has and assign the respective coins
                let coinsToAdd = 0;
                for (const roleReward of rolesRewards) {
                    if (interaction.member.roles.cache.has(roleReward.id)) {
                        coinsToAdd = Math.max(coinsToAdd, roleReward.coins);
                    }
                }

                if (coinsToAdd === 0) {
                    return interaction.reply({ content: `**يجب أن تمتلك عضوية .**`, ephemeral: true });
                }

                let newUserBalance = parseInt(userbalance) + coinsToAdd;
                await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}`, newUserBalance);
                await freeCooldownsDB.set(`cooldown_${interaction.user.id}_${interaction.guild.id}`, currentTime);

                const embed = new EmbedBuilder()
                    .setTitle(`**تم الحصول على ${coinsToAdd} كوينز**`)
                    .setDescription(`**رصيدك الحالي هو : \`${newUserBalance}\`**`)
                    .setTimestamp();

                return interaction.reply({ content: `<@${interaction.user.id}>`, embeds: [embed], ephemeral: true });
            }
        }
    }
};
