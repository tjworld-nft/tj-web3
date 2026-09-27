# www.tj-web3.com — TJ（吉田哲司）のポートフォリオ

**「海にも、AIにも、深く潜る。」** ページ全体を一本のダイビングとして作っている。
スクロールすると水面から潜り、40m（レクリエーショナルダイビングの限界水深）を越えると
AIの世界「言葉の海」に入る。Next.js 16（App Router・静的出力）＋ Vercel。

```bash
npm run dev      # http://localhost:3000
npm run build
```

手元のビルド出力は `.next.nosync/`（`~/Documents` の iCloud 同期で `.next` が複製され、古いCSSが出続ける事故があったため）。Vercel では従来どおり `.next`。

## 中身を直すとき

- **文章・実績・リンク・著書はすべて `app/content.ts`**。数字は確認できたものだけ（ファイル冒頭に出典）。
- AI向けの案内は `public/llms.txt`（料金は載せない）。作品や数字を変えたらここも。
- 見出しの明朝は「使う字だけ」の woff2（`public/fonts/`）。**見出しに新しい漢字を足したら**
  `tools/mincho-chars.txt` に足して `python3 tools/subset-mincho.py <元のTTF>` で作り直す（手順は `tools/README.md`）。
  足し忘れても、端末の明朝で表示されるだけで崩れない。
- OGP画像の作り方も `tools/README.md`。

## 仕組み

| 場所 | 役割 |
|---|---|
| `app/components/dive/diveState.ts` | スクロール位置 → 水深。HTMLの `data-depth="12"` の目印を線形につなぐ |
| `app/components/dive/ocean.ts` | 相模湾の水温の平年値（気象庁）・NDL（PADI RDP）・気圧・光の減衰・水の区分 |
| `app/components/dive/sky.ts` | 三浦（城ヶ島）の太陽高度・方位と月齢。空の色が今の時刻になる |
| `app/components/dive/engine/` | 背景の WebGL2 エンジン（3Dライブラリなし）。空・水面・水中・ハロクライン・深海、波の計算、マリンスノー→言葉のプランクトン、魚群、泡、言葉のクラゲ |
| `app/components/dive/DiveWorld.tsx` | 入力を集めて状態を更新し、エンジンを起動（読み込み後・並列シェーダーコンパイル）。GPUがなければCSSの海 |
| `DiveComputer.tsx` / `DepthRail.tsx` / `TopBar.tsx` | 計器（水深・時間・NDL・水温・気圧・光・浮上速度）、右の水深ナビ、上のバー |
| `Ascend.tsx` / `DiveLog.tsx` / `audio.ts` | 安全停止つきの浮上、あなたのダイブログ画像、海の音（初期オフ） |
| `app/components/sections/` | 各セクション（水面・潜る人・三浦の海・40m・言葉の海・深海の書庫・最深部） |

確認用のURLパラメーター: `?time=day|golden|night|live`（空の時間帯）、`?og`（撮影用に計器を隠す）。
開発時はコンソールで `__dive`（状態）と `__diveEngine.stats()`（fps など）を見られる。

`/studio`（Sanity Studio）は残してあるが、トップページはもう Sanity を読まない（内容は `app/content.ts`）。
