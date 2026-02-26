// Game State
let state = {
    views: 0,
    totalViews: 0,
    subscribers: 0,
    viewsPerClick: 1,
    viewsPerSecond: 0,
    lastSaved: Date.now()
};

// Upgrades Configuration
const upgradeTypes = {
    CLICK: 'click',
    IDLE: 'idle',
    AUTO_CLICK: 'auto_click'
};

const upgrades = [
    {
        id: 'auto_clicker',
        name: 'ออโต้คลิก',
        description: 'กดคลิกอัตโนมัติ 1 ครั้ง / วินาที',
        type: upgradeTypes.AUTO_CLICK,
        baseCost: 100,
        costMultiplier: 1.5,
        power: 1, // Clicks per second
        icon: 'fa-robot',
        level: 0
    },
    {
        id: 'better_camera',
        name: 'กล้องดีขึ้น',
        description: '+1 วิว ต่อคลิก',
        type: upgradeTypes.CLICK,
        baseCost: 15,
        costMultiplier: 1.5,
        power: 1,
        icon: 'fa-video',
        level: 0
    },
    {
        id: 'hire_editor',
        name: 'จ้างคนตัดต่อ',
        description: '+2 วิว / วินาที',
        type: upgradeTypes.IDLE,
        baseCost: 50,
        costMultiplier: 1.4,
        power: 2,
        icon: 'fa-scissors',
        level: 0
    },
    {
        id: 'ring_light',
        name: 'ไฟวงแหวน (Ring Light)',
        description: '+5 วิว ต่อคลิก',
        type: upgradeTypes.CLICK,
        baseCost: 200,
        costMultiplier: 1.6,
        power: 5,
        icon: 'fa-sun',
        level: 0
    },
    {
        id: 'collab',
        name: 'คอลแลปกับครีเอเตอร์',
        description: '+15 วิว / วินาที',
        type: upgradeTypes.IDLE,
        baseCost: 1000,
        costMultiplier: 1.3,
        power: 15,
        icon: 'fa-handshake',
        level: 0
    },
    {
        id: 'studio',
        name: 'จัดสตูใหม่',
        description: '+50 วิว / วินาที',
        type: upgradeTypes.IDLE,
        baseCost: 5000,
        costMultiplier: 1.4,
        power: 50,
        icon: 'fa-microphone',
        level: 0
    }
];

// DOM Elements
const els = {
    totalViews: document.getElementById('total-views'),
    viewsPerSec: document.getElementById('views-per-sec'),
    totalSubs: document.getElementById('total-subs'),
    clickPower: document.getElementById('click-power'),
    mainBtn: document.getElementById('main-click-btn'),
    clickerArea: document.getElementById('clicker-area'),
    upgradesList: document.getElementById('upgrades-list'),
    template: document.getElementById('floating-text-template')
};

// Utility
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toLocaleString();
}

function calculateSubscribers(totalViews) {
    // 1 sub for every 50 total views, growing slightly harder
    return Math.floor(Math.pow(totalViews, 0.8) / 5);
}

// Save & Load
function saveGame() {
    state.lastSaved = Date.now();
    localStorage.setItem('creatorClickerState', JSON.stringify(state));
    localStorage.setItem('creatorClickerUpgrades', JSON.stringify(upgrades.map(u => ({ id: u.id, level: u.level }))));
}

function loadGame() {
    const savedState = localStorage.getItem('creatorClickerState');
    const savedUpgrades = localStorage.getItem('creatorClickerUpgrades');
    if (savedState) {
        state = { ...state, ...JSON.parse(savedState) };
        // offline progress
        const now = Date.now();
        const diffSecs = (now - state.lastSaved) / 1000;
        if (diffSecs > 0 && state.viewsPerSecond > 0) {
            const idleGains = state.viewsPerSecond * diffSecs;
            state.views += idleGains;
            state.totalViews += idleGains;
            console.log(`ยินดีต้อนรับกลับมา! คุณได้ยอดวิว ${Math.floor(idleGains)} วิวจากตอนที่ออฟไลน์ไป`);
        }
    }
    if (savedUpgrades) {
        const parsed = JSON.parse(savedUpgrades);
        parsed.forEach(savedUpg => {
            const upg = upgrades.find(u => u.id === savedUpg.id);
            if (upg) upg.level = savedUpg.level;
        });
    }
    recalculateStats();
}

function recalculateStats() {
    state.viewsPerClick = 1;
    state.viewsPerSecond = 0;
    state.autoClicksPerSecond = 0;

    upgrades.forEach(u => {
        if (u.type === upgradeTypes.CLICK) {
            state.viewsPerClick += (u.power * u.level);
        } else if (u.type === upgradeTypes.IDLE) {
            state.viewsPerSecond += (u.power * u.level);
        } else if (u.type === upgradeTypes.AUTO_CLICK) {
            state.autoClicksPerSecond += (u.power * u.level);
        }
    });
}

function getUpgradeCost(upg) {
    return Math.floor(upg.baseCost * Math.pow(upg.costMultiplier, upg.level));
}

// UI Rendering
function updateUI() {
    state.subscribers = calculateSubscribers(state.totalViews);

    els.totalViews.innerHTML = `<i class="fa-solid fa-eye text-purple-400 text-xl"></i> ${formatNumber(state.views)}`;
    els.viewsPerSec.innerHTML = `<i class="fa-solid fa-bolt text-yellow-400 text-xl"></i> ${formatNumber(state.viewsPerSecond)}`;
    els.totalSubs.innerHTML = `<i class="fa-solid fa-users text-pink-400 text-xl"></i> ${formatNumber(state.subscribers)}`;
    els.clickPower.innerText = formatNumber(state.viewsPerClick);

    // Update upgrade buttons affordability
    upgrades.forEach(upg => {
        const btn = document.getElementById(`upg-${upg.id}`);
        if (btn) {
            const cost = getUpgradeCost(upg);
            const isAffordable = state.views >= cost;

            // Toggle classes for available/unavailable styling
            if (isAffordable) {
                btn.classList.remove('opacity-50', 'grayscale', 'cursor-not-allowed');
                btn.classList.add('cursor-pointer', 'affordable', 'hover:bg-purple-900/40');
            } else {
                btn.classList.add('opacity-50', 'grayscale', 'cursor-not-allowed');
                btn.classList.remove('cursor-pointer', 'affordable', 'hover:bg-purple-900/40');
            }
        }
    });
}

function renderUpgrades() {
    els.upgradesList.innerHTML = '';
    upgrades.forEach(upg => {
        const cost = getUpgradeCost(upg);

        const card = document.createElement('div');
        card.id = `upg-${upg.id}`;
        card.className = `upgrade-card flex items-center p-4 bg-black/40 border border-white/10 rounded-xl select-none relative overflow-hidden`;

        card.innerHTML = `
            <div class="w-12 h-12 rounded-full bg-purple-900/50 flex flex-shrink-0 items-center justify-center mr-4 shadow-inner">
                <i class="fa-solid ${upg.icon} text-xl text-purple-300"></i>
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-baseline mb-1">
                    <h3 class="font-bold text-white">${upg.name}</h3>
                    <span class="text-xs font-bold text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded-full">เลเวล ${upg.level}</span>
                </div>
                <p class="text-xs text-gray-400 mb-2">${upg.description}</p>
                <div class="flex items-center gap-1 text-sm font-bold text-yellow-400">
                    <i class="fa-solid fa-eye text-xs"></i> <span>${formatNumber(cost)}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => buyUpgrade(upg.id));
        els.upgradesList.appendChild(card);
    });
}

function reRenderSpecificUpgrade(upgId) {
    const upg = upgrades.find(u => u.id === upgId);
    if (!upg) return;
    const card = document.getElementById(`upg-${upgId}`);
    if (card) {
        const cost = getUpgradeCost(upg);
        card.querySelector('span.text-xs.font-bold').innerText = `เลเวล ${upg.level}`;
        card.querySelector('div.text-yellow-400 span').innerText = `${formatNumber(cost)}`;
    }
}

// Logic
function buyUpgrade(id) {
    const upg = upgrades.find(u => u.id === id);
    const cost = getUpgradeCost(upg);

    if (state.views >= cost) {
        state.views -= cost;
        upg.level++;
        recalculateStats();
        reRenderSpecificUpgrade(id);
        updateUI();
        saveGame();
    }
}

function createFloatingText(e) {
    // Use template
    const templateContent = els.template.content.cloneNode(true);
    const floatEl = templateContent.querySelector('.floating-text');
    floatEl.innerText = `+${formatNumber(state.viewsPerClick)}`;

    // Position
    const rect = els.clickerArea.getBoundingClientRect();

    // Default to center of click area if no reliable event coordinates
    let x = (rect.width / 2);
    let y = (rect.height / 2) - 50;

    if (e && e.clientX) {
        x = e.clientX - rect.left - 20; // offset for center
        y = e.clientY - rect.top - 20;
    } else if (e && e.isAuto) {
        // Randomize auto click position
        x = (rect.width / 2) + (Math.random() * 100 - 50);
        y = (rect.height / 2) - 50 + (Math.random() * 100 - 50);
    }

    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;

    els.clickerArea.appendChild(floatEl);

    // Remove element after animation (1s)
    setTimeout(() => {
        floatEl.remove();
    }, 1000);
}

// Interactions
els.mainBtn.addEventListener('click', (e) => {
    state.views += state.viewsPerClick;
    state.totalViews += state.viewsPerClick;
    updateUI();
    createFloatingText(e);
});

// Loops
setInterval(() => {
    if (state.viewsPerSecond > 0) {
        // add 1/10th of viewsPerSecond every 100ms for smooth UI
        const amount = state.viewsPerSecond / 10;
        state.views += amount;
        state.totalViews += amount;
        updateUI();
    }
}, 100);

// Auto Click Loop
let autoClickAccumulator = 0;
setInterval(() => {
    if (state.autoClicksPerSecond > 0) {
        const clicksPerIter = state.autoClicksPerSecond / 10; // since loop runs 10 times a sec
        autoClickAccumulator += clicksPerIter;

        while (autoClickAccumulator >= 1) {
            // Simulate a physical click
            state.views += state.viewsPerClick;
            state.totalViews += state.viewsPerClick;

            // Randomly create floating text for auto-clicks so it looks alive
            if (Math.random() > 0.5) {
                createFloatingText({ isAuto: true });
            }

            autoClickAccumulator -= 1;
            updateUI();
        }
    }
}, 100);

setInterval(() => {
    saveGame();
}, 10000);

// Init
loadGame();
renderUpgrades();
updateUI();
