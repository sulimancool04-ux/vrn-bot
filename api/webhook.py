from flask import Flask, request, jsonify
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

app = Flask(__name__)

TOKEN = '8686893037:AAF63iFUhicT13-aNnSbskvWp6_MrVBzJjc'
WEBAPP_URL = 'https://testik-gamma.vercel.app'

application = Application.builder().token(TOKEN).build()

def get_keyboard():
    keyboard = [
        [InlineKeyboardButton("📱 Открыть VRN", web_app=WebAppInfo(url=WEBAPP_URL))]
    ]
    return InlineKeyboardMarkup(keyboard)

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    welcome_text = f"""Привет, {user.first_name}! 👋

VRN - лента новостей Воронежа.

Нажми кнопку ниже, чтобы открыть приложение."""
    await update.message.reply_text(welcome_text, reply_markup=get_keyboard())

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("📌 /start - Главное меню")

application.add_handler(CommandHandler("start", start_command))
application.add_handler(CommandHandler("help", help_command))

@app.route('/api/webhook', methods=['POST'])
def webhook():
    import json
    update = Update.de_json(request.get_data(as_text=True), application.bot)
    application.run_async(application.process_update(update))
    return jsonify({'ok': True})

@app.route('/')
def index():
    return 'VRN Bot Webhook!'

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})
