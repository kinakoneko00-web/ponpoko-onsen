// `npx cap add android` で作られた android/ に、広告・縦向き・バージョン・署名の設定を入れる（何度実行しても同じ結果になる）
const fs = require('fs'), path = require('path');
const A = path.join(__dirname, '..', 'android', 'app');
const env = process.env;
const appId = env.ADMOB_APP_ID || 'ca-app-pub-3940256099942544~3347511713'; // 未設定ならGoogleのテスト用アプリID

// AndroidManifest.xml：AdMobのアプリID、縦向き固定
const mf = path.join(A, 'src', 'main', 'AndroidManifest.xml');
let m = fs.readFileSync(mf, 'utf8');
if (!m.includes('com.google.android.gms.ads.APPLICATION_ID'))
  m = m.replace('</application>', '        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="@string/admob_app_id" />\n    </application>');
if (!m.includes('android:screenOrientation'))
  m = m.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:screenOrientation="portrait"');
fs.writeFileSync(mf, m);

// strings.xml：AdMobのアプリID
const sf = path.join(A, 'src', 'main', 'res', 'values', 'strings.xml');
let s = fs.readFileSync(sf, 'utf8');
s = s.replace(/\s*<string name="admob_app_id">[^<]*<\/string>/, '');
s = s.replace('</resources>', `    <string name="admob_app_id">${appId}</string>\n</resources>`);
fs.writeFileSync(sf, s);

// build.gradle：バージョン番号と、署名の鍵（KEYSTORE_FILE があるときだけ）
const gf = path.join(A, 'build.gradle');
let g = fs.readFileSync(gf, 'utf8');
g = g.replace(/versionCode \d+/, `versionCode ${parseInt(env.VERSION_CODE || '1', 10)}`)
     .replace(/versionName "[^"]*"/, `versionName "${env.VERSION_NAME || '1.0'}"`);
if (env.KEYSTORE_FILE && !g.includes('signingConfigs {')) {
  g = g.replace(/\n(\s*)buildTypes \{/, `\n$1signingConfigs {\n$1    release {\n$1        storeFile file(System.getenv("KEYSTORE_FILE"))\n$1        storePassword System.getenv("KEYSTORE_PASSWORD")\n$1        keyAlias System.getenv("KEY_ALIAS")\n$1        keyPassword System.getenv("KEY_PASSWORD")\n$1    }\n$1}\n$1buildTypes {`);
  g = g.replace(/release \{\n(\s*)minifyEnabled/, 'release {\n$1signingConfig signingConfigs.release\n$1minifyEnabled');
}
fs.writeFileSync(gf, g);
console.log('android patched: admob', appId.startsWith('ca-app-pub-3940256099942544') ? '(テスト用)' : '(本番)', 'version', env.VERSION_CODE || 1, env.KEYSTORE_FILE ? '署名あり' : '署名なし');
