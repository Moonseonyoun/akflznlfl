document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const copyBtn = document.getElementById('copy-btn');
    const themeBtn = document.getElementById('theme-btn');
    const lottoDisplay = document.getElementById('lotto-display');
    const fortuneMsg = document.getElementById('fortune-message');
    const historyList = document.getElementById('history-list');

    let currentNumbers = [];
    let history = [];

    const fortuneMessages = [
        "Today is your day! Big wins are coming.",
        "The stars are aligned for a jackpot.",
        "Success is a journey, start with these numbers.",
        "Your intuition is your best guide.",
        "A surprise windfall might be in your future.",
        "Confidence is the key to winning.",
        "Luck favors the bold!",
        "Fortune follows the brave."
    ];

    const toggleTheme = () => {
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', newTheme);
        themeBtn.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('lotto-theme', newTheme);
    };

    const savedTheme = localStorage.getItem('lotto-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeBtn.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    themeBtn.addEventListener('click', toggleTheme);

    const getBallColorClass = (num) => {
        if (num <= 10) return 'ball-red';
        if (num <= 20) return 'ball-orange';
        if (num <= 30) return 'ball-purple';
        if (num <= 40) return 'ball-blue';
        return 'ball-green';
    };

    const generateNumbers = () => {
        const numbers = new Set();
        while (numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 45) + 1);
        }
        const sortedNums = [...numbers].sort((a, b) => a - b);
        let bonus;
        do {
            bonus = Math.floor(Math.random() * 45) + 1;
        } while (numbers.has(bonus));
        return { main: sortedNums, bonus };
    };

    const displayNumbers = (result) => {
        lottoDisplay.innerHTML = '';
        currentNumbers = [...result.main, result.bonus];
        result.main.forEach((num, index) => {
            const ball = document.createElement('div');
            ball.className = "lotto-ball " + getBallColorClass(num);
            ball.textContent = num;
            ball.style.animationDelay = (index * 0.1) + "s";
            lottoDisplay.appendChild(ball);
        });
        const bonusBall = document.createElement('div');
        bonusBall.className = 'lotto-ball bonus';
        bonusBall.textContent = result.bonus;
        bonusBall.style.animationDelay = '0.7s';
        lottoDisplay.appendChild(bonusBall);
        fortuneMsg.textContent = fortuneMessages[Math.floor(Math.random() * fortuneMessages.length)];
        copyBtn.disabled = false;
        addToHistory(result);
    };

    const addToHistory = (result) => {
        history.unshift(result);
        if (history.length > 5) history.pop();
        updateHistoryUI();
    };

    const updateHistoryUI = () => {
        if (history.length === 0) {
            historyList.innerHTML = '<li class="empty-history">No history yet. Start generating!</li>';
            return;
        }
        historyList.innerHTML = history.map((item) => {
            const time = new Date().toLocaleTimeString();
            return '<li class="history-item"><div class="history-nums">' + 
                item.main.map(n => '<span class="history-ball">' + n + '</span>').join('') + 
                '<span class="history-ball" style="background:var(--gold-gradient)">' + item.bonus + '</span>' + 
                '</div><small>' + time + '</small></li>';
        }).join('');
    };

    generateBtn.addEventListener('click', () => {
        const result = generateNumbers();
        displayNumbers(result);
        if (window.innerWidth < 768) {
            document.getElementById('generator-section').scrollIntoView({ behavior: 'smooth' });
        }
    });

    resetBtn.addEventListener('click', () => {
        lottoDisplay.innerHTML = '<div class="placeholder-balls"><span>?</span><span>?</span><span>?</span><span>?</span><span>?</span><span>?</span><span class="bonus">?</span></div>';
        fortuneMsg.textContent = "Click the button to reveal your luck!";
        copyBtn.disabled = true;
        currentNumbers = [];
    });

    copyBtn.addEventListener('click', () => {
        if (currentNumbers.length === 0) return;
        const text = "Lucky Numbers: " + currentNumbers.slice(0,6).join(', ') + " + Bonus: " + currentNumbers[6];
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => { copyBtn.innerHTML = originalText; }, 2000);
        });
    });
});
