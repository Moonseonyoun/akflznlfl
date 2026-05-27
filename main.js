
class LottoBalls extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    set numbers(numbers) {
        this.shadowRoot.innerHTML = \`
            <style>
                .lotto-ball {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0 0.5rem;
                    background-color: var(--ball-bg, #f0f0f0);
                    color: var(--text-color, #333);
                    transition: background-color 0.3s, color 0.3s;
                }
            </style>
        \`;
        numbers.forEach(number => {
            const ball = document.createElement('div');
            ball.classList.add('lotto-ball');
            ball.textContent = number;
            this.shadowRoot.appendChild(ball);
        });
    }
}

customElements.define('lotto-balls', LottoBalls);

const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeBtn.textContent = newTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
});

document.getElementById('generate-btn').addEventListener('click', () => {
    const lottoNumbersContainer = document.getElementById('lotto-numbers-container');
    lottoNumbersContainer.innerHTML = ''; 
    const lottoBalls = document.createElement('lotto-balls');
    const numbers = generateLottoNumbers();
    lottoBalls.numbers = numbers;
    lottoNumbersContainer.appendChild(lottoBalls);
});

function generateLottoNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }
    return [...numbers];
}
