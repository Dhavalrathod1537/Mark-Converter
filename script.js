// ========== Theme Management ==========
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-icon').textContent = '☀️';
    }
}

document.getElementById('theme-toggle')?.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    this.querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ========== Conversion History Management ==========
function getHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
        if (!Array.isArray(history)) {
            throw new TypeError('Conversion history must be an array');
        }
        return history;
    } catch (error) {
        console.error('Unable to read conversion history:', error);
        return [];
    }
}

function saveToHistory(type, input, output, details) {
    let history = getHistory();

    const historyItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        input,
        output,
        details,
        timestamp: new Date().toISOString()
    };

    history.unshift(historyItem);
    history = history.slice(0, 20); // Keep only last 20

    localStorage.setItem('conversionHistory', JSON.stringify(history));
    if (document.getElementById('history-converter')?.classList.contains('active')) {
        loadHistory();
    }
}

function loadHistory() {
    const history = getHistory();
    const historyList = document.getElementById('history-list');
    const clearBtn = document.getElementById('clear-history-btn');

    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No conversions yet. Start converting to see your history!</p>';
        clearBtn.style.display = 'none';
        return;
    }

    clearBtn.style.display = 'block';
    historyList.innerHTML = history.map((item, index) => {
        const date = new Date(item.timestamp);
        const timeAgo = Number.isNaN(date.getTime()) ? 'Unknown date' : getTimeAgo(date);
        const id = item.id || `legacy-${index}`;

        return `
            <div class="history-item">
                <div class="history-details">
                    <div class="history-type">${escapeHTML(item.type)}</div>
                    <div class="history-calc">${escapeHTML(item.details)}</div>
                    <div class="history-time">${escapeHTML(timeAgo)}</div>
                </div>
                <div class="history-result">${escapeHTML(item.output)}</div>
                <button class="delete-history-btn" type="button" data-history-id="${escapeHTML(id)}" aria-label="Delete this history entry">Delete</button>
            </div>
        `;
    }).join('');
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function deleteHistoryEntry(id) {
    const history = getHistory();
    const index = history.findIndex((item, itemIndex) => (item.id || `legacy-${itemIndex}`) === id);
    if (index !== -1) {
        history.splice(index, 1);
        localStorage.setItem('conversionHistory', JSON.stringify(history));
        loadHistory();
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all conversion history?')) {
        localStorage.removeItem('conversionHistory');
        loadHistory();
    }
}

function exportHistoryCSV() {
    const history = getHistory();
    if (history.length === 0) {
        alert('There is no conversion history to export.');
        return;
    }

    const quote = value => {
        let text = String(value ?? '');
        if (/^\s*[=+\-@]/.test(text)) text = `'${text}`;
        return `"${text.replace(/"/g, '""')}"`;
    };
    const rows = [
        ['Type', 'Input', 'Output', 'Details', 'Timestamp'],
        ...history.map(item => [item.type, item.input, item.output, item.details, item.timestamp])
    ];
    const csv = rows.map(row => row.map(quote).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'marks-converter-history.csv';
    link.click();
    URL.revokeObjectURL(url);
}

function shareHistoryWhatsApp() {
    const history = getHistory();
    if (history.length === 0) {
        alert('There is no conversion history to share.');
        return;
    }
    const message = history.slice(0, 10)
        .map(item => `${item.type}: ${item.details} → ${item.output}`)
        .join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return date.toLocaleDateString();
}

// ========== Mode Switching ==========
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.converter-section').forEach(s => s.classList.remove('active'));

        this.classList.add('active');
        const mode = this.getAttribute('data-mode');
        document.getElementById(`${mode}-converter`).classList.add('active');

        if (mode === 'history') {
            loadHistory();
        }

        clearAllResults();
    });
});

document.getElementById('history-list')?.addEventListener('click', event => {
    const button = event.target.closest('.delete-history-btn');
    if (button) {
        deleteHistoryEntry(button.dataset.historyId);
    }
});

function clearAllResults() {
    document.querySelectorAll('.result').forEach(result => {
        result.textContent = '';
        result.className = 'result';
    });
    document.querySelectorAll('.export-buttons').forEach(buttons => {
        buttons.style.display = 'none';
    });
}

// ========== CGPA to Percentage Calculator ==========
const universityFormulas = {
    generic: {
        description: 'CGPA × 9.5 on a 10-point scale; normalized percentage on 4- or 5-point scales.',
        confidence: 'High',
        note: 'Generic UGC/CBSE-style estimate.',
        scale: null
    },
    'iit-bombay': {
        description: 'CPI × 10 (notional conversion).',
        confidence: 'Medium',
        note: 'IIT Bombay does not officially convert grade points to percentage; use this only as a notional estimate.',
        metric: 'CPI',
        scale: 10
    },
    'iit-other': {
        description: 'CPI × 10.',
        confidence: 'Medium',
        note: 'Confirm the conversion policy with the specific IIT.',
        metric: 'CPI',
        scale: 10
    },
    parul: {
        description: 'CGPA × 10.',
        confidence: 'Low–medium',
        note: 'Reported by a secondary calculator; verify with Parul University.',
        scale: 10
    },
    nirma: {
        description: 'CGPA × 10 (unverified estimate).',
        confidence: 'Low',
        note: 'I could not verify this on an official Nirma source. Treat as an estimate and confirm with Nirma before using it.',
        scale: 10
    },
    gtu: {
        description: 'CGPA × 10.',
        confidence: 'Low',
        note: 'Reported for some schemes; GTU conversion varies by scheme. Check your marksheet/regulations.',
        scale: 10
    },
    'gtu-legacy': {
        description: '(CGPA − 0.5) × 10.',
        confidence: 'Low',
        note: 'Older GTU scheme reported; verify the applicable scheme.',
        scale: 10
    },
    gujarat: {
        description: 'CGPA × 10.',
        confidence: 'Low–medium',
        note: 'Verify with Gujarat University and your program regulations.',
        scale: 10
    },
    mumbai: {
        description: '(CGPA × 7.1) + 11.',
        confidence: 'Medium',
        note: 'Confirm the applicable Mumbai University scheme.',
        scale: 10
    },
    sppu: {
        description: 'CGPA × 8.9.',
        confidence: 'Low',
        note: 'Reported by a secondary source; confirm with SPPU.',
        scale: 10
    },
    anna: {
        description: 'CGPA × 10.',
        confidence: 'Medium',
        note: 'Confirm the applicable regulation year.',
        scale: 10
    },
    vtu: {
        description: 'CGPA × 10.',
        confidence: 'Medium',
        note: 'Reported for the latest two schemes; verify your scheme.',
        scale: 10
    },
    'vtu-legacy': {
        description: '(CGPA − 0.75) × 10.',
        confidence: 'Medium',
        note: 'Reported for older VTU schemes; verify your scheme.',
        scale: 10
    },
    delhi: {
        description: 'CGPA × 10.',
        confidence: 'Medium',
        note: 'Confirm the applicable Delhi University program rules.',
        scale: 10
    },
    aicte: {
        description: '(CGPA − 0.75) × 10.',
        confidence: 'Medium',
        note: 'AICTE standard estimate; confirm your institution accepts this conversion.',
        scale: 10
    },
    us4: {
        description: '(GPA ÷ 4) × 100.',
        confidence: 'High',
        note: 'Use only with the 4.0 GPA scale. This is a linear estimate, not a credential evaluation.',
        scale: 4
    }
};

function getUniversityFormula(formula) {
    return universityFormulas[formula] || universityFormulas.generic;
}

function updateFormulaNote() {
    const formulaId = document.getElementById('university-formula').value;
    const formula = getUniversityFormula(formulaId);
    document.getElementById('formula-note').textContent =
        `Formula: ${formula.description} Confidence: ${formula.confidence}. ${formula.note}`;
    const metric = formula.metric || 'CGPA';
    document.getElementById('cgpa-title').textContent = `${metric} to Percentage`;
    document.getElementById('cgpa-input-label').textContent = `Enter ${metric}`;
    document.getElementById('cgpa-scale-label').textContent = `${metric} Scale`;
    document.getElementById('reverse-title').textContent = `Percentage to ${metric}`;
    document.getElementById('percent-input-label').textContent = 'Enter Percentage';
    document.getElementById('reverse-scale-label').textContent = `Target ${metric} Scale`;
}

function formulaScaleError(scale, formula) {
    const supportedScale = getUniversityFormula(formula).scale;
    return supportedScale && supportedScale !== scale
        ? `This formula requires the ${supportedScale}-point scale. Select that scale or choose a compatible formula.`
        : '';
}

function calculateCGPA() {
    const cgpa = parseFloat(document.getElementById('cgpa-input').value);
    const scale = parseFloat(document.getElementById('cgpa-scale').value);
    const resultDiv = document.getElementById('cgpa-result');
    const formula = document.getElementById('university-formula').value;
    const metric = getUniversityFormula(formula).metric || 'CGPA';

    if (isNaN(cgpa) || cgpa < 0) {
        showError(resultDiv, `Please enter a valid ${metric}`);
        hideExportButtons('cgpa');
        return;
    }

    if (cgpa > scale) {
        showError(resultDiv, `${metric} cannot exceed ${scale}`);
        hideExportButtons('cgpa');
        return;
    }

    const scaleError = formulaScaleError(scale, formula);
    if (scaleError) {
        showError(resultDiv, scaleError);
        hideExportButtons('cgpa');
        return;
    }
    const percentage = calculatePercentage(cgpa, scale, formula);
    const result = `${percentage.toFixed(2)}%`;

    showSuccess(resultDiv, result, cgpa, scale);
    showExportButtons('cgpa');
    saveToHistory(`${metric} to %`, cgpa, result, `${cgpa} ${metric} (${scale}-point) = ${result}`);
}

function calculatePercentage(value, scale, formula) {
    if (formula === 'generic') {
        return Math.min((value / scale) * 100 * (scale === 10 ? 0.95 : 1), 100);
    }
    const formulas = {
        'iit-bombay': value * 10,
        'iit-other': value * 10,
        parul: value * 10,
        nirma: value * 10,
        gtu: value * 10,
        'gtu-legacy': (value - 0.5) * 10,
        gujarat: value * 10,
        mumbai: value * 7.1 + 11,
        sppu: value * 8.9,
        anna: value * 10,
        vtu: value * 10,
        'vtu-legacy': (value - 0.75) * 10,
        delhi: value * 10,
        aicte: (value - 0.75) * 10,
        us4: (value / 4) * 100
    };
    return Math.max(0, Math.min(formulas[formula] ?? value * 9.5, 100));
}

function calculateCGPAFromPercentage(percentage, scale, formula) {
    if (formula === 'generic') {
        return (percentage / 100) * scale / (scale === 10 ? 0.95 : 1);
    }
    const formulas = {
        'iit-bombay': percentage / 10,
        'iit-other': percentage / 10,
        parul: percentage / 10,
        nirma: percentage / 10,
        gtu: percentage / 10,
        'gtu-legacy': (percentage / 10) + 0.5,
        gujarat: percentage / 10,
        mumbai: (percentage - 11) / 7.1,
        sppu: percentage / 8.9,
        anna: percentage / 10,
        vtu: percentage / 10,
        'vtu-legacy': (percentage / 10) + 0.75,
        delhi: percentage / 10,
        aicte: (percentage / 10) + 0.75,
        us4: (percentage / 100) * 4
    };
    return formulas[formula] ?? percentage / 9.5;
}

// ========== SPI to Percentage Calculator ==========
function calculateSPI() {
    const spi = parseFloat(document.getElementById('spi-input').value);
    const scale = parseFloat(document.getElementById('spi-scale').value);
    const resultDiv = document.getElementById('spi-result');

    if (isNaN(spi) || spi < 0) {
        showError(resultDiv, 'Please enter a valid SPI');
        hideExportButtons('spi');
        return;
    }

    if (spi > scale) {
        showError(resultDiv, `SPI cannot exceed ${scale}`);
        hideExportButtons('spi');
        return;
    }

    const formula = document.getElementById('university-formula').value;
    if (getUniversityFormula(formula).metric === 'CPI') {
        showError(resultDiv, 'This formula is for CPI, not SPI. Use the CPI/CGPA converter instead.');
        hideExportButtons('spi');
        return;
    }
    const scaleError = formulaScaleError(scale, formula);
    if (scaleError) {
        showError(resultDiv, scaleError);
        hideExportButtons('spi');
        return;
    }
    const percentage = calculatePercentage(spi, scale, formula);
    const result = `${percentage.toFixed(2)}%`;

    showSuccess(resultDiv, result, spi, scale);
    showExportButtons('spi');
    saveToHistory('SPI to %', spi, result, `${spi} SPI (${scale}-point) = ${result}`);
}

// ========== Marks to Percentage Calculator ==========
function calculateMarks() {
    const obtained = parseFloat(document.getElementById('obtained-marks').value);
    const total = parseFloat(document.getElementById('total-marks').value);
    const resultDiv = document.getElementById('marks-result');

    if (isNaN(obtained) || isNaN(total)) {
        showError(resultDiv, 'Please enter valid marks');
        hideExportButtons('marks');
        return;
    }

    if (obtained < 0 || total <= 0) {
        showError(resultDiv, 'Marks must be positive numbers');
        hideExportButtons('marks');
        return;
    }

    if (obtained > total) {
        showError(resultDiv, 'Obtained marks cannot exceed total marks');
        hideExportButtons('marks');
        return;
    }

    const percentage = (obtained / total) * 100;
    const result = `${percentage.toFixed(2)}%`;

    showSuccess(resultDiv, result, obtained, total);

    showExportButtons('marks');
    saveToHistory('Marks to %', `${obtained}/${total}`, result, `${obtained}/${total} marks = ${result}`);
}

// ========== Grade to Percentage Converter ==========
function calculateGrade() {
    const grade = document.getElementById('grade-input').value;
    const resultDiv = document.getElementById('grade-result');

    if (!grade) {
        showError(resultDiv, 'Please select a grade');
        return;
    }

    const gradeMap = {
        'O': { percentage: '90-100%', points: 10, desc: 'Outstanding' },
        'A+': { percentage: '80-89%', points: 9, desc: 'Excellent' },
        'A': { percentage: '70-79%', points: 8, desc: 'Very Good' },
        'B+': { percentage: '60-69%', points: 7, desc: 'Good' },
        'B': { percentage: '50-59%', points: 6, desc: 'Above Average' },
        'C': { percentage: '40-49%', points: 5, desc: 'Average' },
        'D': { percentage: '35-39%', points: 4, desc: 'Pass' },
        'F': { percentage: 'Below 35%', points: 0, desc: 'Fail' }
    };

    const gradeInfo = gradeMap[grade];

    resultDiv.className = 'result success';
    resultDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 10px;">📊 ${gradeInfo.percentage}</div>
            <div style="font-size: 1rem; margin-bottom: 5px;">${gradeInfo.desc}</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">Grade Point: ${gradeInfo.points}</div>
        </div>
    `;

    saveToHistory('Grade to %', grade, gradeInfo.percentage, `Grade ${grade} = ${gradeInfo.percentage}`);
}

// ========== Reverse: Percentage to CGPA ==========
function calculateReverse() {
    const percentage = parseFloat(document.getElementById('percent-input').value);
    const scale = parseFloat(document.getElementById('reverse-scale').value);
    const resultDiv = document.getElementById('reverse-result');

    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        showError(resultDiv, 'Please enter a valid percentage (0-100)');
        hideExportButtons('reverse');
        return;
    }

    const formula = document.getElementById('university-formula').value;
    const scaleError = formulaScaleError(scale, formula);
    if (scaleError) {
        showError(resultDiv, scaleError);
        hideExportButtons('reverse');
        return;
    }
    let cgpa = calculateCGPAFromPercentage(percentage, scale, formula);

    cgpa = Math.max(0, Math.min(cgpa, scale));
    const result = cgpa.toFixed(2);

    resultDiv.className = 'result success';
    resultDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 10px;">🎯 ${result} ${getUniversityFormula(formula).metric || 'CGPA'}</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">on ${scale}-point scale</div>
        </div>
    `;

    showExportButtons('reverse');
    const metric = getUniversityFormula(formula).metric || 'CGPA';
    saveToHistory(`% to ${metric}`, percentage, `${result} ${metric}`, `${percentage}% = ${result} ${metric} (${scale}-point)`);
}

// ========== Semester CGPA and SPI chart ==========
const semesterStorageKey = 'semesterResults';
const semesterScaleStorageKey = 'semesterScale';
const semesterLimit = 12;

function readSemesterResults() {
    try {
        const results = JSON.parse(localStorage.getItem(semesterStorageKey) || '[]');
        if (!Array.isArray(results)) {
            throw new TypeError('Semester results must be an array');
        }
        return results;
    } catch (error) {
        console.error('Unable to read saved semester results:', error);
        return [];
    }
}

function addSemesterRow(values = {}) {
    const list = document.getElementById('semester-list');
    const row = document.createElement('div');
    row.className = 'semester-row';
    const semesterNumber = list.children.length + 1;
    row.innerHTML = `
        <label>Semester ${semesterNumber}
            <input class="semester-spi" type="number" min="0" step="0.01" value="${escapeHTML(values.spi ?? '')}" placeholder="SPI/SGPA">
        </label>
        <label>Credits
            <input class="semester-credits" type="number" min="0.01" step="0.5" value="${escapeHTML(values.credits ?? '')}" placeholder="Credits">
        </label>
        <button class="delete-history-btn remove-semester-btn" type="button" aria-label="Remove semester ${semesterNumber}">Remove</button>
    `;
    list.appendChild(row);
    updateSemesterRows();
}

function updateSemesterRows() {
    const scale = Number(document.getElementById('semester-scale').value);
    const rows = [...document.querySelectorAll('.semester-row')];
    rows.forEach((row, index) => {
        row.querySelector('.semester-spi').max = scale;
        row.querySelector('label').firstChild.textContent = `Semester ${index + 1} `;
        row.querySelector('.remove-semester-btn').setAttribute('aria-label', `Remove semester ${index + 1}`);
    });
    document.getElementById('add-semester-btn').disabled = rows.length >= semesterLimit;
}

function getSemesterInputs() {
    const scale = Number(document.getElementById('semester-scale').value);
    const rows = [...document.querySelectorAll('.semester-row')];
    if (rows.length === 0) {
        throw new Error('Add at least one semester.');
    }
    return rows.map((row, index) => {
        const spi = Number(row.querySelector('.semester-spi').value);
        const credits = Number(row.querySelector('.semester-credits').value);
        if (!row.querySelector('.semester-spi').value || !Number.isFinite(spi) || spi < 0 || spi > scale) {
            throw new Error(`Enter an SPI from 0 to ${scale} for semester ${index + 1}.`);
        }
        if (!row.querySelector('.semester-credits').value || !Number.isFinite(credits) || credits <= 0) {
            throw new Error(`Enter positive credits for semester ${index + 1}.`);
        }
        return { spi, credits };
    });
}

function calculateSemesters() {
    const result = document.getElementById('semester-result');
    const scale = Number(document.getElementById('semester-scale').value);
    try {
        const semesters = getSemesterInputs();
        const totalCredits = semesters.reduce((sum, item) => sum + item.credits, 0);
        const cgpa = semesters.reduce((sum, item) => sum + item.spi * item.credits, 0) / totalCredits;
        localStorage.setItem(semesterStorageKey, JSON.stringify(semesters));
        localStorage.setItem(semesterScaleStorageKey, String(scale));
        result.className = 'result success';
        result.textContent = `Overall CGPA: ${cgpa.toFixed(2)} / ${scale} (${totalCredits} credits)`;
        showExportButtons('semester');
        renderSemesterChart(semesters, scale);
        saveToHistory('SPI/SGPA to CGPA', `${semesters.length} semesters`, `${cgpa.toFixed(2)} CGPA`, `Credit-weighted CGPA across ${semesters.length} semesters (${totalCredits} credits)`);
    } catch (error) {
        showError(result, error.message);
        hideExportButtons('semester');
    }
}

function renderSemesterChart(semesters, scale) {
    const svg = document.getElementById('semester-chart');
    const empty = document.getElementById('chart-empty');
    const namespace = 'http://www.w3.org/2000/svg';
    svg.replaceChildren();
    empty.hidden = semesters.length > 0;
    if (semesters.length === 0) return;

    const left = 44;
    const right = 620;
    const top = 20;
    const bottom = 210;
    const x = index => semesters.length === 1
        ? (left + right) / 2
        : left + index * (right - left) / (semesters.length - 1);
    const y = value => bottom - (value / scale) * (bottom - top);
    const addSvgElement = (tag, attributes, text) => {
        const element = document.createElementNS(namespace, tag);
        Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
        if (text !== undefined) element.textContent = text;
        svg.appendChild(element);
        return element;
    };

    [0, scale / 2, scale].forEach(value => {
        addSvgElement('line', { x1: left, y1: y(value), x2: right, y2: y(value), class: 'chart-grid-line' });
        addSvgElement('text', { x: left - 8, y: y(value) + 4, 'text-anchor': 'end', class: 'chart-axis-label' }, value.toFixed(value % 1 ? 1 : 0));
    });
    const points = semesters.map((item, index) => `${x(index)},${y(item.spi)}`).join(' ');
    addSvgElement('polyline', { points, class: 'chart-line' });
    semesters.forEach((item, index) => {
        addSvgElement('circle', { cx: x(index), cy: y(item.spi), r: 5, class: 'chart-point' });
        addSvgElement('text', { x: x(index), y: y(item.spi) - 10, 'text-anchor': 'middle', class: 'chart-value' }, item.spi.toFixed(2));
        addSvgElement('text', { x: x(index), y: bottom + 24, 'text-anchor': 'middle', class: 'chart-axis-label' }, `Sem ${index + 1}`);
    });
}

function initSemesterCalculator() {
    const list = document.getElementById('semester-list');
    const saved = readSemesterResults();
    const savedScale = localStorage.getItem(semesterScaleStorageKey);
    if (['4', '5', '10'].includes(savedScale)) {
        document.getElementById('semester-scale').value = savedScale;
    }
    (saved.length ? saved.slice(0, semesterLimit) : [{}]).forEach(addSemesterRow);
    document.getElementById('add-semester-btn').addEventListener('click', () => {
        if (list.children.length < semesterLimit) addSemesterRow();
    });
    document.getElementById('calculate-semesters-btn').addEventListener('click', calculateSemesters);
    document.getElementById('semester-scale').addEventListener('change', updateSemesterRows);
    list.addEventListener('click', event => {
        const button = event.target.closest('.remove-semester-btn');
        if (button && list.children.length > 1) {
            button.closest('.semester-row').remove();
            updateSemesterRows();
        }
    });
    if (saved.length) renderSemesterChart(saved.slice(0, semesterLimit), Number(document.getElementById('semester-scale').value));
}

function updateScaleInput(inputId, scaleId) {
    const input = document.getElementById(inputId);
    input.max = document.getElementById(scaleId).value;
}

// ========== Next-semester target SPI ==========
function calculateTargetSPI() {
    const current = Number(document.getElementById('current-cgpa').value);
    const completedCredits = Number(document.getElementById('completed-credits').value);
    const nextCredits = Number(document.getElementById('next-semester-credits').value);
    const target = Number(document.getElementById('target-cgpa').value);
    const scale = Number(document.getElementById('target-scale').value);
    const result = document.getElementById('target-result');

    if (![current, completedCredits, nextCredits, target].every(Number.isFinite) ||
        !document.getElementById('current-cgpa').value ||
        !document.getElementById('completed-credits').value ||
        !document.getElementById('next-semester-credits').value ||
        !document.getElementById('target-cgpa').value ||
        current < 0 || current > scale || target < 0 || target > scale ||
        completedCredits < 0 || nextCredits <= 0) {
        showError(result, `Enter CGPA and target between 0 and ${scale}, non-negative completed credits, and positive next-semester credits.`);
        hideExportButtons('target');
        return;
    }

    const requiredSPI = (target * (completedCredits + nextCredits) - current * completedCredits) / nextCredits;
    result.className = 'result success';
    if (requiredSPI > scale) {
        result.textContent = `This target is not reachable next semester. Required SPI: ${requiredSPI.toFixed(2)} (maximum ${scale}).`;
    } else if (requiredSPI <= 0) {
        result.textContent = `Your current CGPA already meets the target. Any valid SPI next semester will keep you at or above it.`;
    } else {
        result.textContent = `You need approximately ${requiredSPI.toFixed(2)} SPI next semester.`;
    }
    showExportButtons('target');
    saveToHistory('Target SPI', `${current} CGPA, ${completedCredits} completed credits`, result.textContent, `Target ${target} CGPA with ${nextCredits} next-semester credits`);
}

// ========== Helper Functions ==========
function showSuccess(element, percentage, value, scale) {
    const numericPercentage = Number.parseFloat(percentage);
    const reaction = getPercentageReaction(numericPercentage);
    element.className = 'result success';
    element.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 10px;">${percentage}</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">from ${value}/${scale}</div>
            <div class="percentage-reaction" role="status">${reaction.emoji} ${reaction.message}</div>
        </div>
    `;
}

function getPercentageReaction(percentage) {
    if (percentage >= 85) return { emoji: '🏆', message: 'Outstanding!' };
    if (percentage >= 75) return { emoji: '🎉', message: 'Excellent work!' };
    if (percentage >= 65) return { emoji: '😄', message: 'Great job!' };
    if (percentage >= 55) return { emoji: '🙂', message: 'Good, keep it up' };
    if (percentage >= 45) return { emoji: '😐', message: 'Average, you can improve' };
    if (percentage >= 35) return { emoji: '😟', message: 'Needs more effort' };
    return { emoji: '💪', message: "Don't give up, try again" };
}

function showError(element, message) {
    element.className = 'result error';
    element.innerHTML = `<div style="text-align: center;">⚠️ ${message}</div>`;
}

// ========== Event Listeners ==========
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const section = this.closest('.converter-section');
            const button = section.querySelector('.calculate-btn');
            if (button) button.click();
        }
    });
});

document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('input', function() {
        const section = this.closest('.converter-section');
        const result = section?.querySelector('.result');
        if (result) {
            result.textContent = '';
            result.className = 'result';
            const exportButtons = section.querySelector('.export-buttons');
            if (exportButtons) exportButtons.style.display = 'none';
        }
    });
});

// ========== Initialize ==========
window.addEventListener('load', function() {
    initTheme();
    initPWA();
    initSemesterCalculator();
    document.getElementById('calculate-target-btn').addEventListener('click', calculateTargetSPI);
    document.getElementById('cgpa-scale').addEventListener('change', () => updateScaleInput('cgpa-input', 'cgpa-scale'));
    document.getElementById('spi-scale').addEventListener('change', () => updateScaleInput('spi-input', 'spi-scale'));
    document.getElementById('university-formula').addEventListener('change', () => {
        updateFormulaNote();
        clearAllResults();
    });
    updateFormulaNote();
    setTimeout(() => {
        const firstInput = document.querySelector('#cgpa-converter input');
        if (firstInput) firstInput.focus();
    }, 100);
});

// ========== PWA Installation ==========
let deferredPrompt;

function initPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.log('Service Worker registration failed', err));
    }

    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallBanner();
    });
}

function showInstallBanner() {
    const banner = document.createElement('div');
    banner.className = 'install-banner show';
    banner.innerHTML = `
        <span>📱 Install app for offline use</span>
        <button class="install-btn" onclick="installApp()">Install</button>
        <button class="install-btn" style="background: transparent; color: var(--text-dark);" onclick="this.parentElement.remove()">✕</button>
    `;
    document.body.appendChild(banner);
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('App installed');
            }
            deferredPrompt = null;
            document.querySelector('.install-banner')?.remove();
        });
    }
}

// ========== Export and Share Functions ==========
function shareResult(type) {
    const resultDiv = document.getElementById(`${type}-result`);
    const resultText = resultDiv?.textContent.trim();

    if (!resultText || resultDiv.classList.contains('error')) {
        alert('No result to share!');
        return;
    }

    const pageUrl = /^https?:$/.test(window.location.protocol) ? `\n${window.location.href}` : '';
    const message = `${resultText}\n\nCalculated using Marks Converter${pageUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    const shareWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    if (!shareWindow) {
        window.location.href = whatsappUrl;
    }
}

function copyResult(type, button = document.activeElement) {
    const resultDiv = document.getElementById(`${type}-result`);
    const resultText = resultDiv.textContent.trim();

    if (!resultText || resultDiv.classList.contains('error')) {
        alert('No result to copy!');
        return;
    }

    navigator.clipboard.writeText(resultText)
        .then(() => {
            showCopyFeedback(button);
        })
        .catch(err => {
            console.error('Copy failed', err);
            alert('Failed to copy. Please try again.');
        });
}

function showCopyFeedback(btn) {
    if (!btn) return;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.background = 'var(--success-color)';
    btn.style.color = 'white';
    btn.style.borderColor = 'var(--success-color)';

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
    }, 2000);
}

function showExportButtons(type) {
    const exportDiv = document.getElementById(`${type}-export`);
    if (exportDiv) {
        exportDiv.style.display = 'flex';
    }
}

function hideExportButtons(type) {
    const exportDiv = document.getElementById(`${type}-export`);
    if (exportDiv) {
        exportDiv.style.display = 'none';
    }
}
