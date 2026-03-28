const { Bot, Keyboard } = require('grammy');
const express = require('express');
const localtunnel = require('localtunnel');

const TOKEN = '8686893037:AAF63iFUhicT13-aNnSbskvWp6_MrVBzJjc';
const WEBAPP_URL = 'https://testik-gamma.vercel.app';

const bot = new Bot(TOKEN);
const app = express();
app.use(express.json());

bot.command('start', async (ctx) => {
  const keyboard = Keyboard.from({
    inline_keyboard: [[{ text: '📱 Открыть VRN', web_app: { url: WEBAPP_URL } }]]
  });
  await ctx.reply(`Привет, ${ctx.from.first_name}! 👋\n\nVRN - лента новостей Воронежа.\n\nНажми кнопку ниже!`, { reply_markup: keyboard });
});

bot.command('help', async (ctx) => {
  await ctx.reply('📌 /start - Главное меню');
});

app.post('/webhook', async (req, res) => {
  await bot.handleUpdate(req.body);
  res.send();
});

app.get('/', (req, res) => {
  res.send('VRN Bot!');
});

const PORT = 8443;

async function start() {
  // Start local server
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Create tunnel
    try {
      const tunnel = await localtunnel({ port: PORT, subdomain: 'vrn-bot' });
      console.log(`Tunnel URL: ${tunnel.url}`);
      
      // Set webhook
      const Telegram = require('grammy').Bot;
      const tg = new Bot(TOKEN);
      await tg.api.setWebhook(`${tunnel.url}/webhook`);
      console.log('Webhook set!');
    } catch (e) {
      console.log('Tunnel error:', e.message);
    }
  });
}

start();
