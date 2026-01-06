// Utility functions (same as before)
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function setUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getLogs(type) {
    const userEmail = localStorage.getItem('session');
    return JSON.parse(localStorage.getItem(`${userEmail}_${type}_logs`)) || [];
}

function setLogs(type, logs) {
    const userEmail = localStorage.getItem('session');
    localStorage.setItem(`${userEmail}_${type}_logs`, JSON.stringify(logs));
}

function getPoints() {
    const userEmail = localStorage.getItem('session');
    return parseInt(localStorage.getItem(`${userEmail}_points`)) || 0;
}

function setPoints(points) {
    const userEmail = localStorage.getItem('session');
    localStorage.setItem(`${userEmail}_points`, points);
}

function getBadges() {
    const userEmail = localStorage.getItem('session');
    return JSON.parse(localStorage.getItem(`${userEmail}_badges`)) || [];
}

function setBadges(badges) {
    const userEmail = localStorage.getItem('session');
    localStorage.setItem(`${userEmail}_badges`, JSON.stringify(badges));
}

// Registration & Login (same, but add initial points/badges on register)
function registerUser(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match! Try again, champ.');
        return;
    }

    const users = getUsers();
    if (users.find(u => u.email === email)) {
        alert('User already exists! Sneaky...');
        return;
    }

    users.push({ email, password });
    setUsers(users);
    setPoints(0); // Init for new user
    setBadges([]);
    alert('Welcome aboard! Start logging to earn your first badge. 🎖️');
    window.location.href = 'index.html';
}

function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        alert('Invalid credentials! Did you forget your zen password?');
        return;
    }

    localStorage.setItem('session', email);
    window.location.href = 'dashboard.html';
}

// Session & Logout
function checkSession() {
    if (!localStorage.getItem('session')) {
        window.location.href = 'index.html';
    }
}

function logoutUser() {
    localStorage.removeItem('session');
    window.location.href = 'index.html';
}

// Log Sleep with fun & points
function logSleep(event) {
    event.preventDefault();
    const bedtime = new Date(document.getElementById('bedtime').value);
    const waketime = new Date(document.getElementById('waketime').value);
    const quality = parseInt(document.getElementById('quality').value);

    if (waketime <= bedtime) {
        alert('Wake time must be after bedtime! Time travel not supported yet. ⏰');
        return;
    }

    const duration = (waketime - bedtime) / (1000 * 60 * 60);
    const logs = getLogs('sleep');
    logs.push({ bedtime: bedtime.toISOString(), waketime: waketime.toISOString(), quality, duration });
    setLogs('sleep', logs);

    // Add points & check badges
    let points = getPoints();
    points += quality * 2; // e.g., +20 for quality 10
    setPoints(points);
    checkBadges('sleep', duration, quality);

    const funMsg = duration >= 7 ? 'You slept like a pro! Sweet dreams paid off. 😴✨' : 'Short sleep? Nap power-up incoming! 💤';
    alert(`${funMsg} +${quality * 2} Zen Points!`);
    document.getElementById('sleepForm').reset();
    updateGamification();
}

// Log Focus with fun & points
function logFocus(event) {
    event.preventDefault();
    const starttime = new Date(document.getElementById('starttime').value);
    const endtime = new Date(document.getElementById('endtime').value);
    const productivity = parseInt(document.getElementById('productivity').value);
    const environment = document.getElementById('environment').value;

    if (endtime <= starttime) {
        alert('End time must be after start! No wormholes allowed. 🕳️');
        return;
    }

    const duration = (endtime - starttime) / (1000 * 60 * 60);
    const logs = getLogs('focus');
    logs.push({ starttime: starttime.toISOString(), endtime: endtime.toISOString(), productivity, environment, duration });
    setLogs('focus', logs);

    // Add points & check badges
    let points = getPoints();
    points += productivity * 3;
    setPoints(points);
    checkBadges('focus', duration, productivity);

    const funMsg = productivity >= 8 ? 'Laser focus! You crushed it like a productivity ninja. 🥷' : 'Good effort! Next time, add coffee for superpowers. ☕';
    alert(`${funMsg} +${productivity * 3} Zen Points!`);
    document.getElementById('focusForm').reset();
    updateGamification();
}

// Helper for env chips
function addEnv(text) {
    const envInput = document.getElementById('environment');
    envInput.value += (envInput.value ? ', ' : '') + text;
}

// Relax Mode
function toggleRelax() {
    const audio = document.getElementById('relaxAudio');
    if (audio.paused) {
        audio.play();
        alert('Entering Relax Mode... Breathe in, breathe out. 🌿');
    } else {
        audio.pause();
        audio.currentTime = 0;
    }
}

// Gamification Update
function updateGamification() {
    const points = getPoints();
    const badges = getBadges();
    const level = points < 50 ? 'Couch Potato 🥔' : points < 200 ? 'Rising Star ⭐' : 'Superhuman 💪';
    const progress = (points % 100); // Mock level progress

    if (document.getElementById('points')) {
        document.getElementById('points').textContent = points;
        document.getElementById('level').textContent = level;
        document.getElementById('progress').value = progress;

        let badgesHtml = '<h3>Badges 🎖️</h3>';
        badges.forEach(b => badgesHtml += `<span class="chip">${b}</span> `);
        document.getElementById('badges').innerHTML = badgesHtml || '<p>Earn your first badge by logging!</p>';
    }
}

// Check & Award Badges
function checkBadges(type, duration, score) {
    const badges = getBadges();
    if (type === 'sleep' && duration >= 8 && score >= 8 && !badges.includes('Sleep Ninja 🥷')) {
        badges.push('Sleep Ninja 🥷');
        alert('Badge Unlocked: Sleep Ninja! You mastered the art of Zzz. 😴');
    }
    if (type === 'focus' && duration >= 2 && score >= 9 && !badges.includes('Focus Wizard 🧙')) {
        badges.push('Focus Wizard 🧙');
        alert('Badge Unlocked: Focus Wizard! Abracadabra—productivity magic! ✨');
    }
    setBadges(badges);
}

// Display Insights with Charts & Fun Suggestions
function displayInsights() {
    const sleepLogs = getLogs('sleep');
    const focusLogs = getLogs('focus');

    // Sleep Insights & Chart
    let sleepHtml = '';
    if (sleepLogs.length > 0) {
        const avgDuration = sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length;
        const avgQuality = sleepLogs.reduce((sum, log) => sum + log.quality, 0) / sleepLogs.length;
        sleepHtml += `<p>Avg Sleep: ${avgDuration.toFixed(2)} hrs | Quality: ${avgQuality.toFixed(1)}/10</p>`;
        const sleepData = sleepLogs.map(log => log.duration);
        new Chart(document.getElementById('sleepChart'), {
            type: 'line',
            data: { labels: sleepLogs.map((_, i) => `Day ${i+1}`), datasets: [{ label: 'Sleep Hours', data: sleepData, borderColor: '#0277bd' }] },
            options: { scales: { y: { beginAtZero: true } } }
        });
    } else {
        sleepHtml += '<p>No sleeps yet—dream big!</p>';
    }
    document.getElementById('sleepInsights').innerHTML = sleepHtml;

    // Focus Insights & Chart
    let focusHtml = '';
    if (focusLogs.length > 0) {
        const totalHours = focusLogs.reduce((sum, log) => sum + log.duration, 0);
        const avgProductivity = focusLogs.reduce((sum, log) => sum + log.productivity, 0) / focusLogs.length;
        focusHtml += `<p>Total Hours: ${totalHours.toFixed(2)} | Avg Productivity: ${avgProductivity.toFixed(1)}/10</p>`;
        const focusData = focusLogs.map(log => log.productivity);
        new Chart(document.getElementById('focusChart'), {
            type: 'bar',
            data: { labels: focusLogs.map((_, i) => `Session ${i+1}`), datasets: [{ label: 'Productivity', data: focusData, backgroundColor: '#4caf50' }] },
            options: { scales: { y: { beginAtZero: true, max: 10 } } }
        });
    } else {
        focusHtml += '<p>No focus logs—time to zone in!</p>';
    }
    document.getElementById('focusInsights').innerHTML = focusHtml;

    // Fun Suggestions
    let suggestions = '<h2>Zen Tips & Laughs 😂</h2>';
    if (sleepLogs.length > 0) {
        const avgDuration = sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length;
        if (avgDuration < 7) suggestions += '<p>Get 7+ hours: Even Einstein napped! Try counting sheep... or llamas for fun. 🦙</p>';
    }
    if (focusLogs.length > 0) {
        const avgProductivity = focusLogs.reduce((sum, log) => sum + log.productivity, 0) / focusLogs.length;
        if (avgProductivity < 7) suggestions += '<p>Boost focus: Ditch distractions—unless it\'s a funny cat video break. 🐱</p>';
        if (focusLogs.some(log => log.environment.includes('noise'))) suggestions += '<p>Noisy? Earplugs or white noise: Pretend you\'re in a zen bubble. 🫧</p>';
    }
    if (suggestions === '<h2>Zen Tips & Laughs 😂</h2>') suggestions += '<p>Log more for custom giggles and tips!</p>';
    document.getElementById('suggestions').innerHTML = suggestions;
}