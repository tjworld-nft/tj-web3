# tools

## OGP 画像（`public/og-dive-2026-09.jpg`）

実際のトップページ（夕方の空・水面で割れた見出し）をそのまま撮って作っている。

1. `npm run dev` で開発サーバーを立てる
2. ヘッドレス Chrome（GPU を有効にして）で 1200×630・倍率2で撮る
   URL: `http://localhost:3000/?time=golden&og`
   - `?time=golden` … 空を夕方に固定（`day` / `night` / `live` もある）
   - `?og` … 上のバー・計器・スクロール案内を消す
3. 1200×630 に縮小し、右上に「TJ ─ 吉田 哲司」「www.tj-web3.com」を載せる（ヒラギノ明朝 W6・Menlo）
4. **ファイル名は日付入りで新しく作る**（同じ名前のまま中身を替えると、SNS側のキャッシュで古い画像が出続ける）。
   `app/layout.tsx` の `openGraph.images` と `twitter.images` を新しい名前に替える。

## 確認用の URL パラメーター

- `?time=day|golden|night|live` … 空の時間帯（既定は三浦の今の時刻）
- `?og` … 撮影用に計器などを隠す
