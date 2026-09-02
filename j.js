document.addEventListener("DOMContentLoaded", () => {
    function generateDynamicSchedule() {
        const today = new Date();
        const daysOfWeek = [
            "VASÁRNAP", "HÉTFŐ", "KEDD", "SZERDA", "CSÜTÖRTÖK", "PÉNTEK", "SZOMBAT"
        ];
        
        const workoutTypes = [
            {
                typeId: "push",
                title: "PUSH + BICEPSZ",
                tasks: [
                    { id: "incline_bench", text: "🏋️ Döntött pados fekvenyomás", desc: "2x12 ismétlés." },
                    { id: "bench_backoff", text: "🏋️ Fekvenyomás (Backoff)", desc: "1x10 ismétlés (könnyebb súllyal)." },
                    { id: "overhead_press", text: "🏋️ Vállból nyomás", desc: "2x8 ismétlés." },
                    { id: "lat_raise", text: "⚡ Oldalemelés", desc: "3x10 ismétlés." },
                    { id: "biceps_curl", text: "💪 Bicepszezés", desc: "2-3x11 ismétlés." }
                ]
            },
            {
                typeId: "pull",
                title: "PULL + TRICEPSZ",
                tasks: [
                    { id: "pullup_choice", text: "🏋️ Húzódzkodás (Negatív/Asszisztált)", desc: "3x4-6 ismétlés." },
                    { id: "rowing", text: "🏋️ Evezés", desc: "2x10 ismétlés." },
                    { id: "rev_plank", text: "🛡️ Reverse Plank Hold", desc: "2 sorozat megtartás." },
                    { id: "tri_overhead", text: "⚡ Fej feletti tricepsz nyújtás", desc: "2x12 ismétlés." }
                ]
            },
            {
                typeId: "upper",
                title: "FELSŐ NAP",
                tasks: [
                    { id: "bench", text: "🏋️ Fekvenyomás", desc: "3x7 ismétlés." },
                    { id: "pullup_choice", text: "🏋️ Húzódzkodás", desc: "3x4-6 ismétlés." },
                    { id: "deadlift", text: "🏋️ Felhúzás / Evezés", desc: "3x10 ismétlés." },
                    { id: "vsit", text: "🛡️ V-Sit Hold", desc: "2 sorozat." },
                    { id: "pushup_cooldown", text: "⚡ Levezető: Fekvőtámasz", desc: "1-2 sorozat bukásig." }
                ]
            }
        ];

        const schedule = {};
        const baseDate = new Date(2026, 0, 1);
        const totalDaysToGenerate = 730;

        for (let i = 0; i < totalDaysToGenerate; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            
            const dayName = daysOfWeek[currentDate.getDay()];
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${year}.${month}.${day}`;

            const diffTime = currentDate - baseDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            let activeWorkoutCounter = 0;
            for (let d = 0; d <= diffDays; d++) {
                if (d % 2 === 0) {
                    if (d < diffDays) activeWorkoutCounter++;
                }
            }

            if (diffDays % 2 === 0) {
                const currentWorkout = workoutTypes[activeWorkoutCounter % workoutTypes.length];
                const uniqueTasks = currentWorkout.tasks.map(task => ({
                    ...task,
                    uniqueId: `${dateStr}_${currentWorkout.typeId}_${task.id}`
                }));

                schedule[i] = {
                    dateKey: dateStr,
                    title: `💥 ${dayName} (${dateStr}): ${currentWorkout.title}`,
                    tasks: uniqueTasks
                };
            } else {
                schedule[i] = {
                    dateKey: dateStr,
                    title: `🧘 ${dayName} (${dateStr}): PIHENŐNAP`,
                    tasks: [{ uniqueId: `${dateStr}_rest_${i}`, text: "☕ Regeneráció", desc: "Nyújtás, pihenés, izmok pihentetése." }]
                };
            }
        }

        return schedule;
    }

    const schedule = generateDynamicSchedule();
    const totalScheduleDays = 730;

    // Összes egyedi gyakorlat listája a könyvecskéhez (név: ismétlés, kg formátumhoz)
    const allExercisesList = [
        { id: "incline_bench", name: "Döntött pados fekvenyomás" },
        { id: "bench_backoff", name: "Fekvenyomás (Backoff)" },
        { id: "overhead_press", name: "Vállból nyomás" },
        { id: "lat_raise", name: "Oldalemelés" },
        { id: "biceps_curl", name: "Bicepszezés" },
        { id: "pullup_choice", name: "Húzódzkodás" },
        { id: "rowing", name: "Evezés" },
        { id: "rev_plank", name: "Reverse Plank Hold" },
        { id: "tri_overhead", name: "Fej feletti tricepsz nyújtás" },
        { id: "bench", name: "Fekvenyomás" },
        { id: "deadlift", name: "Felhúzás / Evezés" },
        { id: "vsit", name: "V-Sit Hold" },
        { id: "pushup_cooldown", name: "Fekvőtámasz" }
    ];

    let currentDayIndex = 0;
    const label = document.getElementById("current-day-label");
    const container = document.getElementById("task-container");
    const prevBtn = document.getElementById("prev-day");
    const nextBtn = document.getElementById("next-day");

    const timerDisplay = document.getElementById("rest-timer-count");
    const timerSlider = document.getElementById("timer-slider");
    const sliderValLabel = document.getElementById("slider-val-label");
    const startTimerBtn = document.getElementById("start-timer-btn");
    const resetTimerBtn = document.getElementById("reset-timer-btn");

    let timerInterval = null;
    let secondsLeft = parseInt(timerSlider.value, 10);

    const notesBtn = document.getElementById("notes-toggle-btn");
    const notesModal = document.getElementById("notes-modal");
    const notesInput = document.getElementById("notes-input");
    const saveNotesBtn = document.getElementById("save-notes-btn");
    const closeNotesBtn = document.getElementById("close-notes-btn");

    let savedData = JSON.parse(localStorage.getItem("friend_workout_data")) || {};
    let exerciseLogs = JSON.parse(localStorage.getItem("friend_exercise_logs")) || {};

    function renderDay(index) {
        const dayData = schedule[index];
        label.innerText = dayData.title;
        container.innerHTML = "";

        dayData.tasks.forEach(task => {
            const isDone = savedData[task.uniqueId]?.done || false;

            const li = document.createElement("li");
            li.className = `task-item ${isDone ? 'completed' : ''}`;

            li.innerHTML = `
                <div class="task-row-top">
                    <span class="task-text">${task.text}</span>
                    <div class="task-actions">
                        <button type="button" class="focus-btn" onclick="toggleDesc('${task.uniqueId}')">Info</button>
                        <button type="button" class="checkbox-btn" onclick="toggleDone('${task.uniqueId}', ${index})">
                            ${isDone ? '✓ Kész' : 'Kész'}
                        </button>
                    </div>
                </div>
                <div class="plan-box" id="desc-${task.uniqueId}">
                    ${task.desc}
                </div>
            `;
            container.appendChild(li);
        });
    }

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
                startTimerBtn.innerText = "▶ INDÍTÁS";
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
            startTimerBtn.innerText = "▶ INDÍTÁS";
        } else {
            startTimer();
        }
    });

    resetTimerBtn.addEventListener("click", () => {
        stopTimer();
        secondsLeft = parseInt(timerSlider.value, 10);
        updateDisplay();
        startTimerBtn.innerText = "▶ INDÍTÁS";
    });

    // Könyvecske megnyitása (összes exercise listázása: név: ismétlés, kg formátumban)
    notesBtn.addEventListener("click", () => {
        notesModal.style.display = "flex";
        
        let containerDiv = document.getElementById("exercise-logs-container");
        if (!containerDiv) {
            containerDiv = document.createElement("div");
            containerDiv.id = "exercise-logs-container";
            if (notesInput) {
                notesInput.parentNode.insertBefore(containerDiv, notesInput);
                notesInput.style.display = "none";
            }
        }

        let innerHTML = `<div style="max-height:350px; overflow-y:auto; text-align:left; color:#000;"><h4>🏋️ Gyakorlatok Adatai (Név: Ismétlés, Súly)</h4>`;
        allExercisesList.forEach(ex => {
            const data = exerciseLogs[ex.id] || { reps: "", weight: "" };
            innerHTML += `
                <div style="margin-bottom:12px; padding:8px; background:#f1f1f1; border-radius:5px;">
                    <div style="font-weight:bold; margin-bottom:4px;">${ex.name}</div>
                    <label>Ismétlés: <input type="text" id="ex_r_${ex.id}" value="${data.reps}" style="width:60px; padding:3px;" /></label> &nbsp;
                    <label>Kg: <input type="number" id="ex_w_${ex.id}" value="${data.weight}" style="width:60px; padding:3px;" /></label>
                </div>
            `;
        });
        innerHTML += `</div>`;
        containerDiv.innerHTML = innerHTML;
    });

    saveNotesBtn.addEventListener("click", () => {
        allExercisesList.forEach(ex => {
            const rInput = document.getElementById(`ex_r_${ex.id}`);
            const wInput = document.getElementById(`ex_w_${ex.id}`);
            if (rInput && wInput) {
                if (!exerciseLogs[ex.id]) exerciseLogs[ex.id] = {};
                exerciseLogs[ex.id].reps = rInput.value;
                exerciseLogs[ex.id].weight = wInput.value;
            }
        });
        localStorage.setItem("friend_exercise_logs", JSON.stringify(exerciseLogs));
        notesModal.style.display = "none";
    });

    closeNotesBtn.addEventListener("click", () => {
        notesModal.style.display = "none";
    });

    window.toggleDesc = (uniqueId) => {
        const box = document.getElementById(`desc-${uniqueId}`);
        if (box) box.style.display = box.style.display === "block" ? "none" : "block";
    };

    window.toggleDone = (uniqueId, dayIdx) => {
        if (!savedData[uniqueId]) savedData[uniqueId] = {};
        const isNowDone = !savedData[uniqueId].done;
        savedData[uniqueId].done = isNowDone;
        localStorage.setItem("friend_workout_data", JSON.stringify(savedData));
        
        renderDay(dayIdx);

        if (isNowDone) {
            secondsLeft = parseInt(timerSlider.value, 10);
            updateDisplay();
            startTimer();
        }
    };

    prevBtn.addEventListener("click", () => {
        currentDayIndex = (currentDayIndex - 1 + totalScheduleDays) % totalScheduleDays;
        renderDay(currentDayIndex);
    });

    nextBtn.addEventListener("click", () => {
        currentDayIndex = (currentDayIndex + 1) % totalScheduleDays;
        renderDay(currentDayIndex);
    });

    renderDay(currentDayIndex);
    updateDisplay();
});
