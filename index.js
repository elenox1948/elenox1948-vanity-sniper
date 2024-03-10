import chalk from "chalk";
import webhooks from "./helpers/webhooks.js";
import WebSocket from "ws";
import cfonts from "cfonts";
import functions from "./helpers/functions.js";
import config from "./helpers/config.js";

const guilds = {};
const statusCodes = {
  400: "URL GITTI ALLAHİNİ SIKIM",
  429: "Rate YEDIK.",
  403: "Yetki Yok.",
  401: "Yetki Yok.",
};

const info = (str) =>
  console.log(`${chalk.hex("#31c4ww")("[Sniper]")} ${chalk.hex("#fff")(str)}`);
const error = (str) =>
  console.log(`${chalk.hex(`#f00a0d`)("[WRONG]")} ${chalk.hex("#fff")(str)}`);

cfonts.say("1948", {
  font: "simple3d",
  align: "center",
  colors: ["green", "blue", "red"],
  background: "transparent",
  letterSpacing: 1,
  lineHeight: 1,
  space: true,
  maxLength: "15",
  gradient: true,
  independentGradient: true,
  transitionGradient: true,
});

cfonts.say(
  "Sniper Bilgilendirmeyi Webhook'unuza Yaptı ",
  {
    font: "console",
    align: "center",
    colors: ["#efcd8d"],
  }
);

const ws = new WebSocket(`wss://gateway-us-east1-b.discord.gg`);

ws.on("open", () => {
  info("Sniper is Starting");

  ws.on("message", async (message) => {
    const startTime = new Date().getTime();
    const { d, op, t } = JSON.parse(message);

    if (t === "GUILD_UPDATE") {
      const getGuild = guilds[d.guild_id];
      if (typeof getGuild === "string" && getGuild !== d.vanity_url_code) {
        try {
          await functions.snipeVanityUrl(getGuild);
          const endTime = new Date().getTime();
          const timeTaken = endTime - startTime;
          await webhooks.success(`@everyone https://discord.gg/${getGuild} KAPTIK URLYI AMUNA GOYIMM ALLAHINI`);
          delete guilds[d.guild_id];
        } catch (err) {
          await handleError(err, getGuild, d.guild_id);
        }
      }
    } else if (t === "GUILD_DELETE") {
      const getGuild = guilds[d.id];
      if (getGuild) {
        try {
          await functions.snipeVanityUrl(getGuild);
          await webhooks.success(`@everyone https://discord.gg/${getGuild} SWDEN BANLADILAR OCLAR BASKA SELFLE GIR HEPSINI SIKECEZ`);
          delete guilds[d.id];
        } catch (err) {
          await handleError(err, getGuild, d.id);
        }
      }
    } else if (t === "READY") {
      const readyStartTime = new Date().getTime();
      info("Sniper Active");
      d.guilds
        .filter((e) => e.vanity_url_code)
        .forEach((guild) => (guilds[guild.id] = guild.vanity_url_code));
      const vanityUrls = d.guilds
        .filter((e) => e.vanity_url_code)
        .map((guild) => guild.vanity_url_code)
        .join(", ");
      const readyEndTime = new Date().getTime();
      const urlCount = d.guilds.filter((e) => e.vanity_url_code).length;
      await webhooks.info(`CREATED BY ELENOX1948 SNIPER CALOSIYOR SANALIN BABASI BIZIK ULAN: ${urlCount} URL\n\`\`\`fix\n${vanityUrls}\n\`\`\``);
    }

    if (op === 10) {
      ws.send(
        JSON.stringify({
          op: 2,
          d: {
            token: config.listenerToken,
            intents: 1,
            properties: {
              os: "linux",
              browser: "firefox",
              device: "firefox",
            },
          },
        })
      );
      setInterval(
        () =>
          ws.send(JSON.stringify({ op: 1, d: {}, s: null, t: "heartbeat" })),
        d.heartbeat_interval
      );
    } else if (op === 7) {
      info("Restarting.");
      process.exit();
    }
  });

  ws.on("close", (code) => {
    if (code === 4004) {
      error("TOKENLER YANLIS OCC");
    }
    process.exit();
  });
});
