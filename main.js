class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        const color = this.getColor(number);

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 24px;
                    color: white;
                    font-weight: bold;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    background-color: ${color};
                    animation: pop 0.3s ease-out;
                }
                @keyframes pop {
                    0% { transform: scale(0); }
                    100% { transform: scale(1); }
                }
            </style>
            <div>${number}</div>
        `;
    }

    getColor(number) {
        if (number <= 10) return '#fbc02d'; // 노랑
        if (number <= 20) return '#1976d2'; // 파랑
        if (number <= 30) return '#d32f2f'; // 빨강
        if (number <= 40) return '#757575'; // 회색
        return '#388e3c'; // 초록
    }
}

customElements.define('lotto-ball', LottoBall);

const generateButton = document.getElementById('generate-button');
const numbersContainer = document.getElementById('numbers-container');
const modeToggle = document.getElementById('mode-toggle');

// 다크모드 설정
const savedMode = localStorage.getItem('theme');
if (savedMode === 'dark') {
    document.body.classList.add('dark-mode');
    modeToggle.textContent = '라이트 모드';
}

modeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    modeToggle.textContent = isDark ? '라이트 모드' : '다크 모드';
});

generateButton.addEventListener('click', () => {
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    sortedNumbers.forEach((number, index) => {
        setTimeout(() => {
            const lottoBall = document.createElement('lotto-ball');
            lottoBall.setAttribute('number', number);
            numbersContainer.appendChild(lottoBall);
        }, index * 100);
    });
});
