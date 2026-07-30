# tools

## og-image.html

`public/og.jpg`（OGP / Twitter カード用 1200×630 画像）の元データ。
文言や色を変えたいときはこのファイルを編集して、以下で再生成する。

```bash
npm run dev
```

別のターミナルで:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --disable-gpu --force-device-scale-factor=1 --virtual-time-budget=8000 --screenshot=/tmp/og.png --window-size=1200,630 "http://localhost:3000/../tools/og-image.html"
```

`/hero.png` を読み込むため、dev サーバー配下から開くか、ローカルの絶対パスに書き換えて開く。
最後に JPEG へ変換して差し替える。

```bash
sips -s format jpeg -s formatOptions 92 /tmp/og.png --out public/og.jpg
```
