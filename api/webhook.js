module.exports = async (req, res) => {
  const TOKEN = '8686893037:AAF63iFUhicT13-aNnSbskvWp6_MrVBzJjc';
  const WEBAPP_URL = 'https://testik-gamma.vercel.app';

  if (req.method === 'GET') {
    return res.status(200).send('VRN Bot Webhook!');
  }

  if (req.method === 'POST') {
    try {
      const update = req.body;
      
      if (update.message) {
        const chat_id = update.message.chat.id;
        const text = update.message.text;
        
        if (text === '/start' || text === '/start@your_bot_username') {
          const keyboard = {
            inline_keyboard: [[{ text: '📱 Открыть VRN', web_app: { url: WEBAPP_URL } }]]
          };
          
          await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id,
              text: `Привет, ${update.message.from.first_name}! 👋\n\nVRN - лента новостей Воронежа.\n\nНажми кнопку ниже!`,
              reply_markup: keyboard
            })
          });
        } else if (text === '/help') {
          await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id,
              text: '📌 /start - Главное меню'
            })
          });
        }
      }
      
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(200).json({ ok: false, error: e.message });
    }
  }

  return res.status(200).send('VRN Bot!');
};
