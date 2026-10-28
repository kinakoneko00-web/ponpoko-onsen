// ゲーム本体（../index.html）と曲を、アプリに入れる www/ にまとめる。
// 広告ID（ADMOB_REWARDED_ID / ADMOB_INTERSTITIAL_ID）が環境変数にあれば差しこむ。なければGoogleのテスト用広告のまま。
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..'), www = path.join(__dirname, '..', 'www');
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });
let h = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
// アプリではシステムバーの内側に表示する（viewport-fit=contain）
h = h.replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=contain">');
const put = (key, val) => { if (val) h = h.split(key).join(val); };
put('__ADMOB_REWARDED_ID__', process.env.ADMOB_REWARDED_ID);
put('__ADMOB_INTERSTITIAL_ID__', process.env.ADMOB_INTERSTITIAL_ID);
fs.writeFileSync(path.join(www, 'index.html'), h);
fs.cpSync(path.join(root, 'bgm'), path.join(www, 'bgm'), { recursive: true });
for (const f of ['manifest.webmanifest', 'icon-192.png', 'icon-512.png']) if (fs.existsSync(path.join(root, f))) fs.copyFileSync(path.join(root, f), path.join(www, f));
console.log('www ready', process.env.ADMOB_REWARDED_ID ? '(本番の広告ID)' : '(テスト用の広告)');
