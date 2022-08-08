# Serverless AppSync 構築サンプル

## 環境

- node 16.15.1 (via nodenv)
- serverless
- その他、各種プラグインの依存ライブラリ

## setup

```shell
# 依存ライブラリのインストール

npm i 

# dynamodb localのセットアップ
npx sls dynamodb install
```

## 起動方法

```shell
# local
sls offline start --stage local

# deploy
sls deploy --stage dev
```

## 構成

## TODO

- [ ] テストの追加→参考資料1
- [ ] 本番デプロイ用アカウントの分離→参考資料1
- [ ] ddbの名前をすべて `Resources` からの参照にする
- [ ] Lambda Resolver の追加
- [ ] 長くなったservereless.tsの分割
- [ ] serverless template 化
- [x] lambda functionを利用しない場合、消す

## 参考資料

1. [Effective AppSync 〜 Serverless Framework を使用した AppSync の実践的な開発方法とテスト戦略 〜](https://qiita.com/G-awa/items/095faa9a94da09bc3ed5)
2. [serverless-appsync-plugin example](https://github.com/sid88in/serverless-appsync-plugin/tree/master/example)
3. [Serverless Framework + TypeScriptでAppSync環境を構築する](https://zenn.dev/merutin/articles/e1de2cbe575b13)

