let isDecryptMode = false;

// Common English words, used to check if decrypted text makes sense
const COMMON_WORDS = new Set([
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he",
    "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
    "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about",
    "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know",
    "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then",
    "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how",
    "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day",
    "most", "us", "attack", "project", "security", "framework", "system", "cyber", "advanced", "score", "data",
    "redhat", "linux", "admin", "server", "cloud", "network", "host", "node", "root", "user", "pass", "code", "insight"
]);

function switchTab(evt, tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    evt.currentTarget.classList.add('active');
}

function toggleMode() {
    const btn = document.getElementById('modeToggle');
    isDecryptMode = !isDecryptMode;
    btn.innerText = isDecryptMode ? "Decrypt Mode" : "Encrypt Mode";
    btn.className = isDecryptMode ? "toggle-btn decrypt-mode" : "toggle-btn";
    runLiveCipher();
}

function syncKey(val) {
    document.getElementById('keyValueDisplay').innerText = val;
    runLiveCipher();
}

function handleEngineChange() {
    const selected = document.getElementById('algorithmSelect').value;
    document.getElementById('caesarControls').style.display = selected === 'caesar' ? 'flex' : 'none';
    document.getElementById('vigenereControls').style.display = selected === 'vigenere' ? 'flex' : 'none';
    runLiveCipher();
}

function handleFileEngineChange() {
    const selected = document.getElementById('fileAlgorithmSelect').value;
    document.getElementById('fileCaesarConfig').style.display = selected === 'caesar' ? 'inline-block' : 'none';
    document.getElementById('fileVigenereConfig').style.display = selected === 'vigenere' ? 'inline-block' : 'none';
    processFileData();
}

// Shifts every letter by a fixed number of places in the alphabet
function runCaesar(message, shift) {
    if (!message) return "";
    let result = "";
    shift = (shift % 26 + 26) % 26;

    for (let i = 0; i < message.length; i++) {
        let charCode = message.charCodeAt(i);
        if (charCode >= 97 && charCode <= 122) {
            result += String.fromCharCode(((charCode - 97 + shift) % 26) + 97);
        } else if (charCode >= 65 && charCode <= 90) {
            result += String.fromCharCode(((charCode - 65 + shift) % 26) + 65);
        } else {
            result += message.charAt(i);
        }
    }
    return result;
}

// Shifts each letter using a repeating keyword instead of one fixed shift
function runVigenere(message, key, decrypt = false) {
    if (!message) return "";
    if (!key) return message;

    let result = "";
    let keyIndex = 0;

    key = key.toLowerCase().replace(/[^a-z]/g, '');
    if (key.length === 0) return message;

    for (let i = 0; i < message.length; i++) {
        let charCode = message.charCodeAt(i);
        let isLower = (charCode >= 97 && charCode <= 122);
        let isUpper = (charCode >= 65 && charCode <= 90);

        if (isLower || isUpper) {
            let shift = key.charCodeAt(keyIndex % key.length) - 97;
            if (decrypt) {
                shift = 26 - shift;
            }
            shift = (shift % 26 + 26) % 26;

            let base = isLower ? 97 : 65;
            result += String.fromCharCode(((charCode - base + shift) % 26) + base);
            keyIndex++;
        } else {
            result += message.charAt(i);
        }
    }
    return result;
}

function runLiveCipher() {
    const msg = document.getElementById('interactiveInput').value;
    const algo = document.getElementById('algorithmSelect').value;
    const outputField = document.getElementById('interactiveOutput');

    if (algo === 'caesar') {
        const key = parseInt(document.getElementById('interactiveKey').value);
        outputField.value = isDecryptMode ? runCaesar(msg, 26 - key) : runCaesar(msg, key);
    } else {
        const keyWord = document.getElementById('vigenereKey').value.trim();
        outputField.value = runVigenere(msg, keyWord, isDecryptMode);
    }
}

function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;
    document.getElementById('fileNameDisplay').innerText = `Selected File: ${file.name}`;

    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('fileInputText').value = e.target.result;
        processFileData();
    };
    reader.readAsText(file);
}

function processFileData() {
    const srcText = document.getElementById('fileInputText').value;
    if (!srcText) return;

    const isFileEncrypt = document.getElementById('fileEnc').checked;
    const algo = document.getElementById('fileAlgorithmSelect').value;
    const outputField = document.getElementById('fileOutputText');

    if (algo === 'caesar') {
        let key = parseInt(document.getElementById('fileKey').value);
        if (isNaN(key)) key = 3;
        const activeShift = isFileEncrypt ? key : (26 - key);
        outputField.value = runCaesar(srcText, activeShift);
    } else {
        const keyWord = document.getElementById('fileVigenereKey').value.trim();
        outputField.value = runVigenere(srcText, keyWord, !isFileEncrypt);
    }
}

function executeFileDownload() {
    const outData = document.getElementById('fileOutputText').value;
    if (!outData) {
        alert("There is no processed output text to download yet!");
        return;
    }
    const blob = new Blob([outData], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "processed_output.txt";
    link.click();
}

// Checks how many words in a piece of text are real English words.
// Used to guess which decryption attempt is most likely correct.
function scoreText(text) {
    let words = text.toLowerCase().split(/[^a-z]+/);
    let realWordCount = 0;
    let checkedWords = 0;

    words.forEach(w => {
        if (w.length > 0) {
            checkedWords++;
            if (COMMON_WORDS.has(w)) {
                realWordCount++;
            }
        }
    });
    return checkedWords > 0 ? (realWordCount / checkedWords) : 0;
}

// Tries all 25 possible Caesar shifts and ranks them by how "real" the result looks
function runBruteForceCrack() {
    const input = document.getElementById('bruteInput').value;
    const outputArea = document.getElementById('bruteOutput');

    if (!input.trim()) {
        outputArea.value = "";
        return;
    }

    let candidates = [];
    for (let possibleKey = 1; possibleKey <= 25; possibleKey++) {
        let attempt = runCaesar(input, 26 - possibleKey);
        let score = scoreText(attempt);
        candidates.push({ key: possibleKey, text: attempt, score: score });
    }

    candidates.sort((a, b) => b.score - a.score);

    let log = `RANK | SHIFT | MATCH % | DECRYPTED TEXT\n`;
    log += `--------------------------------------------------------------\n`;

    candidates.forEach((cand, index) => {
        let rank = (index + 1).toString().padStart(2, '0');
        let paddedKey = cand.key.toString().padStart(2, '0');
        let confidence = Math.round(cand.score * 100);
        let badge = (index === 0 && confidence > 0) ? " <- most likely" : "";

        log += `#${rank}  | ${paddedKey}    | ${confidence}%${badge.padEnd(16)} | ${cand.text}\n`;
    });

    outputArea.value = log;
    outputArea.scrollTop = 0;
}
