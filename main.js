class MenuCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const menu = this.getAttribute('menu');
        const category = this.getAttribute('category');
        const imageUrl = this.getAttribute('image-url');
        const color = this.getCategoryStyles(category);

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    padding: 0;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-size: 24px;
                    color: white;
                    font-weight: 800;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    background: ${color.bg};
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    width: 100%;
                    max-width: 300px;
                    overflow: hidden;
                }
                .food-image-container {
                    width: 100%;
                    height: 200px;
                    background: rgba(0,0,0,0.1);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }
                .food-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: ${imageUrl ? 'block' : 'none'};
                }
                .loading-spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s linear infinite;
                    display: ${imageUrl ? 'none' : 'block'};
                }
                .info-container {
                    padding: 20px;
                    width: 100%;
                    box-sizing: border-box;
                    text-align: center;
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
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
            <div class="food-image-container">
                <div class="loading-spinner"></div>
                <img src="${imageUrl || ''}" class="food-image" alt="${menu}">
            </div>
            <div class="info-container">
                <div class="category">${category}</div>
                <div class="menu-name">${menu}</div>
            </div>
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
const apiKeyInput = document.getElementById('api-key');

// --- 주먹 가위 테스트 로직 ---
const RPS_URL = "https://teachablemachine.withgoogle.com/models/AJ02IUq_b/";
let rpsModel, rpsWebcam, rpsLabelContainer, rpsMaxPredictions;
const rpsStartButton = document.getElementById('rps-start-button');
const rpsWebcamContainer = document.getElementById('webcam-container');
const rpsLabelSection = document.getElementById('label-container');

async function initRPS() {
    rpsStartButton.disabled = true;
    rpsStartButton.textContent = '모델 로딩 중...';

    const modelURL = RPS_URL + "model.json";
    const metadataURL = RPS_URL + "metadata.json";

    try {
        rpsModel = await tmImage.load(modelURL, metadataURL);
        rpsMaxPredictions = rpsModel.getTotalClasses();

        const flip = true; 
        rpsWebcam = new tmImage.Webcam(200, 200, flip); 
        await rpsWebcam.setup(); 
        await rpsWebcam.play();
        
        window.requestAnimationFrame(rpsLoop);

        rpsWebcamContainer.appendChild(rpsWebcam.canvas);
        for (let i = 0; i < rpsMaxPredictions; i++) {
            const div = document.createElement("div");
            div.className = 'label-item';
            rpsLabelSection.appendChild(div);
        }
        
        rpsStartButton.style.display = 'none';
    } catch (error) {
        console.error("RPS Initialization failed:", error);
        rpsStartButton.disabled = false;
        rpsStartButton.textContent = '카메라 시작하기 (오류 발생)';
    }
}

async function rpsLoop() {
    rpsWebcam.update(); 
    await rpsPredict();
    window.requestAnimationFrame(rpsLoop);
}

async function rpsPredict() {
    const prediction = await rpsModel.predict(rpsWebcam.canvas);
    for (let i = 0; i < rpsMaxPredictions; i++) {
        const classPrediction = `<span>${prediction[i].className}</span> <span>${(prediction[i].probability * 100).toFixed(0)}%</span>`;
        rpsLabelSection.childNodes[i].innerHTML = classPrediction;
        
        // 확률이 높을 때 강조
        if (prediction[i].probability > 0.8) {
            rpsLabelSection.childNodes[i].style.color = '#ff5252';
            rpsLabelSection.childNodes[i].style.borderColor = '#ff5252';
        } else {
            rpsLabelSection.childNodes[i].style.color = 'inherit';
            rpsLabelSection.childNodes[i].style.borderColor = 'transparent';
        }
    }
}

rpsStartButton.addEventListener('click', initRPS);

async function generateFoodImage(menuName, apiKey) {
    if (!apiKey) return null;

    // 나노바나나 (Gemini 3.1 Flash Image Preview) 모델 사용
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`;
    const prompt = `A delicious high-quality professional food photography of ${menuName}, minimalist white background, cinematic lighting, 4k resolution`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const part = data.candidates?.[0]?.content?.parts?.[0];

        if (part?.inline_data) {
            return `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
        }
    } catch (error) {
        console.error('Image generation failed:', error);
    }
    return null;
}

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

generateButton.addEventListener('click', async () => {
    if (isGenerating) return;
    isGenerating = true;
    generateButton.disabled = true;
    generateButton.textContent = '고민 중...';

    numbersContainer.innerHTML = '';
    
    // 무작위 셔플 효과를 위해 몇 번 반복 후 최종 메뉴 결정
    let count = 0;
    const maxCount = 10;
    const interval = setInterval(async () => {
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

            // 이미지 생성 시작
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                const imageUrl = await generateFoodImage(finalMenu.name, apiKey);
                if (imageUrl) {
                    menuCard.setAttribute('image-url', imageUrl);
                    const img = menuCard.shadowRoot.querySelector('.food-image');
                    const spinner = menuCard.shadowRoot.querySelector('.loading-spinner');
                    if (img) img.style.display = 'block';
                    if (spinner) spinner.style.display = 'none';
                } else {
                    // 이미지 생성 실패 시 로딩 스피너 제거
                    const spinner = menuCard.shadowRoot.querySelector('.loading-spinner');
                    if (spinner) spinner.style.display = 'none';
                }
            } else {
                // API 키가 없으면 로딩 스피너 제거
                const spinner = menuCard.shadowRoot.querySelector('.loading-spinner');
                if (spinner) spinner.style.display = 'none';
            }

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
