async function loadNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    try {
        // ▼▼▼ パスの自動調整ロジック（ここを修正） ▼▼▼
        
        // デフォルトは「トップページ(ルート)」から見たパス
        let csvPath = './csv/news.csv';

        // もしURLに '/News/' が含まれていたら（Newsフォルダ内のページなら）
        // 同じ階層にある news.csv を読みに行く
        if (window.location.pathname.includes('/News/')) {
            csvPath = './csv/news.csv';
        }

        // CSVを取得
        const response = await fetch(csvPath); 
        // ▲▲▲ 修正ここまで ▲▲▲

        if (!response.ok) throw new Error("CSVファイルが見つかりません: " + csvPath);
        
        const text = await response.text();
        
        // 2. CSVを改行で分割して配列にする
        let lines = text.trim().split(/\r?\n/);

        // 3. 最初の1行目（ヘッダー）を削除
        lines.shift();

        // 4. 空行を取り除く
        lines = lines.filter(line => line.trim() !== "");

        // 配列の並び順を「逆」にする
        lines.reverse();

        // 5. 表示件数の設定
        const limitStr = container.getAttribute('data-limit');
        const limit = limitStr === 'all' ? lines.length : parseInt(limitStr, 10);

        // 6. HTMLを生成
        let htmlContent = '<div class="news-list">';
        
        for (let i = 0; i < lines.length; i++) {
            if (i >= limit) break;
            
            const line = lines[i];
            const parts = line.split(',');
            if (parts.length < 2) continue;

            const date = parts[0];
            const content = parts.slice(1).join(','); 

            htmlContent += `
                <div class="news-item">
                    <span class="news-date">${date}</span>
                    <span class="news-text">${content}</span>
                </div>
            `;
        }

        htmlContent += '</div>';
        
        // 7. 画面に表示
        container.innerHTML = htmlContent;

    } catch (error) {
        console.error('ニュース読み込みエラー:', error);
        container.innerHTML = '<p>ニュースを読み込めませんでした。</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadNews);