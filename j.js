document.addEventListener("DOMContentLoaded", () => {
    const schedule = {
        0: {
            title: "💥 HÉTFŐ: PUSH + BICEPSZ",
            tasks: [
                { id: "p1_incline_bench", text: "🏋️ Döntött pados fekvenyomás", desc: "2x12 ismétlés.", hasWeight: true },
                { id: "p1_bench_backoff", text: "🏋️ Fekvenyomás (Backoff)", desc: "1x10 ismétlés (könnyebb súllyal).", hasWeight: true },
                { id: "p1_overhead_press", text: "🏋️ Vállból nyomás", desc: "2x8 ismétlés.", hasWeight: true },
                { id: "p1_lat_raise", text: "⚡ Oldalemelés", desc: "3x10 ismétlés.", hasWeight: true },
                { id: "p1_biceps_curl", text: "💪 Bicepszezés", desc: "2-3x11 ismétlés.", hasWeight: true }
            ]
        },
        1: { title: "🧘 KEDD: PIHENŐNAP", tasks: [{ id: "rest_tue", text: "☕ Regeneráció", desc: "Nyújtás, pihenés.", hasWeight: false }] },
        2: {
            title: "💥 SZERDA: PULL + TRICEPSZ",
            tasks: [
                { id: "p2_pullup_choice", text: "🏋️ Húzódzkodás (Negatív/Asszisztált)", desc: "3x4-6 ismétlés.", hasWeight: false },
                { id: "p2_rowing", text: "🏋️ Evezés", desc: "2x10 ismétlés.", hasWeight: true },
                { id: "p2_rev_plank", text: "🛡️ Reverse Plank Hold", desc: "2 sorozat megtartás.", hasWeight: false },
                { id: "p2_tri_overhead", text: "⚡ Fej feletti tricepsz nyújtás", desc: "2x12 ismétlés.", hasWeight: true }
            ]
        },
        3: { title: "🧘 CSÜTÖRTÖK: PIHENŐNAP", tasks: [{ id: "rest_thu", text: "☕ Regeneráció", desc: "Izmok pihentetése.", hasWeight: false }] },
        4: {
            title: "💥 PÉNTEK: FELSŐ NAP",
            tasks: [
                { id: "p3_bench", text: "🏋️ Fekvenyomás", desc: "3x7 ismétlés.", hasWeight: true },
                { id: "p3_pullup_choice", text: "🏋️ Húzódzkodás", desc: "3x4-6 ismétlés.", hasWeight: false },
                { id: "p3_deadlift", text: "🏋️ Felhúzás / Evezés", desc: "3x10 ismétlés.", hasWeight: true },
                { id: "p3_vsit", text: "🛡️ V-Sit Hold", desc: "2 sorozat.", hasWeight: false },
                { id: "p3_pushup_cooldown", text: "⚡ Levezető: Fekvőtámasz", desc: "1-2 sorozat bukásig.", hasWeight: false }
            ]
        },
        5: { title: "🧘 SZOMBAT: PIHENŐNAP", tasks: [{ id: "rest_sat", text: "☕ Pihenés", desc: "Hétvégi feltöltődés.", hasWeight: false }] },
        6: { title: "🧘 VASÁRNAP: PIHENŐNAP", tasks: [{ id: "rest_sun", text: "☕ Pihenés", desc: "Felkészülés az új hétre.", hasWeight: false }] }
    };

    const defaultQA = 
`❓ 1. KÉRDÉS: Milyen súllyal kezdjem az edzést?
PROFI VÁLASZ: Olyan súlyt válassz, amivel az előírt ismétlésszámot szabályosan meg tudod csinálni, és az utolsó 2 ismétlés már nehéz.

❓ 2. KÉRDÉS: Mennyi pihenőt tartsak a sorozatok között?
PROFI VÁLASZ: Összetett gyakorlatoknál 90-120 mp, kisebb izolációs gyakorlatoknál 60-90 mp.

❓ 3. KÉRDÉS: Mikor növeljem a súlyokat?
PROFI VÁLASZ: Ha az adott súllyal eléred a felső határt minden sorozatban, emelj 1-2.5 kg-ot!`;

    let currentDayIndex = 0;
    const label = document.getElementById("current-day-label");
    const container = document.getElementById("task-container");
    const prevBtn = document.getElementById("prev-day");
    const nextBtn = document.getElementById("next-day");

    // Stopper elemek
    const timerDisplay = document.getElementById("rest-timer-count");
    const timerSlider = document.getElementById("timer-slider");
    const sliderValLabel = document.getElementById("slider-val-label");
    const startTimerBtn = document.getElementById("start-timer-btn");
    const resetTimerBtn = document.getElementById("reset-timer-btn");

    let timerInterval = null;
    let secondsLeft = parseInt(timerSlider.value, 10);

    // Jegyzet elemek
    const notesBtn = document.getElementById("notes-toggle-btn");
    const notesModal = document.getElementById("notes-modal");
    const notesInput = document.getElementById("notes-input");
    const saveNotesBtn = document.getElementById("save-notes-btn");
    const closeNotesBtn = document.getElementById("close-notes-btn");

    // --- ÚJ HÉT / DÁTUM ALAPÚ LOGIKA ---
    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}-W${weekNo}`;
    }

    const currentWeekStr = getWeekNumber(new Date());
    let storedStorage = JSON.parse(localStorage.getItem("friend_workout_data")) || {};
    
    // Ellenőrizzük, hogy elmentettük-e már a mostani hetet
    let savedData = {};
    if (storedStorage.week === currentWeekStr) {
        savedData = storedStorage.data || {};
    } else {
        // Ha új hét van, átmentjük a korábbi súlyokat, de a pipákat (done) töröljük!
        const oldData = storedStorage.data || {};
        savedData = {};
        for (let key in oldData) {
            savedData[key] = {
                weight: oldData[key].weight, // Súly megmarad
                done: false // Pipák törlődnek az új héten
            };
        }
        saveDataToStorage();
    }

    function saveDataToStorage() {
        const payload = {
            week: currentWeekStr,
            data: savedData
        };
        localStorage.setItem("friend_workout_data", JSON.stringify(payload));
    }
    // ------------------------------------

    function renderDay(index) {
        const dayData = schedule[index];
        label.innerText = dayData.title;
        container.innerHTML = "";

        dayData.tasks.forEach(task => {
            const isDone = savedData[task.id]?.done || false;
            const weightVal = savedData[task.id]?.weight !== undefined ? savedData[task.id].weight : 0;

            const li = document.createElement("li");
            li.className = `task-item ${isDone ? 'completed' : ''}`;

            li.innerHTML = `
                <div class="task-row-top">
                    <span class="task-text">${task.text}</span>
                    <div class="task-actions">
                        <button type="button" class="focus-btn" onclick="toggleDesc('${task.id}')">Info</button>
                        <button type="button" class="checkbox-btn" onclick="toggleDone('${task.id}', ${index})">
                            ${isDone ? '✓ Kész' : 'Kész'}
                        </button>
                    </div>
                </div>
                ${task.hasWeight ? `
                    <div class="weight-control-row">
                        <span class="weight-label">Súly:</span>
                        <div class="weight-picker">
                            <button type="button" class="weight-btn" onclick="adjustWeight('${task.id}', -2.5, ${index})">-2.5</button>
                            <button type="button" class="weight-btn" onclick="adjustWeight('${task.id}', -1, ${index})">-1</button>
                            <span class="weight-display-val">${weightVal} <small>kg</small></span>
                            <button type="button" class="weight-btn" onclick="adjustWeight('${task.id}', 1, ${index})">+1</button>
                            <button type="button" class="weight-btn" onclick="adjustWeight('${task.id}', 2.5, ${index})">+2.5</button>
                        </div>
                    </div>
                ` : ''}
                <div class="plan-box" id="desc-${task.id}">
                    ${task.desc}
                </div>
            `;
            container.appendChild(li);
        });
    }

    // --- SÚLY BEÁLLÍTÁS ---
    window.adjustWeight = (id, delta, dayIdx) => {
        if (!savedData[id]) savedData[id] = {};
        let currentWeight = parseFloat(savedData[id].weight) || 0;
        let newWeight = Math.max(0, currentWeight + delta);
        savedData[id].weight = Math.round(newWeight * 10) / 10;
        saveDataToStorage();
        renderDay(dayIdx);
    };

    // --- STOPPER ÉS IDŐÁLLÍTÓ LOGIKA ---
    function updateDisplay() {
        const m = Math.floor(secondsLeft / 60);
        const s = secondsLeft % 60;
        timerDisplay.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        startTimerBtn.innerText = "▶ INDÍTÁS";
    }

    function startTimer() {
        stopTimer();
        if (secondsLeft <= 0) {
            secondsLeft = parseInt(timerSlider.value, 10);
        }
        startTimerBtn.innerText = "⏸ PAUZA";
        timerInterval = setInterval(() => {
            secondsLeft--;
            updateDisplay();

            if (secondsLeft <= 0) {
                stopTimer();
                timerDisplay.innerText = "00:00 - LEJÁRT!";
            }
        }, 1000);
    }

    timerSlider.addEventListener("input", (e) => {
        const newVal = parseInt(e.target.value, 10);
        sliderValLabel.innerText = newVal;
        stopTimer();
        secondsLeft = newVal;
        updateDisplay();
    });

    window.setPresetTime = (sec) => {
        stopTimer();
        timerSlider.value = sec;
        sliderValLabel.innerText = sec;
        secondsLeft = sec;
        updateDisplay();
    };

    startTimerBtn.addEventListener("click", () => {
        if (timerInterval) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    resetTimerBtn.addEventListener("click", () => {
        stopTimer();
        secondsLeft = parseInt(timerSlider.value, 10);
        updateDisplay();
    });

    // --- JEGYZET LOGIKA ---
    notesBtn.addEventListener("click", () => {
        const savedNotes = localStorage.getItem("friend_workout_notes");
        notesInput.value = savedNotes !== null ? savedNotes : defaultQA;
        notesModal.style.display = "flex";
    });

    saveNotesBtn.addEventListener("click", () => {
        localStorage.setItem("friend_workout_notes", notesInput.value);
        notesModal.style.display = "none";
    });

    closeNotesBtn.addEventListener("click", () => {
        notesModal.style.display = "none";
    });

    // --- KÁRTYA ESEMÉNYEK ---
    window.toggleDesc = (id) => {
        const box = document.getElementById(`desc-${id}`);
        if (box) box.style.display = box.style.display === "block" ? "none" : "block";
    };

    window.toggleDone = (id, dayIdx) => {
        if (!savedData[id]) savedData[id] = {};
        const isNowDone = !savedData[id].done;
        savedData[id].done = isNowDone;
        saveDataToStorage();
        
        renderDay(dayIdx);

        if (isNowDone) {
            secondsLeft = parseInt(timerSlider.value, 10);
            updateDisplay();
            startTimer();
        }
    };

    prevBtn.addEventListener("click", () => {
        currentDayIndex = (currentDayIndex - 1 + 7) % 7;
        renderDay(currentDayIndex);
    });

    nextBtn.addEventListener("click", () => {
        currentDayIndex = (currentDayIndex + 1) % 7;
        renderDay(currentDayIndex);
    });

    renderDay(currentDayIndex);
    updateDisplay();
});
