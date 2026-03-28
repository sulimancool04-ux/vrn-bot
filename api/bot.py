import os
import json
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler

TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '8686893037:AAF63iFUhicT13-aNnSbskvWp6_MrVBzJjc')
WEBAPP_URL = os.environ.get('WEBAPP_URL', 'https://testik-gamma.vercel.app')

application = None

def get_app():
    global application
    if application is None:
        application = Application.builder().token(TOKEN).build()
        application.add_handler(CommandHandler("start", start_command))
        application.add_handler(CommandHandler("help", help_command))
    return application

def get_keyboard():
    keyboard = [
        [InlineKeyboardButton("📱 Открыть VRN", web_app=WebAppInfo(url=WEBAPP_URL))]
    ]
    return InlineKeyboardMarkup(keyboard)

async def start_command(update, context):
    user = update.effective_user
    welcome_text = f"""Привет, {user.first_name}! 👋

VRN - лента новостей Воронежа.

Нажми кнопку ниже, чтобы открыть приложение."""
    await update.message.reply_text(welcome_text, reply_markup=get_keyboard())

async def help_command(update, context):
    await update.message.reply_text("📌 /start - Главное меню")

def handler(event, context):
    from telegram import Update
    
    if event.get('path') == '/api/health':
        return {'statusCode': 200, 'body': 'OK'}
    
    if event.get('httpMethod') == 'POST':
        try:
            body = event.get('body', '')
            if isinstance(body, str):
                body = body.encode('utf-8')
            
            app = get_app()
            update = Update.de_json(json.loads(body.decode('utf-8')), app.bot)
            
            # Sync run async function
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                loop.run_until_complete(app.process_update(update))
            finally:
                loop.close()
            
            return {'statusCode': 200, 'body': 'OK'}
        except Exception as e:
            return {'statusCode': 200, 'body': str(e)}
    
    return {'statusCode': 200, 'body': 'VRN Bot!'}
