import discord
from discord.ext import commands, tasks
import random
import datetime
import asyncio

intents = discord.Intents.default()
intents.members = True
intents.dm_messages = True
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

GUILD_ID = 1409775039477190749  # サーバーIDに置き換えてください

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')
    daily_zannen.start()

@tasks.loop(minutes=1)
async def daily_zannen():
    now = datetime.datetime.now()
    # 午前9時ちょうどにだけ動作する
    if now.hour == 9 and now.minute == 0:
        guild = bot.get_guild(GUILD_ID)
        if guild is None:
            print("Guild not found.")
            return
        members = [m for m in guild.members if not m.bot]
        if not members:
            print("No non-bot members found.")
            return
        selected = random.choice(members)
        try:
            await selected.send("ZANNEN")
        except Exception as e:
            print(f"DM送信に失敗: {e}")
        try:
            await guild.kick(selected, reason="ZANNENイベント")
        except Exception as e:
            print(f"キックに失敗: {e}")

# Botトークンをセット
bot.run('MTQxMjQyNjQ1MDYxODk0MTQ2MQ.GbiVzp.vkLr5KJwo9ImhvnWEmwIDerB8j0p8DEjxOTKSw')

#GUILD_ID をあなたのディスコードサーバーIDに置き換えてください。
#bot.run('YOUR_BOT_TOKEN') の 'YOUR_BOT_TOKEN' をあなたのボットトークンに置き換えてください。
#このボットには「メンバーの管理」と「メンバーのキック」権限が必要です。
#ボットがサーバーに参加している状態で動作します。
#午前9時に毎日一度だけ実行されます（サーバーが動作している必要あり）。
#サーバーにボット以外のユーザーがいない場合、何もしません。
