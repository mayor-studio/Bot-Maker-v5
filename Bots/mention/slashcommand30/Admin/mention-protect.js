const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Database } = require('st.db');
const mentionProtectDB = new Database('/Json-db/Bots/mentionProtectDB.json');

// Simple time string to seconds parser (e.g., "10s", "1m", "2h", "2d")
function parseTimeString(str) {
  const regex = /^(\d+)(s|m|h|d)$/i;
  const match = str.match(regex);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mention-protect')
    .setDescription('Protect a member from mentions or remove protection.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Protect a member from mentions with a timeout for offenders.')
        .addUserOption(opt => opt.setName('member').setDescription('The member to protect').setRequired(true))
        .addStringOption(opt =>
          opt.setName('timeout')
            .setDescription('Timeout duration (e.g., 10s, 1m, 2h, 2d)')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove mention protection from a member.')
        .addUserOption(opt => opt.setName('member').setDescription('The member to remove protection from').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all members protected from mentions.')
    ),
  ownersOnly: false,
  adminsonly: true,
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'add') {
      const member = interaction.options.getUser('member');
      const timeoutStr = interaction.options.getString('timeout');
      const timeout = parseTimeString(timeoutStr);

      if (!timeout || timeout < 1 || timeout > 2419200) { // 28 days max
        return interaction.reply({ content: '❌ Invalid timeout format. Use formats like `10s`, `1m`, `2h`, or `2d` (max 28 days).', ephemeral: true });
      }

      let guildProtect = mentionProtectDB.get(guildId) || {};
      guildProtect[member.id] = timeout;
      mentionProtectDB.set(guildId, guildProtect);

      return interaction.reply({ content: `✅ ${member} is now protected from mentions. Offenders will get a timeout of ${timeoutStr}.`, ephemeral: true });
    }

    if (sub === 'remove') {
      const member = interaction.options.getUser('member');
      let guildProtect = mentionProtectDB.get(guildId) || {};
      if (guildProtect[member.id]) {
        delete guildProtect[member.id];
        mentionProtectDB.set(guildId, guildProtect);
        return interaction.reply({ content: `✅ Removed mention protection from ${member}.`, ephemeral: true });
      } else {
        return interaction.reply({ content: `❌ ${member} is not protected from mentions.`, ephemeral: true });
      }
    }

    if (sub === 'list') {
      let guildProtect = mentionProtectDB.get(guildId) || {};
      const entries = Object.keys(guildProtect);
      if (!entries.length) return interaction.reply({ content: 'No members are protected from mentions.', ephemeral: true });

      const lines = entries.map(uid => `<@${uid}> - Timeout: ${guildProtect[uid]} seconds`);
      return interaction.reply({ content: `**Members protected from mentions:**\n${lines.join('\n')}`, ephemeral: true });
    }
  }
};
