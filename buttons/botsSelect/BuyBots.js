const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require("discord.js");
const { mainguild } = require('../../config.json');
const { Database } = require("st.db");
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const prices = new Database("/database/settingsdata/prices");
const statuses = new Database("/database/settingsdata/statuses");
const tokenDB = new Database("/Json-db/Others/TokensDB.json");
const buyStatusDB = new Database("Json-db/Others/buyStatus");
const tier3subscriptions = new Database("/database/makers/tier3/subscriptions");
const tier2subscriptions = new Database("/database/makers/tier2/subscriptions");

module.exports = {
    name: Events.InteractionCreate,
    /**
     * @param {Interaction} interaction
     */
    async execute(interaction) {
        if (interaction.customId === "select_buy") {
            const theBotMember = interaction.guild.members.cache.get(interaction.client.user.id);
            const botRole = theBotMember.displayHexColor || "Random";

            if (interaction.values[0] === "selectBuyBot") {
                await interaction.deferReply({ ephemeral: true });
                let embed = new EmbedBuilder()
                    .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                    .setTitle(`**Buy Bot Panel**`)
                    .setColor(botRole)
                    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`**You can buy a bot by selecting one from the menu below**`)
                    .setTimestamp();

                const select = new StringSelectMenuBuilder()
                    .setCustomId('select_bot')
                    .setPlaceholder('General Bots')
                    .addOptions(
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Apply Bot').setDescription('Submissions bot').setValue('BuyApply'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('AutoLine Bot').setDescription('Automatic line bot').setValue('BuyAutoline'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('MultiCast Bot').setDescription('Broadcast bot controller').setValue('BuyBroadcast'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Feedback Bot').setDescription('Feedback and ratings bot').setValue('BuyFeedback'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🕋`).setLabel('Azkar Bot').setDescription('Islamic reminders bot').setValue('BuyAzkar'),
                        
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Tax Bot').setDescription('Tax bot (ProBot & PayPal)').setValue('BuyTax'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Broadcast Bot').setDescription('Regular broadcast bot (can get banned)').setValue('BuyNormalBroadcast'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Giveaway Bot').setDescription('Giveaway bot (works on all servers)').setValue('BuyGiveaway'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Logs Bot').setDescription('Server logs bot').setValue('BuyLogs'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Security Bot').setDescription('Anti-raid server security bot').setValue('BuyProtect'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Suggestions Bot').setDescription('Suggestions bot').setValue('BuySuggestions'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('System Bot').setDescription('System bot').setValue('BuySystem'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Ticket Bot').setDescription('Ticket bot with buttons & select menus').setValue('BuyTicket'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('All in one Bot').setDescription('All-in-one bot (includes some maker bots)').setValue('BuyOne4all')
                    );

                const row = new ActionRowBuilder().addComponents(select);

                const select2 = new StringSelectMenuBuilder()
                    .setCustomId('select_bot2')
                    .setPlaceholder('Shop Bots')
                    .addOptions(
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Stock Bot').setDescription('Auto product selling bot').setValue('BuyShop'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Offers Bot').setDescription('Turns messages into offers').setValue('BuyOffers')
                    );

                const row2 = new ActionRowBuilder().addComponents(select2);

                const select3 = new StringSelectMenuBuilder()
                    .setCustomId('select_bot3')
                    .setPlaceholder('Server Management')
                    .addOptions(
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Temp Voice Bot').setDescription('Temporary voice control bot').setValue('BuyTempvoice'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Prison Bot').setDescription('Prison system bot').setValue('BuyPrivateRooms'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Spin Bot').setDescription('Wheel of fortune invite bot').setValue('BuySpin'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Feelings Bot').setDescription('Quotes/thoughts bot').setValue('BuyFeelings'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Games Bot').setDescription('Games bot').setValue('BuyGames'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Invites Bot').setDescription('Invite tracker bot').setValue('BuyInvites'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Colors Bot').setDescription('Color roles bot').setValue('BuyColor'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Nadeko Bot').setDescription('Nadeko-like bot').setValue('BuyNadeko'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Warns Bot').setDescription('Warnings bot').setValue('BuyWarns'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Emojis Bot').setDescription('Auto emoji adder in specific channel').setValue('BuyEmoji'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Twitter Bot').setDescription('Twitter bot').setValue('BuyTwitter'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Mention Bot').setDescription('Protect a member from Mention').setValue('BuyMention'),
                        new StringSelectMenuOptionBuilder().setEmoji(`🤖`).setLabel('Verify Bot').setDescription('Verification role on emoji click').setValue('BuyVerify')
                    );

                const row3 = new ActionRowBuilder().addComponents(select3);

                await interaction.editReply({ embeds: [embed], components: [row, row2, row3], ephemeral: true });

                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        return;
                    }
                }, 20_000);
            }
        }
    }
};
