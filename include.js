function loadComponent(id, file) {
    fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading component:', error);
        });
}

document.addEventListener("DOMContentLoaded", function() {
    // 動画要素を取得
    const video = document.querySelector('.hero-video');
    
    if(video) {
        // 動画の再生が終了したタイミングで実行
        video.addEventListener('ended', function() {
            // 'fade-out' クラスを追加してCSSアニメーションを開始
            video.classList.add('fade-out');
            
            // 【オプション】
            // 完全に消えた後（2秒後）に動画を停止してメモリを節約する場合
            setTimeout(() => { video.pause(); }, 2000); 
        });
    }
});

// --- ハンバーガーメニューの開閉処理 ---
document.addEventListener('click', function(e) {
    // クリックされたのが「.hamburger」またはその中身なら実行
    if (e.target.closest('.hamburger')) {
        const nav = document.querySelector('.nav-links');
        if (nav) {
            nav.classList.toggle('active'); // activeクラスをつけ外し
        }
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const preTags = document.querySelectorAll('.code-block pre');

    preTags.forEach(pre => {
        // --- 1. コードの取得と整形 ---
        let codeText = pre.textContent;

        // 行ごとに分割
        // (Windowsの改行コード \r\n にも対応するため split の正規表現を使用)
        let lines = codeText.split(/\r?\n/);

        // 先頭と末尾の空行（改行だけの行）を削除
        while (lines.length > 0 && lines[0].trim() === '') {
            lines.shift();
        }
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
            lines.pop();
        }

        // 最小のインデント（左側の共通する空白の数）を探す
        // 空行以外の行で、先頭に何文字スペースがあるか調べる
        const minIndent = lines
            .filter(line => line.trim().length > 0)
            .reduce((min, line) => {
                const indent = line.match(/^\s*/)[0].length;
                return Math.min(min, indent);
            }, Infinity);

        // 共通インデントが見つかれば、各行から削除（デデント）
        if (minIndent !== Infinity && minIndent > 0) {
            lines = lines.map(line => {
                return line.length >= minIndent ? line.slice(minIndent) : line;
            });
        }
        
        // 整形後のテキストを再構築（コピー用）
        const cleanCodeText = lines.join('\n');


        // --- 2. 行番号リストの作成 ---
        const ol = document.createElement('ol');
        ol.className = 'code-lines';

        lines.forEach(line => {
            const li = document.createElement('li');
            li.textContent = line === '' ? ' ' : line; // 空行が潰れないようにスペースを入れる
            ol.appendChild(li);
        });

        pre.innerHTML = '';
        pre.appendChild(ol);


        // --- 3. コピーボタンの設置 ---
        const wrapper = pre.closest('.code-block');
        if (!wrapper) return;

        // 既存のボタンがあれば削除（二重追加防止）
        const existingBtn = wrapper.querySelector('.copy-btn');
        if (existingBtn) existingBtn.remove();

        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.innerText = 'Copy';

        button.addEventListener('click', () => {
            navigator.clipboard.writeText(cleanCodeText).then(() => {
                const originalText = button.innerText;
                button.innerText = 'Copied!';
                button.classList.add('copied');
                setTimeout(() => {
                    button.innerText = originalText;
                    button.classList.remove('copied');
                }, 2000);
            });
        });

        wrapper.appendChild(button);
    });
});

/* =========================================
   Google自動翻訳機能
   ========================================= */

// 1. Google翻訳スクリプトの読み込み
(function() {
    var gtScript = document.createElement('script');
    gtScript.type = 'text/javascript';
    gtScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(gtScript);
})();

// 2. 初期化関数
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'ja', // サイトの元言語
        includedLanguages: 'en,ja', // 翻訳可能な言語（英語と日本語）
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
    
    // 現在の言語に合わせてボタンの状態を更新
    updateLangButtons();
}

// 3. 言語切り替え処理 (Cookieを使用)
function changeLanguage(lang) {
    var currentLang = getCookie('googtrans');
    
    // すでにその言語なら何もしない
    if ((lang === 'ja' && (!currentLang || currentLang === '/ja/ja')) ||
        (lang === 'en' && currentLang === '/ja/en')) {
        return;
    }

    // Google翻訳はCookie 'googtrans' を見て言語を判断する
    // 形式: /元の言語/翻訳先言語
    var cookieValue = (lang === 'en') ? '/ja/en' : '/ja/ja';
    
    // Cookieをセット (.google.com ドメイン対策なども含めて複数セットして確実性を高める)
    document.cookie = "googtrans=" + cookieValue + "; path=/";
    document.cookie = "googtrans=" + cookieValue + "; path=/; domain=" + document.domain;

    // ページをリロードして翻訳を適用
    location.reload();
}

// 4. 現在の言語状態を取得してボタンの見た目を変える
function updateLangButtons() {
    var cookieVal = getCookie('googtrans');
    var isEnglish = (cookieVal && cookieVal.indexOf('/en') > -1);

    // セレクタを .lang-btn に変更
    var jaBtn = document.querySelector('button[onclick="changeLanguage(\'ja\')"]');
    var enBtn = document.querySelector('button[onclick="changeLanguage(\'en\')"]');

    if (jaBtn && enBtn) {
        // 一旦両方の active クラスを外す
        jaBtn.classList.remove('active-lang');
        enBtn.classList.remove('active-lang');

        if (isEnglish) {
            enBtn.classList.add('active-lang');
        } else {
            jaBtn.classList.add('active-lang');
        }
    }
}

// 5. Cookie取得用ヘルパー関数
function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
}

// ページ読み込み完了時にもボタン状態を確認（念のため）
document.addEventListener("DOMContentLoaded", function() {
    // ヘッダーが非同期で読み込まれる場合、少し遅延させる必要があるかもしれません
    setTimeout(updateLangButtons, 500);
});