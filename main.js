let state = {
    views: 0,
    totalViews: 0,
    subscribers: 0,
    viewsPerClick: 1,
    viewsPerSecond: 0,
    diamonds: 0,
    energy: 100,
    maxEnergy: 100,
    energyRegen: 5,
    tierMultiplier: 1,
    tierName: 'เริ่มทำช่อง',
    viralActive: false,
    dramaActive: false,
    autoClickPaused: false,
    totalClicks: 0,
    equippedTitle: null,
    achievements: [],
    inventory: [],
    equippedGear: {
        mic: null,
        camera: null,
        backdrop: null
    },
    missions: [],
    offlineCapHours: 2,
    lastSaved: Date.now()
};

// Event State Tracker
let activeModifiers = {
    viralMultiplier: 1,
    dramaMultiplier: 1
};

// Prestige Tiers
const tiers = [
    { name: 'เริ่มทำช่อง', req: 0, mult: 1 },
    { name: 'ป้ายทองแดง', req: 100000, mult: 2, icon: 'text-orange-400' },
    { name: 'ป้ายเงิน', req: 1000000, mult: 5, icon: 'text-gray-300' },
    { name: 'ป้ายทอง', req: 10000000, mult: 10, icon: 'text-yellow-400' },
    { name: 'ป้ายเพชร', req: 100000000, mult: 25, icon: 'text-cyan-400' }
];

// Upgrades Configuration
const upgradeTypes = {
    CLICK: 'click',
    IDLE: 'idle',
    AUTO_CLICK: 'auto_click',
    MAX_ENERGY: 'max_energy',
    ENERGY_REGEN: 'energy_regen',
    MANAGER: 'manager'
};

const upgrades = [
    {
        id: 'power_bank',
        name: 'พาวเวอร์แบงค์',
        description: '+50 พลังงานสูงสุด',
        type: upgradeTypes.MAX_ENERGY,
        baseCost: 500,
        costMultiplier: 1.5,
        power: 50,
        icon: 'fa-battery-full',
        level: 0
    },
    {
        id: 'coffee',
        name: 'กาแฟคั่วบด',
        description: '+2 ฟื้นฟูพลังงาน/วินาที',
        type: upgradeTypes.ENERGY_REGEN,
        baseCost: 1000,
        costMultiplier: 1.5,
        power: 2,
        icon: 'fa-mug-hot',
        level: 0
    },
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
    },
    {
        id: 'manager_silver',
        name: 'จ้างผู้จัดการส่วนตัว',
        description: 'เพิ่มขีดจำกัดสะสมยอดวิวออฟไลน์เป็น 10 ชั่วโมง',
        type: upgradeTypes.MANAGER,
        baseCost: 20000,
        costMultiplier: 1.5,
        power: 8, // +8 hours
        icon: 'fa-user-tie',
        level: 0
    }
];

// Gacha Equipment Pool
const gachaPool = [
    // Mics
    { id: 'mic_n', name: 'ไมค์มือสอง', type: 'mic', rarity: 'N', buffType: 'click', buffValue: 1.05, desc: '+5% วิว/คลิก' },
    { id: 'mic_r', name: 'ไมค์ตั้งโต๊ะ RGB', type: 'mic', rarity: 'R', buffType: 'click', buffValue: 1.15, desc: '+15% วิว/คลิก' },
    { id: 'mic_sr', name: 'ไมค์คอนเดนเซอร์โปร', type: 'mic', rarity: 'SR', buffType: 'click', buffValue: 1.5, desc: '+50% วิว/คลิก' },
    { id: 'mic_ssr', name: 'ไมค์ทองคำฝังเพชร', type: 'mic', rarity: 'SSR', buffType: 'click', buffValue: 3, desc: '+200% วิว/คลิก' },

    // Cameras
    { id: 'cam_n', name: 'กล้องมือถือเก่า', type: 'camera', rarity: 'N', buffType: 'idle', buffValue: 1.05, desc: '+5% วิว/วินาที' },
    { id: 'cam_r', name: 'เว็บแคม 1080p', type: 'camera', rarity: 'R', buffType: 'idle', buffValue: 1.15, desc: '+15% วิว/วินาที' },
    { id: 'cam_sr', name: 'กล้อง Mirrorless 4K', type: 'camera', rarity: 'SR', buffType: 'idle', buffValue: 1.5, desc: '+50% วิว/วินาที' },
    { id: 'cam_ssr', name: 'กล้องถ่ายหนังสเปรดท็อป', type: 'camera', rarity: 'SSR', buffType: 'idle', buffValue: 3, desc: '+200% วิว/วินาที' },

    // Backdrops
    { id: 'bg_n', name: 'ฉากฝาบ้าน', type: 'backdrop', rarity: 'N', buffType: 'global', buffValue: 1.01, desc: '+1% ทุกยอดวิว' },
    { id: 'bg_r', name: 'ฉากกระดาษสี', type: 'backdrop', rarity: 'R', buffType: 'global', buffValue: 1.05, desc: '+5% ทุกยอดวิว' },
    { id: 'bg_sr', name: 'ห้องไฟสลัว RGB', type: 'backdrop', rarity: 'SR', buffType: 'global', buffValue: 1.2, desc: '+20% ทุกยอดวิว' },
    { id: 'bg_ssr', name: 'สตูฯ หรูวิวตึกระฟ้า', type: 'backdrop', rarity: 'SSR', buffType: 'global', buffValue: 2, desc: '+100% ทุกยอดวิว' }
];

const rarityColors = {
    'N': 'text-gray-400',
    'R': 'text-blue-400',
    'SR': 'text-fuchsia-400',
    'SSR': 'text-yellow-400 font-extrabold drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]'
};

const rarityBorders = {
    'N': 'border-gray-600 bg-gray-900/50',
    'R': 'border-blue-500 bg-blue-900/30',
    'SR': 'border-fuchsia-500 bg-fuchsia-900/30 shadow-[0_0_10px_rgba(217,70,239,0.3)]',
    'SSR': 'border-yellow-400 bg-yellow-900/40 shadow-[0_0_20px_rgba(250,204,21,0.5)]'
};

// Achievements Configuration
const allAchievements = [
    { id: 'first_click', name: 'ก้าวแรก', desc: 'คลิกครบ 100 ครั้ง', type: 'clicks', target: 100, title: 'มือใหม่หัดคลิก', buffType: 'click', buffValue: 1.1, buffText: '+10% ยอดวิวต่อคลิก' },
    { id: 'million_views', name: 'ล้านแตก!', desc: 'สะสมยอดวิวครบ 1,000,000', type: 'total_views', target: 1000000, title: 'ดาวรุ่งพุ่งแรง', buffType: 'idle', buffValue: 1.2, buffText: '+20% ยอดวิวพื้นฐาน/วิ' },
    { id: 'sub_1k', name: 'ชุมชนคนดู', desc: 'ผู้ติดตามครบ 1,000 คน', type: 'subs', target: 1000, title: 'ขวัญใจคนดู', buffType: 'global', buffValue: 1.05, buffText: '+5% คูญวิวทั้งหมด' },
    { id: 'max_energy', name: 'คนบ้าพลัง', desc: 'มีพลังงานสูงสุดระดับ 300+', type: 'max_energy', target: 300, title: 'เครื่องจักรสังหาร', buffType: 'click', buffValue: 1.5, buffText: '+50% ยอดวิวต่อคลิก' }
];

let activeTitleBuffs = {
    click: 1,
    idle: 1,
    global: 1
};

// DOM Elements
const els = {
    totalViews: document.getElementById('total-views'),
    viewsPerSec: document.getElementById('views-per-sec'),
    totalSubs: document.getElementById('total-subs'),
    clickPower: document.getElementById('click-power'),
    mainBtn: document.getElementById('main-click-btn'),
    clickerArea: document.getElementById('clicker-area'),
    upgradesList: document.getElementById('upgrades-list'),
    template: document.getElementById('floating-text-template'),
    energyBar: document.getElementById('energy-bar'),
    energyText: document.getElementById('energy-text'),
    diamondCount: document.getElementById('diamond-count'),
    tierName: document.getElementById('tier-name'),

    // Events UI
    viralBtn: document.getElementById('viral-btn'),
    dramaOverlay: document.getElementById('drama-overlay'),
    dramaProgressBar: document.getElementById('drama-progress-bar'),
    apologyBtn: document.getElementById('apology-btn'),
    dramaTimer: document.getElementById('drama-timer'),

    // Missions UI
    openMissionsBtn: document.getElementById('open-missions-btn'),
    closeMissionsBtn: document.getElementById('close-missions-btn'),
    missionsModal: document.getElementById('missions-modal'),
    missionsList: document.getElementById('missions-list'),
    buyEnergyBtn: document.getElementById('buy-energy-btn'),

    // Toggles
    toggleAutoClickBtn: document.getElementById('toggle-autoclick-btn'),
    autoClickIcon: document.getElementById('autoclick-icon'),
    autoClickStatus: document.getElementById('autoclick-status'),

    // Achievements UI
    openAchievementsBtn: document.getElementById('open-achievements-btn'),
    closeAchievementsBtn: document.getElementById('close-achievements-btn'),
    achievementsModal: document.getElementById('achievements-modal'),
    achievementsList: document.getElementById('achievements-list'),
    currentTitleDisplay: document.getElementById('current-title-display'),
    currentTitleBuff: document.getElementById('current-title-buff'),

    // Gacha UI
    openGachaBtn: document.getElementById('open-gacha-btn'),
    closeGachaBtn: document.getElementById('close-gacha-btn'),
    gachaModal: document.getElementById('gacha-modal'),
    roll1Btn: document.getElementById('roll-1-btn'),
    roll10Btn: document.getElementById('roll-10-btn'),
    rollResultArea: document.getElementById('roll-result-area'),
    inventoryList: document.getElementById('inventory-list')
};

// Config
const ENERGY_DRAIN_PER_CLICK = 2;

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
        const parsedState = JSON.parse(savedState);
        state = { ...state, ...parsedState };

        // Ensure new V3 objects exist even for old saves
        if (!state.equippedGear) state.equippedGear = { mic: null, camera: null, backdrop: null };
        if (!state.inventory) state.inventory = [];
        if (!state.achievements) state.achievements = [];
        if (!state.totalClicks) state.totalClicks = 0;
        // offline progress
        const now = Date.now();
        let diffSecs = (now - state.lastSaved) / 1000;

        // Ensure offline cap is calculated first
        let currentOfflineCapHours = 2; // base cap
        if (savedUpgrades) {
            const parsedUpg = JSON.parse(savedUpgrades);
            const managerUpg = parsedUpg.find(u => u.id === 'manager_silver');
            if (managerUpg) {
                currentOfflineCapHours += (managerUpg.level * 8); // Manager power
            }
        }

        const maxOfflineSecs = currentOfflineCapHours * 3600;
        let cappedLine = '';
        if (diffSecs > maxOfflineSecs) {
            diffSecs = maxOfflineSecs;
            cappedLine = `\n(รับรายได้ออฟไลน์สูงสุด ${currentOfflineCapHours} ชั่วโมง)`;
        }

        if (diffSecs > 0 && state.viewsPerSecond > 0) {
            const idleGains = state.viewsPerSecond * diffSecs;
            state.views += idleGains;
            state.totalViews += idleGains;
            console.log(`ยินดีต้อนรับกลับมา! คุณได้ยอดวิว ${Math.floor(idleGains)} วิวจากตอนที่ออฟไลน์ไป${cappedLine}`);
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
    state.maxEnergy = 100;
    state.energyRegen = 5;
    state.offlineCapHours = 2;

    upgrades.forEach(u => {
        if (u.type === upgradeTypes.CLICK) {
            state.viewsPerClick += (u.power * u.level);
        } else if (u.type === upgradeTypes.IDLE) {
            state.viewsPerSecond += (u.power * u.level);
        } else if (u.type === upgradeTypes.AUTO_CLICK) {
            state.autoClicksPerSecond += (u.power * u.level);
        } else if (u.type === upgradeTypes.MAX_ENERGY) {
            state.maxEnergy += (u.power * u.level);
        } else if (u.type === upgradeTypes.ENERGY_REGEN) {
            state.energyRegen += (u.power * u.level);
        } else if (u.type === upgradeTypes.MANAGER) {
            state.offlineCapHours += (u.power * u.level);
        }
    });

    if (state.energy > state.maxEnergy) {
        state.energy = state.maxEnergy;
    }

    // Apply Title Buffs
    activeTitleBuffs = { click: 1, idle: 1, global: 1 };
    if (state.equippedTitle) {
        const ach = allAchievements.find(a => a.id === state.equippedTitle);
        if (ach) {
            activeTitleBuffs[ach.buffType] = ach.buffValue;
        }
    }

    // Apply Gear Buffs
    Object.values(state.equippedGear).forEach(itemId => {
        if (itemId) {
            const gear = gachaPool.find(g => g.id === itemId);
            if (gear) {
                activeTitleBuffs[gear.buffType] *= gear.buffValue; // Multiply with title buffs
            }
        }
    });
}

function getUpgradeCost(upg) {
    return Math.floor(upg.baseCost * Math.pow(upg.costMultiplier, upg.level));
}

// UI Rendering
function checkTiers() {
    // Find the highest tier they qualify for
    let currentTierIndex = tiers.findIndex(t => t.name === state.tierName);
    if (currentTierIndex === -1) currentTierIndex = 0;

    let nextTier = tiers[currentTierIndex + 1];
    if (nextTier && state.subscribers >= nextTier.req) {
        // Prompt Prestige
        if (confirm(`ยินดีด้วย! คุณถึง ${formatNumber(nextTier.req)} ซับแล้ว 🎉\n\nต้องการรับ "${nextTier.name}" ไหม?\n(คำเตือน: ยอดวิว, ซับ, และอัปเกรด จะถูกรีเซ็ต แต่คุณจะได้โบนัส x${nextTier.mult} ทุกอย่างถาวร!)`)) {
            // Prestige Reset
            state.views = 0;
            state.totalViews = 0;
            state.subscribers = 0;
            state.energy = state.maxEnergy;
            state.tierName = nextTier.name;
            state.tierMultiplier = nextTier.mult;

            // Reset Upgrades
            upgrades.forEach(u => u.level = 0);

            recalculateStats();
            renderUpgrades();
            updateUI();
            saveGame();
            alert('รีเซ็ตช่องสำเร็จ! เริ่มต้นตำนานบทใหม่พร้อมตัวคูณมหาศาล!');
        }
    }
}

function updateUI() {
    state.subscribers = calculateSubscribers(state.totalViews);
    checkTiers();

    els.totalViews.innerHTML = `<i class="fa-solid fa-eye text-purple-400 text-xl"></i> ${formatNumber(state.views)}`;

    let effectiveViewsPerSec = state.viewsPerSecond * activeTitleBuffs.idle * state.tierMultiplier * activeModifiers.viralMultiplier * activeModifiers.dramaMultiplier * activeTitleBuffs.global;
    els.viewsPerSec.innerHTML = `<i class="fa-solid fa-bolt text-yellow-400 text-xl"></i> ${formatNumber(effectiveViewsPerSec)}`;

    els.totalSubs.innerHTML = `<i class="fa-solid fa-users text-pink-400 text-xl"></i> ${formatNumber(state.subscribers)}`;

    let effectiveClickPower = state.viewsPerClick * activeTitleBuffs.click * state.tierMultiplier * activeModifiers.viralMultiplier * activeTitleBuffs.global;
    els.clickPower.innerText = formatNumber(effectiveClickPower);

    // New UI elements (checking existence to prevent errors if HTML not fully updated yet)
    if (els.diamondCount) els.diamondCount.innerText = formatNumber(state.diamonds);
    if (els.tierName) els.tierName.innerText = state.tierName;
    if (els.energyText) els.energyText.innerText = `${Math.floor(state.energy)} / ${state.maxEnergy}`;
    if (els.energyBar) els.energyBar.style.width = `${(state.energy / state.maxEnergy) * 100}%`;

    // Toggle Auto Click Button Visibility & State
    if (els.toggleAutoClickBtn) {
        if (state.autoClicksPerSecond > 0) {
            els.toggleAutoClickBtn.classList.remove('hidden');
            if (state.autoClickPaused) {
                // Currently Paused -> Show "Resume" UI
                els.toggleAutoClickBtn.classList.replace('bg-green-600/50', 'bg-red-600/50');
                els.toggleAutoClickBtn.classList.replace('hover:bg-green-500/80', 'hover:bg-red-500/80');
                els.toggleAutoClickBtn.classList.replace('text-green-200', 'text-red-200');
                els.toggleAutoClickBtn.classList.replace('border-green-500/50', 'border-red-500/50');
                els.autoClickIcon.className = "fa-solid fa-pause";
                els.autoClickStatus.innerText = "ปิดออโต้คลิกอยู่";
            } else {
                // Currently Active -> Show "Active" UI
                els.toggleAutoClickBtn.classList.replace('bg-red-600/50', 'bg-green-600/50');
                els.toggleAutoClickBtn.classList.replace('hover:bg-red-500/80', 'hover:bg-green-500/80');
                els.toggleAutoClickBtn.classList.replace('text-red-200', 'text-green-200');
                els.toggleAutoClickBtn.classList.replace('border-red-500/50', 'border-green-500/50');
                els.autoClickIcon.className = "fa-solid fa-play";
                els.autoClickStatus.innerText = "เปิดออโต้คลิกอยู่";
            }
        } else {
            els.toggleAutoClickBtn.classList.add('hidden');
        }
    }

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

function createFloatingText(e, amount) {
    // Use template
    const templateContent = els.template.content.cloneNode(true);
    const floatEl = templateContent.querySelector('.floating-text');
    floatEl.innerText = `+${formatNumber(amount)}`;

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
    state.totalClicks++;
    if (state.energy >= ENERGY_DRAIN_PER_CLICK) {
        state.energy -= ENERGY_DRAIN_PER_CLICK;
        const gained = state.viewsPerClick * state.tierMultiplier * activeModifiers.viralMultiplier;
        state.views += gained;
        state.totalViews += gained;

        // Mission Tracking for Clicks
        state.missions.forEach(m => {
            if (m.type === 'click' && !m.completed) {
                m.progress++;
                if (m.progress >= m.target) m.completed = true;
            }
        });

        createFloatingText(e, gained);
        updateUI();
    } else {
        // Not enough energy visual feedback
        els.mainBtn.classList.add('shake');
        setTimeout(() => els.mainBtn.classList.remove('shake'), 500);
    }
});

if (els.toggleAutoClickBtn) {
    els.toggleAutoClickBtn.addEventListener('click', () => {
        state.autoClickPaused = !state.autoClickPaused;
        updateUI();
        saveGame();
    });
}

// Loops
setInterval(() => {
    // Energy Regen
    if (state.energy < state.maxEnergy) {
        state.energy += (state.energyRegen / 10);
        if (state.energy > state.maxEnergy) state.energy = state.maxEnergy;
    }

    // Passive Views
    if (state.viewsPerSecond > 0) {
        // add 1/10th of viewsPerSecond every 100ms for smooth UI
        const amount = (state.viewsPerSecond * state.tierMultiplier * activeModifiers.viralMultiplier * activeModifiers.dramaMultiplier) / 10;
        state.views += amount;
        state.totalViews += amount;
    }

    updateUI();
}, 100);

setInterval(() => {
    checkAchievements();
}, 2000);

// Auto Click Loop
let autoClickAccumulator = 0;
setInterval(() => {
    if (state.autoClicksPerSecond > 0 && !state.autoClickPaused) {
        const clicksPerIter = state.autoClicksPerSecond / 10; // since loop runs 10 times a sec
        autoClickAccumulator += clicksPerIter;

        while (autoClickAccumulator >= 1 && state.energy >= ENERGY_DRAIN_PER_CLICK) {
            state.energy -= ENERGY_DRAIN_PER_CLICK;

            const gained = state.viewsPerClick * state.tierMultiplier * activeModifiers.viralMultiplier;
            state.views += gained;
            state.totalViews += gained;

            // Randomly create floating text for auto-clicks so it looks alive
            if (Math.random() > 0.5) {
                createFloatingText({ isAuto: true }, gained);
            }

            autoClickAccumulator -= 1;
            updateUI();
        }
    }
}, 100);

setInterval(() => {
    saveGame();
}, 10000);

// ================= EVENT SYSTEMS =================

// 1. Viral Event Logic
function spawnViral() {
    if (state.viralActive || state.dramaActive) return;

    state.viralActive = true;
    els.viralBtn.classList.remove('hidden');

    // Random Position within screen bounds
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 100;
    els.viralBtn.style.left = `${Math.max(20, Math.random() * maxX)}px`;
    els.viralBtn.style.top = `${Math.max(80, Math.random() * maxY)}px`;

    // Despawn if not clicked in 5 seconds
    const despawnTimer = setTimeout(() => {
        if (state.viralActive) {
            state.viralActive = false;
            els.viralBtn.classList.add('hidden');
        }
    }, 5000);

    // Click handler
    els.viralBtn.onclick = () => {
        clearTimeout(despawnTimer);
        els.viralBtn.classList.add('hidden');

        // Apply Buff
        activeModifiers.viralMultiplier = 10;
        updateUI();

        // Expire Buff after 30s
        setTimeout(() => {
            activeModifiers.viralMultiplier = 1;
            state.viralActive = false;
            updateUI();
        }, 30000);
    };
}

// 2. Drama Event Logic
let dramaClicks = 0;
let dramaTimerInterval = null;

function spawnDrama() {
    if (state.viralActive || state.dramaActive) return;

    state.dramaActive = true;
    activeModifiers.dramaMultiplier = 0.5; // Cut passive income in half
    dramaClicks = 0;

    let timeLeft = 10;
    els.dramaTimer.innerText = timeLeft;
    els.dramaProgressBar.style.width = '0%';
    els.dramaOverlay.classList.remove('hidden');
    updateUI();

    dramaTimerInterval = setInterval(() => {
        timeLeft--;
        els.dramaTimer.innerText = timeLeft;
        if (timeLeft <= 0) {
            endDrama(false);
        }
    }, 1000);
}

function handleDramaClick() {
    dramaClicks++;
    els.dramaProgressBar.style.width = `${(dramaClicks / 20) * 100}%`;

    // Shake button effect
    els.apologyBtn.classList.add('scale-95');
    setTimeout(() => els.apologyBtn.classList.remove('scale-95'), 50);

    if (dramaClicks >= 20) {
        endDrama(true);
    }
}

function endDrama(success) {
    clearInterval(dramaTimerInterval);
    state.dramaActive = false;
    activeModifiers.dramaMultiplier = 1;
    els.dramaOverlay.classList.add('hidden');

    if (!success) {
        // Player failed, lose 10% of total views/subs theoretically, we'll just penalize total Views which recalculates subs
        const penalty = state.totalViews * 0.1;
        state.totalViews -= penalty;
        if (state.totalViews < 0) state.totalViews = 0;
        state.views -= penalty;
        if (state.views < 0) state.views = 0;
        alert("คุณอัดคลิปขอโทษไม่ทัน! ยอดวิวและผู้ติดตามหายไป 10%");
    }
    updateUI();
}

els.apologyBtn.addEventListener('click', handleDramaClick);

// Random Spawners
setInterval(() => {
    // 10% chance every 30s to spawn Viral
    if (Math.random() < 0.1) spawnViral();
}, 30000);

setInterval(() => {
    // 5% chance every 45s to spawn Drama
    if (Math.random() < 0.05) spawnDrama();
}, 45000);

// ================= MISSIONS SYSTEM =================
function generateMissions() {
    if (state.missions.length === 0) {
        state.missions = [
            { id: 1, desc: 'คลิก 50 ครั้ง', type: 'click', target: 50, progress: 0, reward: 5, completed: false, claimed: false },
            { id: 2, desc: 'สะสม 10,000 วิว', type: 'views', target: 10000, progress: 0, reward: 10, completed: false, claimed: false },
            { id: 3, desc: 'อัปเกรดอะไรก็ได้ 5 ครั้ง', type: 'upgrade', target: 5, progress: 0, reward: 5, completed: false, claimed: false }
        ];
    }
}

function renderMissions() {
    if (!els.missionsList) return;
    els.missionsList.innerHTML = '';

    state.missions.forEach(m => {
        // Update view progress dynamically
        if (m.type === 'views' && !m.completed) {
            m.progress = Math.floor(state.views);
            if (m.progress >= m.target) m.completed = true;
        }

        const isDone = m.completed && !m.claimed;
        const btnText = m.claimed ? 'รับแล้ว' : (isDone ? 'รับรางวัล' : `${formatNumber(m.progress)} / ${formatNumber(m.target)}`);
        const btnClass = m.claimed ? 'bg-gray-600 cursor-not-allowed' : (isDone ? 'bg-green-500 hover:bg-green-400' : 'bg-slate-700 text-gray-400');

        const card = document.createElement('div');
        card.className = `flex justify-between items-center bg-black/40 p-3 rounded-xl border ${isDone ? 'border-green-500/50' : 'border-white/5'}`;
        card.innerHTML = `
            <div>
                <p class="font-bold text-sm ${m.claimed ? 'text-gray-500 line-through' : 'text-white'}">${m.desc}</p>
                <p class="text-xs text-sky-300 font-bold mt-1"><i class="fa-regular fa-gem"></i> ${m.reward}</p>
            </div>
            <button class="px-4 py-2 rounded-lg text-xs font-bold transition-colors ${btnClass}" ${m.claimed ? 'disabled' : ''}>
                ${btnText}
            </button>
        `;

        if (isDone) {
            card.querySelector('button').onclick = () => {
                state.diamonds += m.reward;
                m.claimed = true;

                // If all claimed, regenerate new ones
                if (state.missions.every(mis => mis.claimed)) {
                    state.missions = [];
                    generateMissions();
                }

                renderMissions();
                updateUI();
                saveGame();
            };
        }

        els.missionsList.appendChild(card);
    });
}

// Track Upgrades for missions
const originalBuyUpgrade = buyUpgrade;
buyUpgrade = function (id) {
    const prevLevel = upgrades.find(u => u.id === id).level;
    originalBuyUpgrade(id);
    const newLevel = upgrades.find(u => u.id === id).level;

    if (newLevel > prevLevel) {
        state.missions.forEach(m => {
            if (m.type === 'upgrade' && !m.completed) {
                m.progress++;
                if (m.progress >= m.target) m.completed = true;
            }
        });
        if (!els.missionsModal.classList.contains('hidden')) renderMissions();
    }
};

// UI Listeners
if (els.openMissionsBtn) {
    els.openMissionsBtn.onclick = () => {
        renderMissions();
        els.missionsModal.classList.remove('hidden');
    };
    els.closeMissionsBtn.onclick = () => els.missionsModal.classList.add('hidden');

    els.buyEnergyBtn.onclick = () => {
        if (state.diamonds >= 10 && state.energy < state.maxEnergy) {
            state.diamonds -= 10;
            state.energy = state.maxEnergy;
            updateUI();
            saveGame();

            // Visual feedback
            els.buyEnergyBtn.classList.add('bg-green-500/40');
            setTimeout(() => els.buyEnergyBtn.classList.remove('bg-green-500/40'), 300);
        } else if (state.energy >= state.maxEnergy) {
            alert('พลังงานเต็มอยู่แล้ว!');
        } else {
            alert('เพชรไม่พอ!');
        }
    };
}

if (els.openAchievementsBtn) {
    els.openAchievementsBtn.onclick = () => {
        renderAchievements();
        els.achievementsModal.classList.remove('hidden');
    };
    els.closeAchievementsBtn.onclick = () => els.achievementsModal.classList.add('hidden');
}

// ================= ACHIEVEMENTS & TITLES =================
function renderAchievements() {
    if (!els.achievementsList) return;
    els.achievementsList.innerHTML = '';

    // Display Current Title Buff if equipped
    if (state.equippedTitle) {
        const ach = allAchievements.find(a => a.id === state.equippedTitle);
        if (ach) {
            els.currentTitleDisplay.innerText = ach.title;
            els.currentTitleBuff.innerText = ach.buffText;
        }
    } else {
        els.currentTitleDisplay.innerText = 'ยังไม่มีฉายา';
        els.currentTitleBuff.innerText = '';
    }

    allAchievements.forEach(ach => {
        const isUnlocked = state.achievements.includes(ach.id);
        const isEquipped = state.equippedTitle === ach.id;

        let progressText = '';
        let progressPercent = 0;

        if (!isUnlocked) {
            let current = 0;
            if (ach.type === 'clicks') current = state.totalClicks;
            if (ach.type === 'total_views') current = state.totalViews;
            if (ach.type === 'subs') current = state.subscribers;
            if (ach.type === 'max_energy') current = state.maxEnergy;

            progressPercent = Math.min(100, (current / ach.target) * 100);
            progressText = `${formatNumber(current)} / ${formatNumber(ach.target)}`;
        }

        const card = document.createElement('div');
        card.className = `flex flex-col gap-2 bg-black/40 p-3 rounded-xl border ${isEquipped ? 'border-yellow-500' : (isUnlocked ? 'border-yellow-500/30' : 'border-white/5 opacity-70')}`;

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-bold text-sm ${isUnlocked ? 'text-yellow-400' : 'text-gray-300'}">${ach.name}</h3>
                    <p class="text-xs text-gray-500 mt-0.5">${ach.desc}</p>
                </div>
                <div class="text-right">
                    ${isUnlocked
                ? `<p class="text-xs font-bold text-green-400 mb-1">${ach.buffText}</p>
                           <button class="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-500/40 text-yellow-500 text-xs font-bold font-mono rounded-lg border border-yellow-500/50 transition-colors">
                               ${isEquipped ? '<i class="fa-solid fa-check"></i> ใช้งานอยู่' : 'สวมใส่ฉายา: ' + ach.title}
                           </button>`
                : `<p class="text-xs font-mono text-gray-400">${progressText}</p>`
            }
                </div>
            </div>
            ${!isUnlocked ? `
            <div class="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full bg-yellow-500/50" style="width: ${progressPercent}%"></div>
            </div>` : ''}
        `;

        if (isUnlocked && !isEquipped) {
            card.querySelector('button').onclick = () => {
                state.equippedTitle = ach.id;
                recalculateStats();
                updateUI();
                renderAchievements();
                saveGame();
            };
        }

        els.achievementsList.appendChild(card);
    });
}

function checkAchievements() {
    let unlockedAny = false;
    allAchievements.forEach(ach => {
        if (!state.achievements.includes(ach.id)) {
            let met = false;
            if (ach.type === 'clicks' && state.totalClicks >= ach.target) met = true;
            if (ach.type === 'total_views' && state.totalViews >= ach.target) met = true;
            if (ach.type === 'subs' && state.subscribers >= ach.target) met = true;
            if (ach.type === 'max_energy' && state.maxEnergy >= ach.target) met = true;

            if (met) {
                state.achievements.push(ach.id);
                unlockedAny = true;
                // Auto equip first title
                if (!state.equippedTitle) {
                    state.equippedTitle = ach.id;
                    recalculateStats();
                    updateUI();
                }
                setTimeout(() => alert(`🏆 ปลดล็อกความสำเร็จ: ${ach.name}!\nได้รับฉายาโบนัส: ${ach.title}`), 500);
            }
        }
    });
    if (unlockedAny) {
        if (els.achievementsModal && !els.achievementsModal.classList.contains('hidden')) renderAchievements();
        saveGame();
    }
}


// ================= GACHA SYSTEM =================

function rollGacha() {
    const rand = Math.random() * 100;
    let rarity = 'N';
    if (rand < 1) rarity = 'SSR';       // 1%
    else if (rand < 10) rarity = 'SR';  // 9%
    else if (rand < 40) rarity = 'R';   // 30%
    else rarity = 'N';                  // 60%

    // Filter pool by rarity
    const possibleItems = gachaPool.filter(g => g.rarity === rarity);
    const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];

    return item;
}

function handleRoll(amount) {
    const cost = amount === 1 ? 50 : 450;

    if (state.diamonds < cost) {
        alert('เพชรไม่พอ!');
        return;
    }

    state.diamonds -= cost;
    els.rollResultArea.innerHTML = '';

    const results = [];
    for (let i = 0; i < amount; i++) {
        const item = rollGacha();
        results.push(item);

        // Add to inventory if not already owned
        if (!state.inventory.includes(item.id)) {
            state.inventory.push(item.id);
        } else {
            // Duplicate = refund 5 diamonds
            state.diamonds += 5;
        }
    }

    // Display Results with staggered animation
    results.forEach((item, index) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = `flex flex-col items-center justify-center min-w-[60px] p-2 border rounded-lg ${rarityBorders[item.rarity]} animate-bounce`;
            div.innerHTML = `
                <span class="text-xs ${rarityColors[item.rarity]}">${item.rarity}</span>
                <span class="text-[10px] text-white text-center line-clamp-1 truncate w-full">${item.name}</span>
            `;
            els.rollResultArea.appendChild(div);
        }, index * 150); // Stagger by 150ms
    });

    renderInventory();
    updateUI();
    saveGame();
}

function equipGear(itemId, type) {
    if (state.equippedGear[type] === itemId) {
        // Unequip if already equipped
        state.equippedGear[type] = null;
    } else {
        state.equippedGear[type] = itemId;
    }
    recalculateStats();
    updateUI();
    renderInventory();
    saveGame();
}

function renderInventory() {
    if (!els.inventoryList) return;
    els.inventoryList.innerHTML = '';

    if (state.inventory.length === 0) {
        els.inventoryList.innerHTML = '<div class="text-center text-xs text-gray-500 pt-10">ยังไม่มีอุปกรณ์ ลองใช้เพชรสุ่มดูสิ!</div>';
        return;
    }

    // Group by owned status and type
    state.inventory.forEach(itemId => {
        const item = gachaPool.find(g => g.id === itemId);
        if (!item) return;

        const isEquipped = state.equippedGear[item.type] === item.id;

        const card = document.createElement('div');
        card.className = `p-2 rounded-xl flex justify-between items-center ${rarityBorders[item.rarity]} ${isEquipped ? 'ring-2 ring-white/50' : 'opacity-80'}`;

        card.innerHTML = `
            <div>
                <p class="text-xs font-bold ${rarityColors[item.rarity]}">${item.rarity} | <span class="text-white">${item.name}</span></p>
                <p class="text-[10px] text-green-300">${item.desc}</p>
            </div>
            <button class="px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${isEquipped ? 'bg-red-500/50 hover:bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}">
                ${isEquipped ? 'ถอด' : 'สวมใส่'}
            </button>
        `;

        // Direct event listener attachment
        card.querySelector('button').addEventListener('click', (e) => {
            e.stopPropagation(); // prevent any bubble
            equipGear(item.id, item.type);
        });
        els.inventoryList.appendChild(card);
    });
}

if (els.openGachaBtn) {
    els.openGachaBtn.onclick = () => {
        renderInventory();
        els.gachaModal.classList.remove('hidden');
    };
    els.closeGachaBtn.onclick = () => els.gachaModal.classList.add('hidden');

    els.roll1Btn.onclick = () => handleRoll(1);
    els.roll10Btn.onclick = () => handleRoll(10);
}


// Init
// =================================================
generateMissions();
loadGame();
renderUpgrades();
updateUI();
