# Retro Fallen Tale

UNDERTALE 10周年をモチーフにした、ブラウザで遊べる10連戦のレトロバトルゲームです。

## ゲーム進行

1. タイトル画面から最初の道へ進む
2. 道の右端から10ステージの連続バトルに挑戦
3. 通常ステージでは敵ごとに攻撃速度とHPが変化
4. 最終ステージでは青いハートと骨攻撃を使うサンズ戦が開始

## ファイル構成

```text
index.html
game.js
style.css
assets/
  title.png
  hero.png
  hero-lying.png
  flowey.png
  ruins.png
  flowers.png
```

## 操作

- 方向キー: 移動・選択・攻撃回避
- Enter / Z: 決定・攻撃
- X / Escape: 戻る

戦闘曲はSpotifyの公式埋め込みを使用します。通常戦はToby Foxの楽曲からランダム選曲され、最終戦では「MEGALOVANIA」がループ再生されます。ブラウザの自動再生制限により、最初のキー入力後に再生が始まります。
