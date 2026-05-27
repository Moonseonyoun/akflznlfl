/**
 * Lucky Lotto Generator - Production-Ready Architecture
 */

const CONFIG = {
    BALL_COUNT: 6,
    MAX_NUMBER: 45,
    HISTORY_LIMIT: 5,
    ANIMATION_DELAY: 100,
    STORAGE_KEYS: {
        HISTORY: 'lotto_history',
        THEME: 'lotto_theme',
        COUNT: 'lotto_count'
    },
    MESSAGES: [
        "오늘의 행운은 당신 곁에 있습니다.",
        "잭팟의 주인공은 바로 당신!",
        "긍정적인 에너지가 가득한 번호입니다.",
        "이 번호가 당신에게 부를 가져다줄 거예요.",
        "믿는 대로 이루어지는 마법의 시간.",
        "지금 이 순간, 행운의 문이 열립니다.",
        "당신의 직관을 믿으세요.",
        "최고의 선택, 최고의 결과!"
    ]
};

const Storage = {
    save: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage Save Error:', e);
        }
    },
    load: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage Load Error:', e);
            return null;
        }
    }
};

const Generator = {
    generate: () => {
        const numbers = new Set();
        while (numbers.size < CONFIG.BALL_COUNT) {
            numbers.add(Math.floor(Math.random() * CONFIG.MAX_NUMBER) + 1);
        }
        const sorted = [...numbers].sort((a, b) => a - b);
        
        let bonus;
        do {
            bonus = Math.floor(Math.random() * CONFIG.MAX_NUMBER) + 1;
        } while (numbers.has(bonus));
        
        return { main: sorted, bonus };
    }
};

const Stats = {
    calculate: (nums, bonus) => {
        const sum = nums.reduce((a, b) => a + b, 0);
        const odds = nums.filter(n => n % 2 !== 0).length;
        const evens = nums.length - odds;
        const lows = nums.filter(n => n <= 22).length;
        const highs = nums.length - lows;
        
        const distribution = {
            '1-10': nums.filter(n => n <= 10).length,
            '11-20': nums.filter(n => n > 10 && n <= 20).length,
            '21-30': nums.filter(n => n > 20 && n <= 30).length,
            '31-40': nums.filter(n => n > 30 && n <= 40).length,
            '41-45': nums.filter(n => n > 40).length
        };

        return { sum, odds, evens, lows, highs, distribution };
    }
};

const UI = {
    els: {
        display: document.getElementById('lotto-display'),
        luckyMsg: document.getElementById('lucky-message'),
        historyList: document.getElementById('history-list'),
        totalCount: document.getElementById('total-count'),
        lastTime: document.getElementById('last-time'),
        themeBtn: document.getElementById('theme-toggle'),
        btnGenerate: document.getElementById('btn-generate'),
        btnCopy: document.getElementById('btn-copy'),
        btnReset: document.getElementById('btn-reset'),
        toast: document.getElementById('toast-container'),
        statSum: document.getElementById('stat-sum'),
        statOddEven: document.getElementById('stat-odd-even'),
        statLowHigh: document.getElementById('stat-low-high'),
        statDist: document.getElementById('stat-distribution')
    },

    getBallClass: (num) => {
        if (num <= 10) return 'ball-1';
        if (num <= 20) return 'ball-11';
        if (num <= 30) return 'ball-21';
        if (num <= 40) return 'ball-31';
        return 'ball-41';
    },

    renderBalls: (main, bonus) => {
        UI.els.display.innerHTML = '';
        main.forEach((num, i) => {
            const ball = document.createElement('div');
            ball.className = "lotto-ball " + UI.getBallClass(num);
            ball.textContent = num;
            ball.style.animationDelay = (i * CONFIG.ANIMATION_DELAY) + "ms";
            UI.els.display.appendChild(ball);
        });

        const bonusBall = document.createElement('div');
        bonusBall.className = "lotto-ball ball-bonus " + UI.getBallClass(bonus);
        bonusBall.textContent = bonus;
        bonusBall.style.animationDelay = (CONFIG.BALL_COUNT * CONFIG.ANIMATION_DELAY) + "ms";
        UI.els.display.appendChild(bonusBall);
    },

    renderStats: (stats) => {
        UI.els.statSum.textContent = stats.sum;
        UI.els.statOddEven.textContent = stats.odds + " : " + stats.evens;
        UI.els.statLowHigh.textContent = stats.lows + " : " + stats.highs;
        
        let distHtml = '';
        for (const [range, count] of Object.entries(stats.distribution)) {
            if (count > 0) distHtml += "<span>" + range + ": " + count + "개</span>";
        }
        UI.els.statDist.innerHTML = distHtml || '균일 분포';
    },

    renderHistory: (history) => {
        if (!history || history.length === 0) {
            UI.els.historyList.innerHTML = '<li class="empty-state">생성된 기록이 없습니다.</li>';
            return;
        }

        UI.els.historyList.innerHTML = history.map(item => {
            const ballsHtml = item.main.map(n => '<span class="h-ball ' + UI.getBallClass(n) + '">' + n + '</span>').join('');
            const bonusHtml = '<span class="h-ball ' + UI.getBallClass(item.bonus) + '" style="border:1px solid #f59e0b">' + item.bonus + '</span>';
            return '<li class="history-item"><div class="history-balls">' + ballsHtml + bonusHtml + '</div><small>' + item.time + '</small></li>';
        }).join('');
    },

    showToast: (msg) => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        UI.els.toast.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }
};

const App = {
    state: {
        history: [],
        totalCount: 0,
        currentNumbers: null
    },

    init: () => {
        // Load Data
        App.state.history = Storage.load(CONFIG.STORAGE_KEYS.HISTORY) || [];
        App.state.totalCount = Storage.load(CONFIG.STORAGE_KEYS.COUNT) || 0;
        
        // Theme
        const savedTheme = Storage.load(CONFIG.STORAGE_KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Initial UI
        UI.renderHistory(App.state.history);
        UI.els.totalCount.textContent = App.state.totalCount;

        // Bind Events
        UI.els.btnGenerate.addEventListener('click', App.onGenerate);
        UI.els.btnCopy.addEventListener('click', App.onCopy);
        UI.els.btnReset.addEventListener('click', App.onReset);
        UI.els.themeBtn.addEventListener('click', App.toggleTheme);
    },

    onGenerate: () => {
        const result = Generator.generate();
        App.state.currentNumbers = result;
        App.state.totalCount++;
        
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0') + ":" + now.getSeconds().toString().padStart(2, '0');
        
        // Update History
        App.state.history.unshift({ ...result, time: timeStr });
        if (App.state.history.length > CONFIG.HISTORY_LIMIT) App.state.history.pop();
        
        // Save
        Storage.save(CONFIG.STORAGE_KEYS.HISTORY, App.state.history);
        Storage.save(CONFIG.STORAGE_KEYS.COUNT, App.state.totalCount);

        // Render
        UI.renderBalls(result.main, result.bonus);
        UI.renderStats(Stats.calculate(result.main, result.bonus));
        UI.renderHistory(App.state.history);
        UI.els.totalCount.textContent = App.state.totalCount;
        UI.els.luckyMsg.textContent = CONFIG.MESSAGES[Math.floor(Math.random() * CONFIG.MESSAGES.length)];
        UI.els.lastTime.textContent = "최근 생성: " + timeStr;
        
        UI.showToast("새로운 행운 번호가 생성되었습니다!");
    },

    onCopy: () => {
        if (!App.state.currentNumbers) {
            UI.showToast("복사할 번호가 없습니다. 먼저 생성해주세요.");
            return;
        }
        const text = "로또 행운 번호: " + App.state.currentNumbers.main.join(', ') + " (보너스: " + App.state.currentNumbers.bonus + ")";
        navigator.clipboard.writeText(text).then(() => {
            UI.showToast("번호가 클립보드에 복사되었습니다!");
        }).catch(() => {
            UI.showToast("복사에 실패했습니다.");
        });
    },

    onReset: () => {
        if (!confirm("모든 기록과 카운트를 초기화하시겠습니까?")) return;
        
        App.state.history = [];
        App.state.totalCount = 0;
        App.state.currentNumbers = null;
        
        Storage.save(CONFIG.STORAGE_KEYS.HISTORY, []);
        Storage.save(CONFIG.STORAGE_KEYS.COUNT, 0);
        
        UI.els.display.innerHTML = '<div class="placeholder-area"><div class="empty-ball">?</div><div class="empty-ball">?</div><div class="empty-ball">?</div><div class="empty-ball">?</div><div class="empty-ball">?</div><div class="empty-ball">?</div><div class="empty-ball bonus-placeholder">?</div></div>';
        UI.els.luckyMsg.textContent = "버튼을 눌러 행운을 확인하세요!";
        UI.els.lastTime.textContent = "";
        UI.els.statSum.textContent = "-";
        UI.els.statOddEven.textContent = "-";
        UI.els.statLowHigh.textContent = "-";
        UI.els.statDist.textContent = "분석 대기 중";
        UI.els.totalCount.textContent = "0";
        UI.renderHistory([]);
        
        UI.showToast("모든 데이터가 초기화되었습니다.");
    },

    toggleTheme: () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        Storage.save(CONFIG.STORAGE_KEYS.THEME, next);
    }
};

App.init();
