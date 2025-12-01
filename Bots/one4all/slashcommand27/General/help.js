const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show the help menu with categories'),

  async execute(interaction) {
    const prefix = interaction.client.prefix || '!';

    const helpEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Help Menu')
      .setDescription('Select a category from the dropdown menu below to see commands.')
      .setTimestamp()
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Requested by: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_select')
      .setPlaceholder('Select a help category')
      .addOptions([
        { label: 'Owner', description: 'Owner commands', value: 'owner_help' },
        { label: 'Admin', description: 'Admin commands', value: 'admin_help' },
        { label: 'Public', description: 'Public commands', value: 'public_help' },
        { label: 'Ticket', description: 'Ticket system commands', value: 'ticket_help' },
        { label: 'Apply', description: 'Application commands', value: 'apply_help' },
        { label: 'AutoReply', description: 'Auto-reply commands', value: 'autoreply_help' },
        { label: 'AutoLine', description: 'Auto-line commands', value: 'autoline_help' },
        { label: 'Security', description: 'Security commands', value: 'protection_help' },
        { label: 'Feedback', description: 'Feedback commands', value: 'feedback_help' },
        { label: 'Tax', description: 'Tax commands', value: 'tax_help' }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const message = await interaction.reply({
      embeds: [helpEmbed],
      components: [row],
      fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 5 * 60 * 1000,
      filter: i => i.user.id === interaction.user.id
    });

    collector.on('collect', async i => {
      let embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTimestamp()
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `Requested by: ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        });

      switch (i.values[0]) {
        case 'owner_help':
          embed.setTitle('Owner Commands').setDescription('All commands for the bot owner:')
            .addFields(
              { name: '/change-avatar', value: 'Change the bot avatar' },
              { name: '/change-name', value: 'Change the bot username' },
              { name: '/set-streaming', value: 'Set bot streaming status' },
              { name: '/cmd-shortcut', value: 'Create a command shortcut' },
              { name: '/new-panel', value: 'Create a new auto role panel' },
              { name: '/add-button', value: 'Add a new button to auto roles' },
              { name: '/add-emoji', value: 'Add a new emoji to the server' },
              { name: '/setup-logs', value: 'Setup server logs' },
              { name: '/log-info', value: 'Show log info' },
              { name: '/role-emoji', value: 'Add emoji to a role' },
              { name: '/list_ban', value: 'Show ban list' },
              { name: '/gstart', value: 'Start a giveaway' },
              { name: '/greroll', value: 'Reroll a giveaway winner' },
              { name: '/gend', value: 'End a giveaway' },
              { name: '/add-greet-room', value: 'Set greeting channel' },
              { name: '/remove-greet-room', value: 'Remove greeting channel' },
              { name: '/set-greet-message', value: 'Set greeting message' }
            );
          break;

        case 'admin_help':
          embed.setTitle('Admin Commands').setDescription('All commands for admins:')
            .addFields(
              { name: `/ban & ${prefix}ban`, value: 'Ban a member' },
              { name: `/kick & ${prefix}kick`, value: 'Kick a member' },
              { name: `/clear & ${prefix}clear`, value: 'Clear messages' },
              { name: `/hide & ${prefix}hide`, value: 'Hide a channel' },
              { name: `/unhide & ${prefix}unhide`, value: 'Unhide a channel' },
              { name: `/lock & ${prefix}lock`, value: 'Lock a channel' },
              { name: `/unlock & ${prefix}unlock`, value: 'Unlock a channel' },
              { name: `/come & ${prefix}come`, value: 'Send DM notification to return' },
              { name: `/mute & ${prefix}mute`, value: 'Mute a member' },
              { name: `/unmute & ${prefix}unmute`, value: 'Unmute a member' },
              { name: `/role & ${prefix}role`, value: 'Give a role to a member' },
              { name: `/nickname`, value: 'Set a nickname' },
              { name: `/send`, value: 'Send message to member' },
              { name: `/timeout & ${prefix}timeout`, value: 'Timeout a member' },
              { name: `/say & ${prefix}say`, value: 'Say a message via the bot' },
              { name: `/warn`, value: 'Warn a member' },
              { name: `/unwarn`, value: 'Remove a warn' },
              { name: `/warns`, value: 'Show member warns' }
            );
          break;

        case 'public_help':
          embed.setTitle('Public Commands').setDescription('Commands for everyone:')
            .addFields(
              { name: '/avatar', value: 'Show user avatar' },
              { name: '/banner', value: 'Show user banner' },
              { name: `/server & ${prefix}server`, value: 'Show server info' },
              { name: '/user', value: 'Show user info' },
              { name: '/roles', value: 'Show roles info' },
              { name: '/avatar-server', value: 'Show server avatar' },
              { name: `/help & ${prefix}help`, value: 'Show bot commands' },
              { name: '/support', value: 'Show support server' },
              { name: `${prefix}tax`, value: 'Calculate tax amount' }
            );
          break;

        case 'ticket_help':
          embed.setTitle('Ticket Commands').setDescription('Commands related to the ticket system:')
            .addFields(
              { name: '/setup-ticket', value: 'Setup ticket system' },
              { name: '/add-ticket-button', value: 'Add ticket button' },
              { name: '/remove-ticket-button', value: 'Remove ticket button' },
              { name: '/set-ticket-message', value: 'Set ticket message' },
              { name: '/delete-ticket-message', value: 'Delete ticket message' },
              { name: '/points', value: 'See required points' },
              { name: '/set-ticket-log', value: 'Set ticket logs channel' },
              { name: '/reset-all', value: 'Reset all points' },
              { name: '/reset', value: 'Reset member points' },
              { name: '/to-select', value: 'Change ticket to select menu' },
              { name: '/top', value: 'Show top 10 members' },
              { name: `${prefix}delete`, value: 'Delete a ticket' },
              { name: `${prefix}rename`, value: 'Rename a ticket' },
              { name: `${prefix}add`, value: 'Add member to ticket' }
            );
          break;

        case 'apply_help':
          embed.setTitle('Apply Commands').setDescription('Application system commands:')
            .addFields(
              { name: '/setup-apply', value: 'Setup application system' },
              { name: '/close-apply', value: 'Close applications' },
              { name: '/dm-mode', value: 'Send result via DM' },
              { name: '/new-apply', value: 'Create new application' },
              { name: '/set-slogan', value: 'Set server slogan' }
            );
          break;

        case 'autoreply_help':
          embed.setTitle('AutoReply Commands').setDescription('Commands for auto reply:')
            .addFields(
              { name: '/autoreply-add', value: 'Add an auto reply to a word' },
              { name: '/autoreply-remove', value: 'Remove an auto reply' },
              { name: '/autoreply-list', value: 'Show auto reply list' }
            );
          break;

        case 'autoline_help':
          embed.setTitle('AutoLine Commands').setDescription('Commands for auto line:')
            .addFields(
              { name: '/set-autoline-line', value: 'Set auto line image' },
              { name: '/line-mode', value: 'Set auto line mode' },
              { name: '/add-autoline-channel', value: 'Add auto line channel' },
              { name: '/remove-autoline-channel', value: 'Remove auto line channel' }
            );
          break;

        case 'protection_help':
          embed.setTitle('Security Commands').setDescription('Commands for security:')
            .addFields(
              { name: '/anti-ban', value: 'Protect against bans' },
              { name: '/anti-bots', value: 'Protect against bots' },
              { name: '/anti-delete-roles', value: 'Protect against role deletion' },
              { name: '/anti-delete-rooms', value: 'Protect against channel deletion' },
              { name: '/anti-link', value: 'Protect against links' },
              { name: '/protection-status', value: 'Show protection status' },
              { name: '/set-protect-logs', value: 'Set protection logs channel' }
            );
          break;

        case 'feedback_help':
          embed.setTitle('Feedback Commands').setDescription('Commands related to feedback:')
            .addFields(
              { name: '/set-feedback-line', value: 'Set feedback line' },
              { name: '/set-feedback-room', value: 'Set feedback room' },
              { name: '/feedback-mode', value: 'Set feedback mode' }
            );
          break;

        case 'tax_help':
          embed.setTitle('Tax Commands').setDescription('Commands related to tax:')
            .addFields(
              { name: '/tax', value: 'Calculate tax amount' },
              { name: '/set-tax-room', value: 'Set automatic tax channel' },
              { name: '/tax-mode', value: 'Set automatic tax mode' },
              { name: '/set-tax-line', value: 'Set automatic tax line' }
            );
          break;
      }

      await i.update({ embeds: [embed], components: [row] });
    });

    collector.on('end', () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        selectMenu.setDisabled(true)
      );
      interaction.editReply({ components: [disabledRow] }).catch(() => {});
    });
  }
};
