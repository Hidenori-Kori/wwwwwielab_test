async function loadMembers() {
    const container = document.getElementById('members-container');
    if (!container) return;

    try {
        // 1. CSVファイルの読み込み
        const response = await fetch('../../csv/members.csv');
        if (!response.ok) throw new Error("CSVファイルが見つかりません");
        const text = await response.text();

        // 2. CSVを配列に変換
        let lines = text.trim().split(/\r?\n/);
        lines.shift(); // ヘッダー削除
        lines = lines.filter(line => line.trim() !== "");

        // データをオブジェクトに変換
        const members = lines.map(line => {
            const parts = line.split(',');
            return {
                year: parts[0],
                role: parts[1],
                name: parts[2],
                ENname: parts[3],
                message: parts[4] || "",
                image: parts[5] || ""
            };
        });

        // 3. 役職の並び順定義（上にあるほど偉い順）
        const roleOrder = [
            "Professor", "Associate Professor", "Assistant Professor", 
            "D3", "D2", "D1", 
            "M2", "M1", 
            "B4", "Undergraduate", 
            "OB", "OG"
        ];
        
        // 役職ランクを取得する関数（見つからない場合は一番下へ）
        const getRoleRank = (role) => {
            const index = roleOrder.indexOf(role);
            return index === -1 ? 999 : index;
        };

        // 4. 年度ごとにグループ化
        // { "2025": [メンバー...], "2024": [メンバー...] } の形を作る
        const membersByYear = {};
        members.forEach(member => {
            if (!membersByYear[member.year]) {
                membersByYear[member.year] = [];
            }
            membersByYear[member.year].push(member);
        });

        // 5. 年度の降順（新しい年度順）でループ
        const years = Object.keys(membersByYear).sort((a, b) => b - a);
        
        let htmlContent = '';

        years.forEach(year => {
            // その年度のメンバーリストを取得
            let yearMembers = membersByYear[year];

            // ★ここで役職順に並び替え
            yearMembers.sort((a, b) => getRoleRank(a.role) - getRoleRank(b.role));

            // HTML生成（年度の見出し）
            htmlContent += `<h2 class="section-title" style="margin-top:50px;">${year}年度</h2>`;
            htmlContent += `<div class="grid">`;

            // カード生成
            yearMembers.forEach(member => {
                // 画像がない場合のデフォルト画像
                const imgStyle = member.image 
                    ? `background:url('${member.image}') center/cover;` 
                    : `background-color:#ddd; display:flex; align-items:center; justify-content:center; color:#666; font-size:2rem;`;
                
                // 画像がないときに文字を出すための処理
                const imgContent = member.image ? '' : '<span>No Img</span>';

                htmlContent += `
                <div class="card" style="cursor: default;">
                    <div class="card-img" style="${imgStyle}">${imgContent}</div>
                    <div class="card-content">
                        <span style="display:inline-block; background:var(--primary-color); color:#fff; padding:2px 8px; border-radius:4px; font-size:0.8rem; margin-bottom:5px;">${member.role}</span>
                        <h3>${member.name}</h3>
                        <h5>${member.ENname}</h5>
                        <p>${member.message}</p>
                    </div>
                </div>
                `;
            });

            htmlContent += `</div>`; // grid閉じ
        });

        // 6. 表示
        container.innerHTML = htmlContent;

    } catch (error) {
        console.error('メンバー読み込みエラー:', error);
        container.innerHTML = '<p>メンバーデータを読み込めませんでした。</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadMembers);