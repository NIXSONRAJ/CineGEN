// ==========================================================================
// CINEGEN OS 1.0.0 | MASTER JAVASCRIPT LOGIC
// A Product of Ash Creations Company
// ==========================================================================

// --- 1. THEME ENGINE & MODALS ---
document.addEventListener("DOMContentLoaded", () => {
    // Load saved theme on startup
    const savedTheme = localStorage.getItem('cinegen_theme');
    if (savedTheme) {
        document.body.className = savedTheme;
    }
});

function changeTheme(themeName) {
    document.body.classList.remove('theme-matrix', 'theme-light', 'theme-contrast');
    if (themeName !== 'theme-default') {
        document.body.classList.add(themeName);
    }
    localStorage.setItem('cinegen_theme', themeName);
}

function openModal(modalId) {
    document.getElementById('profileMenu').classList.remove('show');
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// --- 2. GLOBAL NAVIGATION & MENUS ---
function toggleProfileMenu() {
    const menu = document.getElementById('profileMenu');
    menu.classList.toggle('show');
}

// Close dropdown if clicking outside
document.addEventListener('click', function(event) {
    const menu = document.getElementById('profileMenu');
    const toggleBtn = document.querySelector('.menu-toggle');
    if (menu && menu.classList.contains('show')) {
        if (!menu.contains(event.target) && !toggleBtn.contains(event.target)) {
            menu.classList.remove('show');
        }
    }
});

function switchCell(cellId) {
    // Hide all cells and remove active class from sidebar items
    document.querySelectorAll('.cell-content').forEach(cell => cell.classList.remove('active'));
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));

    // Activate selected cell and sidebar item
    const activeCell = document.getElementById('cell-' + cellId);
    const activeNav = document.getElementById('nav-' + cellId);
    
    if (activeCell) activeCell.classList.add('active');
    if (activeNav) activeNav.classList.add('active');
}

// --- 3. THE VOICE ENGINE (HUSKY / ANGELIC PROFILE) ---
let voiceEnabled = false;
const synth = window.speechSynthesis;

function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    const btn = document.getElementById('voice-toggle');
    if (btn) {
        if(voiceEnabled) {
            btn.classList.add('active');
            btn.style.color = "var(--accent-blue)";
            speakText("Neural voice activated. I am listening.");
        } else {
            btn.classList.remove('active');
            btn.style.color = "white";
            synth.cancel();
        }
    }
}

function speakText(text) {
    if (!voiceEnabled) return;
    synth.cancel(); // Stop current speech
    
    // Clean markdown characters for the voice synthesizer
    let cleanText = text.replace(/[*_#\[\]]/g, ''); 
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Hunt for premium female voice profile
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => 
        v.name.includes('Google UK English Female') || 
        v.name.includes('Samantha') || 
        v.name.includes('Zira') || 
        v.name.includes('Female')
    );
    if(preferredVoice) utterance.voice = preferredVoice;
    
    utterance.pitch = 0.8; // Husky (lower pitch)
    utterance.rate = 0.85; // Angelic (calm, slightly slower)
    
    synth.speak(utterance);
}

// Ensure voices load perfectly on initial browser render
synth.onvoiceschanged = function() {};

// --- 4. CHAT UI HELPER (Used by Analyst & Genie) ---
function appendBubble(containerId, text, sender) {
    const container = document.getElementById(containerId);
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.id = 'msg-' + Date.now();
    // Simple markdown parsing for bold text
    bubble.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight; // Auto-scroll to bottom
    return bubble.id;
}

// --- 5. SCRIPT ANALYST AI LOGIC ---
async function sendToAnalyst() {
    const inputEl = document.getElementById('analyst-input');
    const message = inputEl.value.trim();
    if (!message) return;

    appendBubble('analyst-history', message, 'user');
    inputEl.value = '';

    const loadingId = appendBubble('analyst-history', "Analyzing narrative logic...", 'ai');

    try {
        const response = await fetch('/api/chat/analyst', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        
        document.getElementById(loadingId).remove();
        appendBubble('analyst-history', data.response, 'ai');
        speakText(data.response);
    } catch (error) {
        document.getElementById(loadingId).remove();
        appendBubble('analyst-history', "Connection error. Please check system logs.", 'ai');
    }
}

// --- 6. CINE GENIE AI LOGIC ---
async function sendToGenie() {
    const inputEl = document.getElementById('genie-input');
    const message = inputEl.value.trim();
    if (!message) return;

    appendBubble('genie-history', message, 'user');
    inputEl.value = '';

    const loadingId = appendBubble('genie-history', "Consulting the archives...", 'ai');
    // Style loading bubble to match the Genie's cyan theme
    document.getElementById(loadingId).style.background = "rgba(0, 229, 255, 0.1)";
    document.getElementById(loadingId).style.borderColor = "rgba(0, 229, 255, 0.2)";

    try {
        const response = await fetch('/api/chat/genie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        
        document.getElementById(loadingId).remove();
        
        const responseId = appendBubble('genie-history', data.response, 'ai');
        // Style response bubble to match the Genie's cyan theme
        document.getElementById(responseId).style.background = "rgba(0, 229, 255, 0.1)";
        document.getElementById(responseId).style.borderColor = "rgba(0, 229, 255, 0.2)";
        
        speakText(data.response);
    } catch (error) {
        document.getElementById(loadingId).remove();
        appendBubble('genie-history', "Connection error. The archives are sealed.", 'ai');
    }
}

// --- 7. DEEP LORE MOVIE EXPLORER LOGIC ---
async function searchMovie() {
    const inputEl = document.getElementById('explorer-input');
    const query = inputEl.value.trim();
    if (!query) return;

    document.getElementById('explorer-results').style.display = 'none';
    document.getElementById('explorer-loading').style.display = 'block';

    try {
        const response = await fetch('/api/explore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        
        const data = await response.json();
        document.getElementById('explorer-loading').style.display = 'none';
        
        if (data.error) {
            alert(data.error);
            return;
        }

        document.getElementById('res-poster').src = data.poster || 'https://via.placeholder.com/500x750/000000/FFFFFF/?text=Image+Classified';
        document.getElementById('res-title').innerText = data.title;
        document.getElementById('res-rating').innerText = data.rating;
        document.getElementById('res-date').innerText = data.release_date;
        document.getElementById('res-plot').innerText = data.tmdb_plot;
        document.getElementById('res-lore').innerText = data.wiki_lore;
        
        const resultsGrid = document.getElementById('explorer-results');
        resultsGrid.style.display = 'grid';
        resultsGrid.style.animation = 'slideFadeIn 0.5s ease forwards';

        speakText(`Data retrieved for ${data.title}.`);
    } catch (error) {
        document.getElementById('explorer-loading').style.display = 'none';
        alert("Critical failure connecting to the neural backend.");
    }
}

// --- 8. FILE MANAGER UPLOAD LOGIC ---
async function uploadDataset() {
    const fileInput = document.getElementById('dataset-upload');
    const statusText = document.getElementById('upload-status');
    const tableContainer = document.getElementById('data-table-container');

    if (fileInput.files.length === 0) {
        statusText.innerText = "Please select a file first.";
        statusText.style.color = "#ff4444";
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("dataset", file);

    statusText.innerText = "Parsing data matrix...";
    statusText.style.color = "var(--accent-blue)";

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData // No Content-Type header needed for FormData
        });

        const data = await response.json();

        if (data.error) {
            statusText.innerText = data.error;
            statusText.style.color = "#ff4444";
        } else {
            statusText.innerText = data.message;
            statusText.style.color = "var(--accent-violet)";
            tableContainer.innerHTML = data.table_html;
            speakText("Data matrix parsed and uploaded successfully.");
        }
    } catch (error) {
        statusText.innerText = "Upload failed. Check system logs.";
        statusText.style.color = "#ff4444";
    }
}

// --- 9. PROGRAMMING IDE SIMULATION LOGIC ---
async function runCode() {
    const code = document.getElementById('ide-code').value;
    const language = document.getElementById('ide-language').value;
    const terminal = document.getElementById('ide-terminal');

    terminal.innerText = `> Executing ${language.toUpperCase()} script...\n> Please wait...`;
    terminal.style.color = "#a78bfa"; // Loading color

    try {
        const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, language: language })
        });
        
        const data = await response.json();
        
        terminal.innerText = data.output;
        terminal.style.color = "#4ade80"; // Success terminal green
        terminal.scrollTop = terminal.scrollHeight;
        
        speakText("Script execution completed.");
    } catch (error) {
        terminal.innerText = "> FATAL ERROR: Unable to reach execution server.";
        terminal.style.color = "#ff4444";
    }
}

// --- 10. WORK QUEUE (SCENE SAVING & LOADING) LOGIC ---
async function saveScene() {
    const sceneData = {
        setting: document.getElementById('pb-setting').value,
        location: document.getElementById('pb-location').value.toUpperCase(),
        time: document.getElementById('pb-time').value,
        charName: document.getElementById('pb-char-name').value.toUpperCase(),
        charDesc: document.getElementById('pb-char-desc').value,
        action: document.getElementById('pb-action').value
    };

    if (!sceneData.location || !sceneData.action) {
        alert("Please provide at least a Location and some Action/Dialogue.");
        return;
    }

    try {
        const response = await fetch('/api/scenes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sceneData)
        });
        
        const data = await response.json();
        speakText(data.message);

        // Clear the form and swap to the Work Queue tab
        document.querySelectorAll('#cell-builder input, #cell-builder textarea').forEach(el => el.value='');
        switchCell('queue');
        loadQueue();
    } catch (error) {
        alert("Failed to save scene to the neural matrix.");
    }
}

async function loadQueue() {
    const container = document.getElementById('queue-container');
    
    try {
        const response = await fetch('/api/scenes');
        const data = await response.json();
        
        if (data.scenes.length === 0) return;
        
        container.innerHTML = ''; // Clear default message
        
        data.scenes.forEach(scene => {
            const compiledText = `${scene.setting} ${scene.location} - ${scene.time}\n\n[${scene.charName} - ${scene.charDesc}]\n\n${scene.action}`;
            
            const card = document.createElement('div');
            card.className = 'scene-card';
            card.innerHTML = `
                <h4>SCENE ${scene.id}: ${scene.location}</h4>
                <div class="meta-tag"><i class="ph ph-clapperboard"></i> ${scene.setting}</div>
                <div class="meta-tag"><i class="ph ph-clock"></i> ${scene.time}</div>
                <div class="meta-tag"><i class="ph ph-user"></i> ${scene.charName}</div>
                
                <div class="action-text">${scene.action.substring(0, 150)}${scene.action.length > 150 ? '...' : ''}</div>
                
                <button class="copy-btn" onclick="copyToClipboard(this, \`${compiledText.replace(/`/g, '\\`')}\`)"><i class="ph ph-copy"></i> Copy Block</button>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = `<p style="color: #ff4444;">Error loading Work Queue.</p>`;
    }
}

function copyToClipboard(btnElement, text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = btnElement.innerHTML;
        btnElement.innerHTML = "<i class='ph ph-check'></i> COPIED!";
        btnElement.style.borderColor = "var(--accent-blue)";
        btnElement.style.color = "var(--accent-blue)";
        
        setTimeout(() => {
            btnElement.innerHTML = originalHTML;
            btnElement.style.borderColor = "var(--text-muted)";
            btnElement.style.color = "var(--text-muted)";
        }, 2000);
    });
}