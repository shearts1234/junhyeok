class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        const color = this.getBallStyles(number);

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 20px;
                    color: white;
                    font-weight: 800;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), inset -4px -4px 10px rgba(0,0,0,0.2);
                    background: ${color.bg};
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                    animation: dropIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    position: relative;
                }
                :host::before {
                    content: '';
                    position: absolute;
                    top: 5px;
                    left: 10px;
                    width: 15px;
                    height: 10px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 50%;
                    transform: rotate(-20deg);
                }
                @keyframes dropIn {
                    0% { transform: translateY(-50px) scale(0); opacity: 0; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
            </style>
            <div>${number}</div>
        `;
    }

    getBallStyles(number) {
        if (number <= 10) return { bg: 'radial-gradient(circle at 30% 30%, #fdd835, #fbc02d)' }; // 노랑
        if (number <= 20) return { bg: 'radial-gradient(circle at 30% 30%, #42a5f5, #1976d2)' }; // 파랑
        if (number <= 30) return { bg: 'radial-gradient(circle at 30% 30%, #ef5350, #d32f2f)' }; // 빨강
        if (number <= 40) return { bg: 'radial-gradient(circle at 30% 30%, #bdbdbd, #757575)' }; // 회색
        return { bg: 'radial-gradient(circle at 30% 30%, #66bb6a, #388e3c)' }; // 초록
    }
}

customElements.define('lotto-ball', LottoBall);

const generateButton = document.getElementById('generate-button');
const numbersContainer = document.getElementById('numbers-container');
const modeToggle = document.getElementById('mode-toggle');
const historyList = document.getElementById('history-list');

// 다크모드 설정
const savedMode = localStorage.getItem('theme');
if (savedMode === 'dark') {
    document.body.classList.add('dark-mode');
    modeToggle.textContent = '☀️ 라이트 모드';
} else {
    modeToggle.textContent = '🌙 다크 모드';
}

modeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    modeToggle.textContent = isDark ? '☀️ 라이트 모드' : '🌙 다크 모드';
});

let isGenerating = false;

generateButton.addEventListener('click', () => {
    if (isGenerating) return;
    isGenerating = true;
    generateButton.disabled = true;
    generateButton.textContent = '번호 추출 중...';

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

            if (index === sortedNumbers.length - 1) {
                isGenerating = false;
                generateButton.disabled = false;
                generateButton.textContent = '번호 생성';
                addToHistory(sortedNumbers);
            }
        }, index * 200);
    });
});

function addToHistory(numbers) {
    const item = document.createElement('div');
    item.className = 'history-item';
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    item.innerHTML = `
        <span>${numbers.join(', ')}</span>
        <span style="opacity: 0.5; font-size: 12px;">${timeString}</span>
    `;
    
    historyList.prepend(item);
    
    // 최대 5개까지만 유지
    if (historyList.children.length > 5) {
        historyList.lastChild.remove();
    }
}
