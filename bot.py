import logging
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

TOKEN = '8686893037:AAF63iFUhicT13-aNnSbskvWp6_MrVBzJjc'
WEBAPP_URL = 'https://testik-gamma.vercel.app'

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_keyboard():
    keyboard = [
        [InlineKeyboardButton("📱 Открыть VRN", web_app=WebAppInfo(url=WEBAPP_URL))]
    ]
    return InlineKeyboardMarkup(keyboard)

async def start_command(update, context):
    user = update.effective_user
    welcome_text = f"""
Привет, {user.first_name}! 👋

VRN - это лента новостей и событий Воронежа.

Нажми на кнопку ниже, чтобы открыть приложение.
    """
    await update.message.reply_text(welcome_text, reply_markup=get_keyboard())

async def help_command(update, context):
    help_text = """
📌 Команды:
/start - Главное меню
/help - Помощь

📱 VRN - Воронеж в одном месте!
    """
    await update.message.reply_text(help_text)

def main():
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    
    logger.info("Bot started! Press Ctrl+C to stop.")
    app.run_polling()

if __name__ == '__main__':
    main()
