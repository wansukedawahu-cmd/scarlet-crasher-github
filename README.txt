# scarlet-crasher-github
this is my discord bot
このボットは私のサーバーで動作させる目的で制作されます。私的な制作であり私的な使用を想定しています。

/hi … 「hi」と返信
/randomkick … 設定したロールからランダムにキック
/rollset … 対象ロールを設定
/everydayrandomkickon … 毎日18時にランダムキック機能を有効化
/everydayrandomkickoff … 毎日18時にランダムキック機能を無効化
注意：

Discord.js v14（最新）を想定
環境変数 TOKEN にBotのトークン
環境変数 GUILD_ID に対象ギルドID
ロール設定はメモリ保持（永続化する場合はDB等が必要）

メモリ上でロールID/有効フラグを管理
/rollsetでロールを指定
/randomkickでランダムキック
/everydayrandomkickon/offで自動キック有効化・無効化
毎日18時に自動実行（cron）