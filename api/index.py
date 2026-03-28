import json
import os

def handler(req, res):
    from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
    from telegram.ext import Application, CommandHandler
    
    TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '8686893037:AAF63iFUhicT13-aNnSbskvWp6_MrVBzJjc')
    WEBAPP_URL = os.environ.get('WEBAPP_URL', 'https://testik-gamma.vercel.app')
    
    if req.path == '/api/health' or req.query.get('health'):
        return res.send('OK')
    
    if req.method == 'POST':
        try:
            body = req.body
            if isinstance(body, str):
                body = body.encode('utf-8')
            
            # Simple webhook without full bot initialization
            return res.send('OK')
        except Exception as e:
            return res.send(str(e))
    
    return res.send('VRN Bot!')
