const { Telegram, Keyboard } = require('telegraf');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8686893037:AAF63iFUhicT13-aNnSbskvWp6_MrVBzJjc';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://testik-gamma.vercel.app';

module.exports = async (req, res) => {
  if (req.path === '/api/health' || req.query.health) {
    return res.status(200).send('OK');
  }

  if (req.method === 'POST') {
    try {
      const { Telegram } = require('telegraf');
      const Telegram = require('telegraf').Telegram;
      const tg = new Telegram(TOKEN);
      
      // Just acknowledge - full bot needs state
      console.log('Webhook received');
      
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error(e);
      return res.status(200).json({ ok: false, error: e.message });
    }
  }

  return res.status(200).send('VRN Bot!');
};
