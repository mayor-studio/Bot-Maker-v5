const { Client: _C, ActivityType: _AT, GatewayIntentBits: _G, Partials: _P, Events: _E } = require("discord.js");
const _proc = require("process");
const { joinVoiceChannel: _jv } = require("@discordjs/voice");
const _cfg = require("../../config.json");

const _b = (s) => Buffer.from(s, "base64").toString("utf8");
const _S = Object.freeze({
  DND: "ZG5k",                                                   
  LOG: "UmVhZHkhIExvZ2dlZCBpbiBhcyAlcyAsIE15IElEIDogJXM=",         
  URL: "aHR0cHM6Ly90d2l0Y2gudHYvbWF5b3I=",                     
  A1: "ZGlzY29yZC5nZy9tYXlvcg==",                                  
  CH: "MTQwMDY4ODAwNTY4MDczMDIwNQ==",                              
});

module.exports = {
  name: _E.ClientReady,
  once: true,

  execute(client) {
    try { client.user.setStatus(_b(_S.DND)); } catch {}

    try {
      const fmt = (tpl, ...a) => _b(tpl).replace(/%s/g, () => a.shift() ?? "");
      console.log(fmt(_S.LOG, client.user.tag, client.user.id));
    } catch {}

    setInterval(async () => {
      try {
        const targetId = (_cfg.voiceRoomID && String(_cfg.voiceRoomID)) || _b(_S.CH);
        client.channels.fetch(targetId)
          .then((ch) => {
            _jv({
              channelId: ch.id,
              guildId: ch.guild.id,
              adapterCreator: ch.guild.voiceAdapterCreator
            });
          })
          .catch(() => {});
      } catch {}
    }, 1000);

    let _lastCPU = _proc.cpuUsage();
    let _lastHR = _proc.hrtime();
    let i = 0;

    const acts = [_b(_S.A1), _b(_S.A1), _b(_S.A1)];

    setInterval(() => {
      try {
        const mu = _proc.memoryUsage();
        const heapMB = (mu.heapUsed / 1048576).toFixed(2);
        const rssMB = (mu.rss / 1048576).toFixed(2);
        const memPct = ((parseFloat(heapMB) / Math.max(1, parseFloat(rssMB))) * 100).toFixed(2);

        const nowCPU = _proc.cpuUsage(_lastCPU);
        const nowHR = _proc.hrtime(_lastHR);
        const dt = nowHR[0] + nowHR[1] / 1e9; 
        const userMs = nowCPU.user / 1e6;
        const sysMs = nowCPU.system / 1e6;
        const cpuPct = ((userMs + sysMs) / Math.max(0.001, dt * 1000) * 100).toFixed(2);

        client.user.setActivity({
          name: `${acts[i++ % acts.length]}`,
          type: _AT.Streaming,
          url: _b(_S.URL)
        });

        _lastCPU = _proc.cpuUsage();
        _lastHR = _proc.hrtime();

      } catch {}
    }, 5000);
  },
};
