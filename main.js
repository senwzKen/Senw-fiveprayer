
/* =====================================
   SENW FIVEPRAYER
   Main JavaScript
   Storage: LocalStorage
===================================== */

const STORAGE_KEY = "senwFivePrayerData";

const prayerNames = [
    { name: "Subuh", icon: "🌅" },
    { name: "Dzuhur", icon: "☀️" },
    { name: "Ashar", icon: "🌤️" },
    { name: "Maghrib", icon: "🌇" },
    { name: "Isya", icon: "🌙" }
];

const hadiths = [
    {
        title: "Tentang Niat",
        arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
        translation: "Sesungguhnya setiap amalan bergantung pada niatnya.",
        source: "HR. Bukhari No. 1 dan Muslim No. 1907"
    },
    {
        title: "Mempermudah Urusan",
        arabic: "يَسِّرُوا وَلَا تُعَسِّرُوا",
        translation: "Permudahlah dan jangan mempersulit.",
        source: "HR. Bukhari No. 69 dan Muslim No. 1734"
    },
    {
        title: "Berkata Baik",
        arabic: "فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
        translation: "Hendaklah ia berkata baik atau diam.",
        source: "HR. Bukhari No. 6018 dan Muslim No. 47"
    },
    {
        title: "Menjaga Kebersihan",
        arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ",
        translation: "Bersuci merupakan sebagian dari iman.",
        source: "HR. Muslim No. 223"
    },
    {
        title: "Kasih Sayang",
        arabic: "مَنْ لَا يَرْحَمْ لَا يُرْحَمْ",
        translation: "Siapa yang tidak menyayangi, maka ia tidak akan disayangi.",
        source: "HR. Bukhari No. 6013 dan Muslim No. 2319"
    }
];

const badges = [
    {
        id: "first",
        icon: "🌱",
        name: "Langkah Pertama",
        description: "Menyelesaikan checklist salat untuk pertama kali."
    },
    {
        id: "three",
        icon: "🌿",
        name: "Mulai Konsisten",
        description: "Menyelesaikan 3 hari penuh."
    },
    {
        id: "seven",
        icon: "⭐",
        name: "Satu Pekan",
        description: "Menyelesaikan 7 hari penuh."
    },
    {
        id: "fourteen",
        icon: "🏅",
        name: "Dua Pekan",
        description: "Menyelesaikan 14 hari penuh."
    },
    {
        id: "thirty",
        icon: "🏆",
        name: "Satu Bulan",
        description: "Menyelesaikan 30 hari penuh."
    }
];

/* DATABASE */

function getData() {
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || {
            history: {},
            schedule: {}
        };
    } catch {
        return {
            history: {},
            schedule: {}
        };
    }
}

let appData = getData();

function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );
}

/* DATE */

function getDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getToday() {
    const key = getDateKey();

    if (!appData.history[key]) {
        appData.history[key] = [false, false, false, false, false];
    }

    return appData.history[key];
}

function formatDate(date = new Date()) {
    return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

/* TOAST */

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

/* NAVIGATION */

function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const pages = document.querySelectorAll(".page");

    function openPage(pageName) {
        pages.forEach(page => {
            const active = page.id === pageName + "Page";

            page.classList.toggle("active", active);
            page.hidden = !active;
        });

        navItems.forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.page === pageName
            );
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            openPage(item.dataset.page);
        });
    });

    document.querySelectorAll("[data-page]").forEach(item => {
        if (item.classList.contains("nav-item")) return;

        item.addEventListener("click", () => {
            openPage(item.dataset.page);
        });
    });
}

/* PRAYER CHECKLIST */

function renderPrayerList() {
    const container = document.getElementById("prayerList");

    if (!container) return;

    const today = getToday();

    container.innerHTML = prayerNames.map((prayer, index) => {
        const done = today[index];

        return `
            <div class="prayer-item ${done ? "done" : ""}">
                <div class="prayer-info">
                    <div class="prayer-icon">${prayer.icon}</div>

                    <div>
                        <h4>${prayer.name}</h4>
                        <p>${done ? "Sudah ditandai" : "Belum ditandai"}</p>
                    </div>
                </div>

                <button
                    class="prayer-check"
                    data-prayer="${index}"
                    aria-label="Tandai ${prayer.name}"
                >
                    ${done ? "✓" : ""}
                </button>
            </div>
        `;
    }).join("");

    container.querySelectorAll("[data-prayer]").forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.prayer);

            today[index] = !today[index];

            saveData();
            renderAll();

            showToast(
                today[index]
                    ? "Checklist berhasil disimpan 🌿"
                    : "Checklist diperbarui"
            );
        });
    });
}

/* STREAK */

function getCompletedDays() {
    return Object.values(appData.history).filter(day => {
        return Array.isArray(day) &&
            day.length === 5 &&
            day.every(Boolean);
    }).length;
}

function getStreak() {
    let streak = 0;
    const date = new Date();

    while (true) {
        const key = getDateKey(date);
        const day = appData.history[key];

        if (
            !Array.isArray(day) ||
            day.length !== 5 ||
            !day.every(Boolean)
        ) {
            break;
        }

        streak++;
        date.setDate(date.getDate() - 1);
    }

    return streak;
}

/* DASHBOARD STATS */

function renderStats() {
    const today = getToday();

    const prayerCount = document.getElementById("prayerCount");
    const hadithCount = document.getElementById("hadithCount");
    const badgeCount = document.getElementById("badgeCount");
    const streakCount = document.getElementById("streakCount");

    const completed = today.filter(Boolean).length;

    if (prayerCount) {
        prayerCount.textContent = completed + "/5";
    }

    if (hadithCount) {
        hadithCount.textContent = hadiths.length;
    }

    if (streakCount) {
        streakCount.textContent = getStreak();
    }

    if (badgeCount) {
        badgeCount.textContent = getUnlockedBadges().length;
    }

    const todayDate = document.getElementById("todayDate");

    if (todayDate) {
        todayDate.textContent = formatDate();
    }
}

/* HADITH */

function renderDailyHadith() {
    const container = document.getElementById("dailyHadith");

    if (!container) return;

    const todayNumber = Math.floor(
        new Date().setHours(0, 0, 0, 0) / 86400000
    );

    const hadith = hadiths[
        ((todayNumber % hadiths.length) + hadiths.length) % hadiths.length
    ];

    container.innerHTML = `
        <div class="hadith-arabic">${hadith.arabic}</div>
        <div class="hadith-translation">
            "${hadith.translation}"
        </div>
        <div class="hadith-source">${hadith.source}</div>
    `;
}

function renderHadithList() {
    const container = document.getElementById("hadithList");

    if (!container) return;

    container.innerHTML = hadiths.map(hadith => `
        <article class="hadith-item">
            <h3>${hadith.title}</h3>

            <div class="hadith-arabic">
                ${hadith.arabic}
            </div>

            <p class="hadith-translation">
                "${hadith.translation}"
            </p>

            <div class="hadith-source">
                ${hadith.source}
            </div>
        </article>
    `).join("");
}

/* CALENDAR */

let calendarDate = new Date();

function renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    const monthLabel = document.getElementById("calendarMonth");

    if (!grid || !monthLabel) return;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    monthLabel.textContent = calendarDate.toLocaleDateString(
        "id-ID",
        {
            month: "long",
            year: "numeric"
        }
    );

    let html = `
        <div class="calendar-day">Min</div>
        <div class="calendar-day">Sen</div>
        <div class="calendar-day">Sel</div>
        <div class="calendar-day">Rab</div>
        <div class="calendar-day">Kam</div>
        <div class="calendar-day">Jum</div>
        <div class="calendar-day">Sab</div>
    `;

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const key = getDateKey(date);
        const record = appData.history[key];

        const isToday = key === getDateKey();
        const completed = Array.isArray(record) &&
            record.length === 5 &&
            record.every(Boolean);

        html += `
            <div class="calendar-day
                ${isToday ? "today" : ""}
                ${completed ? "completed" : ""}">
                ${day}
            </div>
        `;
    }

    grid.innerHTML = html;
}

function setupCalendar() {
    const previous = document.getElementById("prevMonth");
    const next = document.getElementById("nextMonth");

    if (previous) {
        previous.addEventListener("click", () => {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            renderCalendar();
        });
    }
}

/* BADGES */

function getUnlockedBadges() {
    const total = getCompletedDays();

    return badges.filter(badge => {
        if (badge.id === "first") return total >= 1;
        if (badge.id === "three") return total >= 3;
        if (badge.id === "seven") return total >= 7;
        if (badge.id === "fourteen") return total >= 14;
        if (badge.id === "thirty") return total >= 30;

        return false;
    });
}

function renderBadges() {
    const container = document.getElementById("badgeList");

    if (!container) return;

    const unlocked = getUnlockedBadges();

    container.innerHTML = badges.map(badge => {
        const isUnlocked = unlocked.some(
            item => item.id === badge.id
        );

        return `
            <div class="badge-card ${isUnlocked ? "" : "locked"}">
                <div class="badge-icon">
                    ${isUnlocked ? badge.icon : "🔒"}
                </div>

                <h3>${badge.name}</h3>
                <p>${badge.description}</p>

                <p style="margin-top:8px;color:var(--green)">
                    ${isUnlocked ? "Terbuka" : "Belum terbuka"}
                </p>
            </div>
        `;
    }).join("");
}

/* PRAYER SCHEDULE */

function renderSchedule() {
    const container = document.getElementById("scheduleList");

    if (!container) return;

    container.innerHTML = prayerNames.map(prayer => {
        const time = appData.schedule[prayer.name] || "";

        return `
            <div class="schedule-row">
                <label>${prayer.icon} ${prayer.name}</label>

                <input
                    type="time"
                    name="${prayer.name}"
                    value="${time}"
                >
            </div>
        `;
    }).join("");
}

function setupSchedule() {
    const button = document.getElementById("saveSchedule");

    if (!button) return;

    button.addEventListener("click", () => {
        const inputs = document.querySelectorAll(
            "#scheduleList input"
        );

        inputs.forEach(input => {
            appData.schedule[input.name] = input.value;
        });

        saveData();
        showToast("Jadwal berhasil disimpan 🌙");
    });
}

/* PROFILE */

function setupProfile() {
    const button = document.getElementById("profileBtn");

    if (!button) return;

    button.addEventListener("click", () => {
        showToast("SENW FIVEPRAYER • Versi 1.0");
    });
}

/* RENDER ALL */

function renderAll() {
    renderPrayerList();
    renderStats();
    renderDailyHadith();
    renderHadithList();
    renderCalendar();
    renderBadges();
    renderSchedule();

    saveData();
}

/* START APP */

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupCalendar();
    setupSchedule();
    setupProfile();

    renderAll();
});
