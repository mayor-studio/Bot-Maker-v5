const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
  ownersOnly: true,
  data: new SlashCommandBuilder()
    .setName("setup-logs")
    .setDescription("Setup the logging system")
    .addChannelOption((option) =>
      option
        .setName("messagedelete")
        .setDescription("Log channel for deleted messages")
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName("messageupdate")
        .setDescription("Log channel for edited messages")
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName("rolecreate").setDescription("Log channel for role creation").setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName("roledelete").setDescription("Log channel for role deletion").setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName("rolegive").setDescription("Log channel for role assignment").setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName("roleremove").setDescription("Log channel for role removal").setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName("channelcreate").setDescription("Log channel for channel creation").setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName("channeldelete").setDescription("Log channel for channel deletion").setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName("botadd").setDescription("Log channel for new bots joining").setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName("banadd").setDescription("Log channel for bans").setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName("bandelete").setDescription("Log channel for unbans").setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName("kickadd").setDescription("Log channel for kicks").setRequired(false)
    ),

  async execute(interaction) {
    const messagedelete = interaction.options.getChannel("messagedelete");
    const messageupdate = interaction.options.getChannel("messageupdate");
    const rolecreate = interaction.options.getChannel("rolecreate");
    const roledelete = interaction.options.getChannel("roledelete");
    const rolegive = interaction.options.getChannel("rolegive");
    const roleremove = interaction.options.getChannel("roleremove");
    const channelcreate = interaction.options.getChannel("channelcreate");
    const channeldelete = interaction.options.getChannel("channeldelete");
    const botadd = interaction.options.getChannel("botadd");
    const banadd = interaction.options.getChannel("banadd");
    const bandelete = interaction.options.getChannel("bandelete");
    const kickadd = interaction.options.getChannel("kickadd");

    if (messagedelete) await db.set(`log_messagedelete_${interaction.guild.id}`, messagedelete.id);
    if (messageupdate) await db.set(`log_messageupdate_${interaction.guild.id}`, messageupdate.id);
    if (rolecreate) await db.set(`log_rolecreate_${interaction.guild.id}`, rolecreate.id);
    if (roledelete) await db.set(`log_roledelete_${interaction.guild.id}`, roledelete.id);
    if (rolegive) await db.set(`log_rolegive_${interaction.guild.id}`, rolegive.id);
    if (roleremove) await db.set(`log_roleremove_${interaction.guild.id}`, roleremove.id);
    if (channelcreate) await db.set(`log_channelcreate_${interaction.guild.id}`, channelcreate.id);
    if (channeldelete) await db.set(`log_channeldelete_${interaction.guild.id}`, channeldelete.id);
    if (botadd) await db.set(`log_botadd_${interaction.guild.id}`, botadd.id);
    if (banadd) await db.set(`log_banadd_${interaction.guild.id}`, banadd.id);
    if (bandelete) await db.set(`log_bandelete_${interaction.guild.id}`, bandelete.id);
    if (kickadd) await db.set(`log_kickadd_${interaction.guild.id}`, kickadd.id);

    return interaction.reply({ content: "**Settings have been configured successfully!**" });
  },
};
