// main.js - Application Entry Point and Coordinator

// Global app state
const App = {
    currentGrid: null,
    selectedCell: null,
    history: [],        // Will store actions, not full grid states
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
        
        // Hint panel (updated from modal)
        hintPanel: document.getElementById('hintPanel'),
        hintClose: document.getElementById('hintClose'),
        hintCollapse: document.getElementById('hintCollapse'),
        hintText: document.getElementById('hintText'),
        hintCollapsedText: document.getElementById('hintCollapsedText'),
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
    
    // Hint panel
    App.elements.hintClose.addEventListener('click', closeHintPanel);
    App.elements.hintCollapse.addEventListener('click', toggleHintCollapse);
    App.elements.hintLevelBtns.forEach(btn => {
        btn.addEventListener('click', handleHintLevelChange);
    });
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);
}

// Initialize a new game
function initializeGame() {
    // Create empty grid structure
    App.currentGrid = Grid.createEmptyGrid();
    
    // Reset history
    App.history = [];
    App.historyIndex = -1;
    
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
    
    updateHistoryButtons();
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
    
    if (App.isPencilMode) {
        // Record the pencil mark action
        const action = {
            type: 'pencil',
            row: row,
            col: col,
            number: number,
            added: !cell.pencilMarks.has(number) // true if adding, false if removing
        };
        
        // Apply the action
        Grid.togglePencilMark(App.currentGrid, row, col, number);
        
        // Save the action to history
        saveAction(action);
    } else {
        // Record the current state before change
        const action = {
            type: 'value',
            row: row,
            col: col,
            oldValue: cell.value,
            newValue: number,
            oldPencilMarks: new Set(cell.pencilMarks) // Copy current pencil marks
        };
        
        // Don't save if value isn't changing
        if (action.oldValue === action.newValue) {
            return;
        }
        
        // Place the number
        Grid.placeNumber(App.currentGrid, row, col, number);
        
        // Update all conflict states in the grid
        Validation.updateAllConflictStates(App.currentGrid);
        
        // Get all cells with conflicts for visual marking
        const allConflicts = Validation.findAllConflicts(App.currentGrid);
        if (allConflicts.length > 0) {
            Grid.markConflicts(allConflicts);
        }
        
        // Save the action to history
        saveAction(action);
        
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
    
    // Only erase if there's something to erase
    if (cell.value === 0 && cell.pencilMarks.size === 0) {
        return;
    }
    
    // Record the erase action
    const action = {
        type: 'erase',
        row: row,
        col: col,
        oldValue: cell.value,
        oldPencilMarks: new Set(cell.pencilMarks)
    };
    
    Grid.clearCell(App.currentGrid, row, col);
    
    // Update conflict states after erasing
    Validation.updateAllConflictStates(App.currentGrid);
    
    // Save the action
    saveAction(action);
    
    // Re-render to update conflict displays
    Grid.render(App.currentGrid);
}

// New action-based history management
function saveAction(action) {
    // Remove any actions after current index (for redo functionality)
    App.history = App.history.slice(0, App.historyIndex + 1);
    
    // Add the new action
    App.history.push(action);
    App.historyIndex++;
    
    // Limit history size
    if (App.history.length > 100) {
        App.history.shift();
        App.historyIndex--;
    }
    
    updateHistoryButtons();
    
    // Save current grid state to localStorage
    Storage.saveGame(App.currentGrid);
}

function handleUndo() {
    if (App.historyIndex < 0) return;
    
    // Get the action to undo
    const action = App.history[App.historyIndex];
    
    // Undo the action
    undoAction(action);
    
    // Move history pointer back
    App.historyIndex--;
    
    // Update conflict states
    Validation.updateAllConflictStates(App.currentGrid);
    
    // Re-render
    Grid.render(App.currentGrid);
    updateHistoryButtons();
    
    // Clear selection to avoid confusion
    if (App.selectedCell) {
        App.selectedCell = null;
        Grid.clearHighlights();
    }
}

function handleRedo() {
    if (App.historyIndex >= App.history.length - 1) return;
    
    // Move history pointer forward
    App.historyIndex++;
    
    // Get the action to redo
    const action = App.history[App.historyIndex];
    
    // Redo the action
    redoAction(action);
    
    // Update conflict states
    Validation.updateAllConflictStates(App.currentGrid);
    
    // Re-render
    Grid.render(App.currentGrid);
    updateHistoryButtons();
    
    // Clear selection to avoid confusion
    if (App.selectedCell) {
        App.selectedCell = null;
        Grid.clearHighlights();
    }
}

// Undo a specific action
function undoAction(action) {
    const cell = App.currentGrid.cells[action.row][action.col];
    
    switch (action.type) {
        case 'value':
            // Restore old value and pencil marks
            cell.value = action.oldValue;
            cell.pencilMarks = new Set(action.oldPencilMarks);
            break;
            
        case 'pencil':
            // Toggle the pencil mark back
            if (action.added) {
                cell.pencilMarks.delete(action.number);
            } else {
                cell.pencilMarks.add(action.number);
            }
            break;
            
        case 'erase':
            // Restore erased value and pencil marks
            cell.value = action.oldValue;
            cell.pencilMarks = new Set(action.oldPencilMarks);
            break;
    }
}

// Redo a specific action
function redoAction(action) {
    const cell = App.currentGrid.cells[action.row][action.col];
    
    switch (action.type) {
        case 'value':
            // Apply the new value
            Grid.placeNumber(App.currentGrid, action.row, action.col, action.newValue);
            break;
            
        case 'pencil':
            // Toggle the pencil mark
            if (action.added) {
                cell.pencilMarks.add(action.number);
            } else {
                cell.pencilMarks.delete(action.number);
            }
            break;
            
        case 'erase':
            // Clear the cell
            Grid.clearCell(App.currentGrid, action.row, action.col);
            break;
    }
}

function updateHistoryButtons() {
    App.elements.undoBtn.disabled = App.historyIndex < 0;
    App.elements.redoBtn.disabled = App.historyIndex >= App.history.length - 1;
}

function handleHintRequest() {
    const hint = Hints.generateHint(App.currentGrid, App.hintLevel);
    
    if (!hint) {
        App.elements.hintText.textContent = "No hints available. The puzzle might be complete or unsolvable.";
        App.elements.hintCollapsedText.textContent = "No hints available";
    } else {
        App.elements.hintText.textContent = hint.message;
        // Create a shortened version for collapsed view
        App.elements.hintCollapsedText.textContent = hint.message.length > 50 
            ? hint.message.substring(0, 50) + '...' 
            : hint.message;
        
        // Highlight relevant cells if provided
        if (hint.cells) {
            Grid.highlightHintCells(hint.cells);
        }
    }
    
    // Show the hint panel with animation
    App.elements.hintPanel.classList.remove('hidden');
    
    // Load collapsed state from storage
    const isCollapsed = localStorage.getItem('hintPanelCollapsed') === 'true';
    if (isCollapsed) {
        App.elements.hintPanel.classList.add('collapsed');
    }
}

function handleHintLevelChange(e) {
    // Update active button
    App.elements.hintLevelBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Update hint level
    App.hintLevel = parseInt(e.target.dataset.level);
    
    // Regenerate hint with new level
    const hint = Hints.generateHint(App.currentGrid, App.hintLevel);
    
    if (!hint) {
        App.elements.hintText.textContent = "No hints available. The puzzle might be complete or unsolvable.";
        App.elements.hintCollapsedText.textContent = "No hints available";
    } else {
        App.elements.hintText.textContent = hint.message;
        // Update collapsed text too
        App.elements.hintCollapsedText.textContent = hint.message.length > 50 
            ? hint.message.substring(0, 50) + '...' 
            : hint.message;
        
        // Update highlight for new hint
        Grid.clearHintHighlights();
        if (hint.cells) {
            Grid.highlightHintCells(hint.cells);
        }
    }
}

function toggleHintCollapse(e) {
    e.stopPropagation(); // Prevent event bubbling
    
    const isCollapsed = App.elements.hintPanel.classList.contains('collapsed');
    
    if (isCollapsed) {
        App.elements.hintPanel.classList.remove('collapsed');
        localStorage.setItem('hintPanelCollapsed', 'false');
    } else {
        App.elements.hintPanel.classList.add('collapsed');
        localStorage.setItem('hintPanelCollapsed', 'true');
    }
}

function closeHintPanel() {
    App.elements.hintPanel.classList.add('hidden');
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

// Load saved game from storage
function loadSavedGame() {
    const savedData = Storage.loadGame();
    if (savedData) {
        App.currentGrid = savedData.grid;
        
        // Clear history when loading saved game
        App.history = [];
        App.historyIndex = -1;
        
        Grid.render(App.currentGrid);
        updateHistoryButtons();
    }
    
    // Load theme preference
    const savedTheme = Storage.loadThemePreference();
    if (savedTheme !== 'default') {
        App.currentTheme = savedTheme;
        // Create a fake event object for handleThemeChange
        const fakeEvent = { 
            currentTarget: { 
                dataset: { theme: savedTheme } 
            },
            stopPropagation: () => {} // Add this to prevent errors
        };
        handleThemeChange(fakeEvent);
    }
    
    // Update active theme button
    App.elements.themeOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.theme === App.currentTheme);
    });
}

// Make handleCellClick globally accessible for Grid module
window.handleCellClick = handleCellClick;