web-rtc-lab
===

ブラウザでカメラの起動・映像の共有・撮影を試す実験ページ。

- Docker: 対応!
- Node.js: 24! (lint とテスト用。 Volta で 24.22.0 に固定)
- Linter: ESLint 10!
- Test: node:test (unit) + Playwright 1.64 (browser)!
- Bootstrap: 5.3 (CSS のみ、CDN + SRI)

## パッと実行してみたい

```bash
docker compose up --build web
# http://localhost:8080 を開く
```

ページのビルドは不要。
カメラの `getUserMedia` は secure context が必要 --> `localhost` か HTTPS で開く。

lint とテストも Docker で回せる。

```bash
docker compose run --rm --build check
```

## やってること

- JavaScript からカメラを起動する。
- その映像を、ブラウザの video タグに流す。
- iOS では video タグに `autoplay playsinline` が必要。 `autoplay` だけの video と並べて比べる。
- 映像から画像を撮影する。
- 画像を JPEG の data URL にする。

![readme](https://user-images.githubusercontent.com/28250432/99218604-419efb00-281e-11eb-93af-dadcf3bf0857.png)

## GitHub Pages

[実験ページを開く](https://yuu-eguci.github.io/web-rtc-lab/)

## ファイル構成

- `index.html`: 実験ページ。
- `src/camera.js`: カメラ操作のロジック (DOM に依存しないので unit test できる)。
- `src/main.js`: ボタンと `src/camera.js` をつなぐ。
- `src/style.css`: ページのスタイル。
- `test/`: `node:test` による unit test。
- `e2e/`: Playwright によるブラウザテスト。 Chromium の fake camera を使う。
- 古い実験ページ `index2.html` (autoplay muted の比較や width/height 指定の実験) は削除した。 git 履歴 (5332ea4 まで) に残っている。

## 開発

```bash
npm ci
npx playwright install chromium
npm run lint
npm test          # unit test
npm run test:e2e  # browser test (fake camera)
```

ブラウザテストは Chromium の fake camera を使う。
本物のカメラやスマートフォンでの動作は、実機で確認する。
