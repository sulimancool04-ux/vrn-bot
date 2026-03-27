const express = require('express');
const { Bot } = require('grammy');
const app = express();
app.use(express.json());

const TOKEN = '8686893037:AAF63iFUhicT13-aNnSbskvWp6_MrVBzJjc';
const WEBAPP_URL = 'https://testik-gamma.vercel.app';

const bot = new Bot(TOKEN);

bot.command('start', async (ctx) => {
  const keyboard = {
    inline_keyboard: [[{ text: '📱 Открыть VRN', web_app: { url: WEBAPP_URL } }]]
  };
  await ctx.reply(`Привет, ${ctx.from.first_name}! 👋\n\nVRN - лента новостей Воронежа.\n\nНажми кнопку ниже, чтобы открыть приложение.`, { reply_markup: keyboard });
});

bot.command('help', async (ctx) => {
  await ctx.reply('📌 /start - Главное меню');
});

bot.on('message', async (ctx) => {
  await ctx.reply('Напиши /start для начала!');
});

app.post('/webhook', async (req, res) => {
  await bot.handleUpdate(req.body);
  res.ok();
});

app.get('/', (req, res) => {
  res.send('VRN Bot running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot running on port ${PORT}`);
});
