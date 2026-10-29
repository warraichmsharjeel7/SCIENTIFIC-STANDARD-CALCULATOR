// State variables
let currentMode = 'std'; // 'std' or 'sci'
let expression = '';
let isDeg = true;

const mainDisplay = document.getElementById('main-display');
const historyDisplay = document.getElementById('history-display');
const sciKeysExtra = document.getElementById('sci-keys-extra');
const modeStdBtn = document.getElementById('mode-std');
const modeSciBtn = document.getElementById('mode-sci');
const degRadBtn = document.getElementById('deg-rad-btn');

// Mode Switcher Function
function switchMode(mode) {
    currentMode = mode;
    if (mode === 'sci') {
        sciKeysExtra.classList.remove('hidden');
        sciKeysExtra.classList.add('grid');
        degRadBtn.classList.remove('hidden');

        modeSciBtn.className = "px-3 py-1.5 rounded-lg transition-all duration-200 bg-indigo-600 text-white shadow-md";
        modeStdBtn.className = "px-3 py-1.5 rounded-lg transition-all duration-200 text-slate-300 hover:text-white";
    } else {
        sciKeysExtra.classList.add('hidden');
        sciKeysExtra.classList.remove('grid');
        degRadBtn.classList.add('hidden');

        modeStdBtn.className = "px-3 py-1.5 rounded-lg transition-all duration-200 bg-indigo-600 text-white shadow-md";
        modeSciBtn.className = "px-3 py-1.5 rounded-lg transition-all duration-200 text-slate-300 hover:text-white";
    }
}

// Theme Switcher Function
function changeTheme(themeName) {
    document.body.className = `theme-${themeName} min-h-screen flex items-center justify-center p-4 transition-colors duration-500`;
}

// Toggle Degrees / Radians Mode
function toggleDegRad() {
    isDeg = !isDeg;
    degRadBtn.textContent = isDeg ? 'DEG' : 'RAD';
    degRadBtn.style.color = isDeg ? '#fbbf24' : '#22d3ee';
}

// Append normal numbers or constants
function appendValue(val) {
    if (expression === '0' && !isNaN(val)) {
        expression = val;
    } else {
        expression += val;
    }
    updateDisplay();
}

// FIX: Operator Logic - Prevents consecutive operators (+, -, *, /) and replaces the last one
function appendOperator(op) {
    if (expression === '') {
        if (op === '-') {
            expression = '-';
        }
        updateDisplay();
        return;
    }

    // Check if the last character is already an operator (+, -, *, /, %)
    const lastChar = expression.slice(-1);
    const operators = ['+', '-', '*', '/', '%'];

    if (operators.includes(lastChar)) {
        // Replace the last operator with the new one
        expression = expression.slice(0, -1) + op;
    } else {
        expression += op;
    }
    updateDisplay();
}

// Append functional keys (like sin, cos, sqrt)
function appendFunc(funcName) {
    switch (funcName) {
        case 'sin':
        case 'cos':
        case 'tan':
        case 'log':
        case 'ln':
        case 'sqrt':
            expression += funcName + '(';
            break;
        case 'sq':
            expression += '^2';
            break;
        case 'inv':
            expression += '^(-1)';
            break;
    }
    updateDisplay();
}

// Backspace function
function backspace() {
    if (expression.length > 0) {
        const funcs = ['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt('];
        let removed = false;
        for (let f of funcs) {
            if (expression.endsWith(f)) {
                expression = expression.slice(0, -f.length);
                removed = true;
                break;
            }
        }
        if (!removed) {
            expression = expression.slice(0, -1);
        }
    }
    if (expression === '') expression = '0';
    updateDisplay();
}

// Clear everything
function clearAll() {
    expression = '';
    historyDisplay.textContent = '0';
    mainDisplay.textContent = '0';
}

// Toggle positive / negative
function toggleSign() {
    if (!expression || expression === '0') return;
    if (expression.startsWith('-')) {
        expression = expression.substring(1);
    } else {
        expression = '-' + expression;
    }
    updateDisplay();
}

// Update UI displays
function updateDisplay() {
    mainDisplay.textContent = expression || '0';
    mainDisplay.scrollLeft = mainDisplay.scrollWidth;
}

// Factorial helper function
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

// Evaluate Expression safely
function calculate() {
    if (!expression) return;

    let parsedExpr = expression;
    historyDisplay.textContent = expression + ' =';

    try {
        // Replace Constants
        parsedExpr = parsedExpr.replace(/π/g, 'Math.PI');
        parsedExpr = parsedExpr.replace(/e/g, 'Math.E');

        // Replace Operators for JS eval
        parsedExpr = parsedExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        parsedExpr = parsedExpr.replace(/\^/g, '**');

        // Trigonometry handling (DEG / RAD)
        if (isDeg) {
            parsedExpr = parsedExpr.replace(/sin\(([^)]+)\)/g, (match, p1) => `Math.sin((${p1}) * Math.PI / 180)`);
            parsedExpr = parsedExpr.replace(/cos\(([^)]+)\)/g, (match, p1) => `Math.cos((${p1}) * Math.PI / 180)`);
            parsedExpr = parsedExpr.replace(/tan\(([^)]+)\)/g, (match, p1) => `Math.tan((${p1}) * Math.PI / 180)`);
        } else {
            parsedExpr = parsedExpr.replace(/sin\(/g, 'Math.sin(');
            parsedExpr = parsedExpr.replace(/cos\(/g, 'Math.cos(');
            parsedExpr = parsedExpr.replace(/tan\(/g, 'Math.tan(');
        }

        // Logarithmic & Roots
        parsedExpr = parsedExpr.replace(/log\(/g, 'Math.log10(');
        parsedExpr = parsedExpr.replace(/ln\(/g, 'Math.log(');
        parsedExpr = parsedExpr.replace(/sqrt\(/g, 'Math.sqrt(');

        // Handle Factorials
        parsedExpr = parsedExpr.replace(/(\d+)!/g, (match, p1) => factorial(parseInt(p1)));

        // Handle percent (%)
        parsedExpr = parsedExpr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

        let result = eval(parsedExpr);

        if (typeof result === 'number' && !isNaN(result)) {
            if (!Number.isInteger(result)) {
                result = parseFloat(result.toFixed(8));
            }
            expression = String(result);
            mainDisplay.textContent = expression;
        } else {
            mainDisplay.textContent = 'Error';
            expression = '';
        }
    } catch (err) {
        mainDisplay.textContent = 'Error';
        expression = '';
    }
}

// Keyboard Shortcuts Support
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key >= '0' && key <= '9') appendValue(key);
    else if (key === '.') appendValue('.');
    else if (key === '+') appendOperator('+');
    else if (key === '-') appendOperator('-');
    else if (key === '*') appendOperator('*');
    else if (key === '/') appendOperator('/');
    else if (key === '%') appendOperator('%');
    else if (key === '(' || key === ')') appendValue(key);
    else if (key === '^') appendValue('^');
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'Escape') {
        clearAll();
    }
});