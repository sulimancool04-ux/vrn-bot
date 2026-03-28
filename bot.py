import os
from flask import Flask, request
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler

app = Flask(__name__)

TOKEN = '8686893037:AAF63iFUhicT13-aNnSbskvWp6_MrVBzJjc'
WEBAPP_URL = 'https://testik-gamma.vercel.app'

application = Application.builder().token(TOKEN).build()

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

application.add_handler(CommandHandler("start", start_command))
application.add_handler(CommandHandler("help", help_command))

@app.route('/webhook', methods=['POST'])
def webhook():
    update = Update.de_json(request.get_data(as_text=True), application.bot)
    application.process_update(update)
    return 'ok'

@app.route('/')
def index():
    return 'VRN Bot running!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8443)
