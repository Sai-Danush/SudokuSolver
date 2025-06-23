// main.js - Application Entry Point and Coordinator

// Global app state
const App = {
    currentGrid: null,
    selectedCell: null,
    history: [],
    historyIndex: -1,
    isPencilMode: false,
    currentTheme: 'default',
    hintLevel: 1,
    
    // Constants
    GRID_SIZE: 9,
    BOX_SIZE: 3,
    
    // DOM elements (will be cached on init)
    elements: {}
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧩 Sudoku Solver initializing...');
    
    // Cache DOM elements
    cacheElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize the grid
    initializeGame();
    
    // Load saved game if exists
    loadSavedGame();
    
    console.log('✅ Sudoku Solver ready!');
});

// Cache DOM elements for better performance
function cacheElements() {
    App.elements = {
        // Grid
        gridContainer: document.getElementById('sudokuGrid'),
        
        // Controls
        undoBtn: document.getElementById('undoBtn'),
        redoBtn: document.getElementById('redoBtn'),
        eraseBtn: document.getElementById('eraseBtn'),
        hintBtn: document.getElementById('hintBtn'),
        newGameBtn: document.getElementById('newGameBtn'),
        
        // Theme
        themeBtn: document.getElementById('themeBtn'),
        themeMenu: document.getElementById('themeMenu'),
        themeOptions: document.querySelectorAll('.theme-option'),
        
        // Number pad
        numberBtns: document.querySelectorAll('.num-btn'),
        pencilMode: document.getElementById('pencilMode'),
        
        // Hint display
        hintDisplay: document.getElementById('hintDisplay'),
        hintClose: document.getElementById('hintClose'),
        hintText: document.getElementById('hintText'),
        hintLevelBtns: document.querySelectorAll('.hint-level-btn')
    };
}

// Set up all event listeners
function setupEventListeners() {
    // Control buttons
    App.elements.undoBtn.addEventListener('click', handleUndo);
    App.elements.redoBtn.addEventListener('click', handleRedo);
    App.elements.eraseBtn.addEventListener('click', handleErase);
    App.elements.hintBtn.addEventListener('click', handleHintRequest);
    App.elements.newGameBtn.addEventListener('click', handleNewGame);
    
    // Theme toggle
    App.elements.themeBtn.addEventListener('click', toggleThemeMenu);
    App.elements.themeOptions.forEach(option => {
        option.addEventListener('click', handleThemeChange);
    });
    
    // Click outside theme menu to close
    document.addEventListener('click', (e) => {
        if (!App.elements.themeBtn.contains(e.target) && !App.elements.themeMenu.contains(e.target)) {
            App.elements.themeMenu.classList.add('hidden');
        }
    });
    
    // Number pad
    App.elements.numberBtns.forEach(btn => {
        btn.addEventListener('click', handleNumberClick);
    });
    
    // Pencil mode
    App.elements.pencilMode.addEventListener('change', handlePencilModeToggle);
    
    // Hint modal
    App.elements.hintClose.addEventListener('click', closeHintModal);
    App.elements.hintLevelBtns.forEach(btn => {
        btn.addEventListener('click', handleHintLevelChange);
    });
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);
    
    // Click outside hint modal to close
    App.elements.hintDisplay.addEventListener('click', (e) => {
        if (e.target === App.elements.hintDisplay) {
            closeHintModal();
        }
    });
}

// Initialize a new game
function initializeGame() {
    // Create empty grid structure
    App.currentGrid = Grid.createEmptyGrid();
    
    // For now, let's load a sample puzzle (Phase 1 - manual input)
    // In Phase 2, this will be replaced with photo upload
    const samplePuzzle = [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
    ];
    
    Grid.loadPuzzle(App.currentGrid, samplePuzzle);
    Grid.render(App.currentGrid);
    
    // Initialize history
    saveToHistory();
}

// Event Handlers
function handleCellClick(row, col) {
    // Remove previous selection
    if (App.selectedCell) {
        const prevCell = document.querySelector(`[data-row="${App.selectedCell.row}"][data-col="${App.selectedCell.col}"]`);
        prevCell?.classList.remove('selected');
        
        // Remove highlighting from related cells
        Grid.clearHighlights();
    }
    
    // Set new selection
    App.selectedCell = { row, col };
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('selected');
    
    // Add ripple effect
    cell.classList.add('clicked');
    setTimeout(() => cell.classList.remove('clicked'), 600);
    
    // Highlight related cells (same row, column, and box)
    Grid.highlightRelatedCells(row, col);
}

function handleNumberClick(e) {
    const number = parseInt(e.target.dataset.number);
    placeNumber(number);
}

function handleKeyPress(e) {
    // Number keys 1-9
    if (e.key >= '1' && e.key <= '9') {
        placeNumber(parseInt(e.key));
        return;
    }
    
    // Navigation with arrow keys
    if (App.selectedCell) {
        const { row, col } = App.selectedCell;
        switch(e.key) {
            case 'ArrowUp':
                if (row > 0) handleCellClick(row - 1, col);
                break;
            case 'ArrowDown':
                if (row < 8) handleCellClick(row + 1, col);
                break;
            case 'ArrowLeft':
                if (col > 0) handleCellClick(row, col - 1);
                break;
            case 'ArrowRight':
                if (col < 8) handleCellClick(row, col + 1);
                break;
            case 'Delete':
            case 'Backspace':
                handleErase();
                break;
        }
    }
    
    // Shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'z':
                e.preventDefault();
                handleUndo();
                break;
            case 'y':
                e.preventDefault();
                handleRedo();
                break;
        }
    }
}

function placeNumber(number) {
    if (!App.selectedCell) return;
    
    const { row, col } = App.selectedCell;
    const cell = App.currentGrid.cells[row][col];
    
    // Don't modify given cells
    if (cell.isGiven) {
        // Shake animation for feedback
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellElement.classList.add('error-shake');
        setTimeout(() => cellElement.classList.remove('error-shake'), 500);
        return;
    }
    
    // Save to history before making changes
    saveToHistory();
    
    if (App.isPencilMode) {
        // Toggle pencil mark
        Grid.togglePencilMark(App.currentGrid, row, col, number);
    } else {
        // Place the number
        Grid.placeNumber(App.currentGrid, row, col, number);
        
        // Check for conflicts
        const conflicts = Validation.checkConflicts(App.currentGrid, row, col);
        if (conflicts.length > 0) {
            // Mark conflicts
            Grid.markConflicts(conflicts);
        }
        
        // Check if puzzle is complete
        if (Validation.isPuzzleComplete(App.currentGrid)) {
            handlePuzzleComplete();
        }
    }
    
    // Re-render the grid
    Grid.render(App.currentGrid);
}

function handleErase() {
    if (!App.selectedCell) return;
    
    const { row, col } = App.selectedCell;
    const cell = App.currentGrid.cells[row][col];
    
    if (cell.isGiven) {
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellElement.classList.add('error-shake');
        setTimeout(() => cellElement.classList.remove('error-shake'), 500);
        return;
    }
    
    saveToHistory();
    Grid.clearCell(App.currentGrid, row, col);
    Grid.render(App.currentGrid);
}

function handleUndo() {
    if (App.historyIndex > 0) {
        App.historyIndex--;
        App.currentGrid = Utils.deepClone(App.history[App.historyIndex]);
        Grid.render(App.currentGrid);
        updateHistoryButtons();
    }
}

function handleRedo() {
    if (App.historyIndex < App.history.length - 1) {
        App.historyIndex++;
        App.currentGrid = Utils.deepClone(App.history[App.historyIndex]);
        Grid.render(App.currentGrid);
        updateHistoryButtons();
    }
}

function handleHintRequest() {
    const hint = Hints.generateHint(App.currentGrid, App.hintLevel);
    
    if (!hint) {
        App.elements.hintText.textContent = "No hints available. The puzzle might be complete or unsolvable.";
    } else {
        App.elements.hintText.textContent = hint.message;
        
        // Highlight relevant cells if provided
        if (hint.cells) {
            Grid.highlightHintCells(hint.cells);
        }
    }
    
    App.elements.hintDisplay.classList.remove('hidden');
}

function handleHintLevelChange(e) {
    // Update active button
    App.elements.hintLevelBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Update hint level
    App.hintLevel = parseInt(e.target.dataset.level);
    
    // Regenerate hint with new level
    handleHintRequest();
}

function closeHintModal() {
    App.elements.hintDisplay.classList.add('hidden');
    Grid.clearHintHighlights();
}

function toggleThemeMenu(e) {
    e.stopPropagation();
    App.elements.themeMenu.classList.toggle('hidden');
}

function handleThemeChange(e) {
    const theme = e.currentTarget.dataset.theme;
    App.currentTheme = theme;
    
    // Update active state
    App.elements.themeOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.theme === theme);
    });
    
    // Apply theme
    document.body.classList.add('theme-transitioning');
    
    // Remove all theme classes
    document.body.classList.remove('newspaper-theme', 'dark-theme');
    
    // Add new theme class if not default
    if (theme === 'newspaper') {
        document.body.classList.add('newspaper-theme');
    } else if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Remove transition class after animation
    setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
    }, 500);
    
    // Save preference
    Storage.saveThemePreference(theme);
    
    // Close menu
    App.elements.themeMenu.classList.add('hidden');
}

function handlePencilModeToggle(e) {
    App.isPencilMode = e.target.checked;
}

function handleNewGame() {
    if (confirm('Start a new game? Current progress will be lost.')) {
        initializeGame();
    }
}

function handlePuzzleComplete() {
    console.log('🎉 Puzzle completed!');
    
    // Add completion animation
    App.elements.gridContainer.classList.add('completed');
    
    // Show victory message
    setTimeout(() => {
        alert('Congratulations! You solved the puzzle! 🎉');
        // Could add fireworks or other celebration effects here
    }, 1000);
}

// History management
function saveToHistory() {
    // Remove any states after current index
    App.history = App.history.slice(0, App.historyIndex + 1);
    
    // Add current state
    App.history.push(Utils.deepClone(App.currentGrid));
    App.historyIndex++;
    
    // Limit history size
    if (App.history.length > 50) {
        App.history.shift();
        App.historyIndex--;
    }
    
    updateHistoryButtons();
    
    // Save to local storage
    Storage.saveGame(App.currentGrid);
}

function updateHistoryButtons() {
    App.elements.undoBtn.disabled = App.historyIndex <= 0;
    App.elements.redoBtn.disabled = App.historyIndex >= App.history.length - 1;
}

// Load saved game from storage
function loadSavedGame() {
    const savedData = Storage.loadGame();
    if (savedData) {
        App.currentGrid = savedData.grid;
        Grid.render(App.currentGrid);
    }
    
    // Load theme preference
    const savedTheme = Storage.loadThemePreference();
    if (savedTheme !== 'default') {
        App.currentTheme = savedTheme;
        handleThemeChange({ currentTarget: { dataset: { theme: savedTheme } } });
    }
    
    // Update active theme button
    App.elements.themeOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.theme === App.currentTheme);
    });
}

// Make handleCellClick globally accessible for Grid module
window.handleCellClick = handleCellClick;