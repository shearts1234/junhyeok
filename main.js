class MenuCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const menu = this.getAttribute('menu');
        const category = this.getAttribute('category');
        const color = this.getCategoryStyles(category);

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    padding: 15px 25px;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    font-size: 24px;
                    color: white;
                    font-weight: 800;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    background: ${color.bg};
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    min-width: 120px;
                }
                .category {
                    font-size: 12px;
                    font-weight: 400;
                    opacity: 0.9;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            </style>
            <div class="category">${category}</div>
            <div class="menu-name">${menu}</div>
        `;
    }

    getCategoryStyles(category) {
        const styles = {
            '한식': { bg: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)' },
            '중식': { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
            '일식': { bg: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)' },
            '양식': { bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
            '기타': { bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' }
        };
        return styles[category] || styles['기타'];
    }
}

customElements.define('menu-card', MenuCard);

const menuList = [
    { name: '김치찌개', category: '한식' },
    { name: '된장찌개', category: '한식' },
    { name: '불고기', category: '한식' },
    { name: '비빔밥', category: '한식' },
    { name: '삼겹살', category: '한식' },
    { name: '짜장면', category: '중식' },
    { name: '짬뽕', category: '중식' },
    { name: '탕수육', category: '중식' },
    { name: '마라탕', category: '중식' },
    { name: '초밥', category: '일식' },
    { name: '라멘', category: '일식' },
    { name: '돈가스', category: '일식' },
    { name: '우동', category: '일식' },
    { name: '파스타', category: '양식' },
    { name: '피자', category: '양식' },
    { name: '스테이크', category: '양식' },
    { name: '햄버거', category: '양식' },
    { name: '치킨', category: '기타' },
    { name: '떡볶이', category: '기타' },
    { name: '쌀국수', category: '기타' }
];

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
    generateButton.textContent = '고민 중...';

    numbersContainer.innerHTML = '';
    
    // 무작위 셔플 효과를 위해 몇 번 반복 후 최종 메뉴 결정
    let count = 0;
    const maxCount = 10;
    const interval = setInterval(() => {
        const tempMenu = menuList[Math.floor(Math.random() * menuList.length)];
        numbersContainer.innerHTML = `<div style="font-size: 24px; font-weight: 800; opacity: 0.5;">${tempMenu.name}</div>`;
        count++;
        
        if (count >= maxCount) {
            clearInterval(interval);
            const finalMenu = menuList[Math.floor(Math.random() * menuList.length)];
            numbersContainer.innerHTML = '';
            
            const menuCard = document.createElement('menu-card');
            menuCard.setAttribute('menu', finalMenu.name);
            menuCard.setAttribute('category', finalMenu.category);
            numbersContainer.appendChild(menuCard);

            isGenerating = false;
            generateButton.disabled = false;
            generateButton.textContent = '다른 메뉴 추천받기';
            addToHistory(finalMenu);
        }
    }, 100);
});

function addToHistory(menu) {
    const item = document.createElement('div');
    item.className = 'history-item';
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    item.innerHTML = `
        <span><strong>${menu.name}</strong> (${menu.category})</span>
        <span style="opacity: 0.5; font-size: 12px;">${timeString}</span>
    `;
    
    historyList.prepend(item);
    
    // 최대 5개까지만 유지
    if (historyList.children.length > 5) {
        historyList.lastChild.remove();
    }
}
