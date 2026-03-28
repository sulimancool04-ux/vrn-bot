/**
 * Cloudflare Workers Telegram Bot
 */

export default {
  async fetch(request, env) {
    const TOKEN = '8686893037:AAF63iFUhicT13-aNnSbskvWp6_MrVBzJjc';
    const WEBAPP_URL = 'https://testik-gamma.vercel.app';

    if (request.url.includes('/health')) {
      return new Response('OK', { status: 200 });
    }

    if (request.method === 'POST') {
      try {
        const update = await request.json();
        
        if (update.message) {
          const chat_id = update.message.chat.id;
          const text = update.message.text;
          
          if (text === '/start') {
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
        
        return new Response('OK', { status: 200 });
      } catch (e) {
        return new Response('Error: ' + e.message, { status: 200 });
      }
    }

    return new Response('VRN Bot!', { status: 200 });
  }
};
