import { Telegraf } from "telegraf";
import fetch from "node-fetch";
import { BOT_TOKEN } from "./config.js";
import cron from "node-cron";

const myID = "467142836";
const cryptoAssets = ["BTC_USDT", "ETH_USDT", "KNG_USDT", "SOL_USDT"];

const bot = new Telegraf(BOT_TOKEN);
bot.start(async (ctx) => {
  await ctx.telegram.sendMessage(
    ctx.message.chat.id,
    `Hello this bot send Notification about some crypto price from \nhttps://trade.kanga.exchange/market/BTC-USDT \n\n@KangaNotifyBot`
  );
});

// get market data
// fetch data from kanga API
// https://apidoc.kanga.exchange/#get-/api/v2/market/depth
async function getMarketData(market) {
  const response = await fetch(
    `https://api.kanga.exchange/api/v2/market/changes?market=${market}`
  );
  const data = await response.json();
  return data;
}

// send notification to bot
// broadcast https://github.com/feathers-studio/telegraf-docs/blob/master/guide/broadcasting.md
async function sendPriceNotification(market) {
  const marketData = await getMarketData(market);
  console.log(marketData);
  const message =
    `${market}\n` +
    `Price: ${marketData.price} $\n` +
    `Volume 24h: ${marketData.volume24}\n` +
    `Min price: ${marketData.minPrice}\n` +
    `Max price: ${marketData.maxPrice}\n` +
    `\n@KangaNotifyBot`;

  await bot.telegram.sendMessage(myID, message);
}

// send notification every hour
const every1h = "0 * * * *";

// send notification every Tuesday at 9:00
const everyTue9am = "0 9 * * 2";

const sendNotification = () => {
  for (let asset of cryptoAssets) {
    sendPriceNotification(asset);
  }
};

cron.schedule(everyTue9am, sendNotification);
cron.schedule(every1h, sendNotification);

bot.command("price", sendNotification);

bot.launch();
console.log("Bot running...");

//  Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
