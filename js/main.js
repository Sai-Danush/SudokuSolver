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
    currentPuzzleId: null,
    
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
    
    // Initialize mascot
    Mascot.init();
    
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
        
        // Hint panel (updated - removed collapsed elements)
        hintPanel: document.getElementById('hintPanel'),
        hintClose: document.getElementById('hintClose'),
        hintText: document.getElementById('hintText'),
        hintLevelBtns: document.querySelectorAll('.hint-level-btn'),
        
        // Puzzle library
        puzzleLibraryBtn: document.getElementById('puzzleLibraryBtn'),
        puzzleDropdown: document.getElementById('puzzleDropdown'),
        puzzleList: document.getElementById('puzzleList'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        resetPuzzleBtn: document.getElementById('resetPuzzleBtn'),

        // Progress bar
        progressContainer: document.getElementById('progressContainer'),
        progressFill: document.getElementById('progressFill'),
        progressText: document.getElementById('progressText'),

        // Status message
        puzzleStatusMessage: document.getElementById('puzzleStatusMessage'),
        statusText: document.getElementById('statusText'),
        statusSubtext: document.getElementById('statusSubtext')
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
    App.elements.hintLevelBtns.forEach(btn => {
        btn.addEventListener('click', handleHintLevelChange);
    });
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);
    
    // Puzzle library
    setupPuzzleLibraryListeners();
}

// Setup puzzle library event listeners
function setupPuzzleLibraryListeners() {
    // Toggle dropdown
    App.elements.puzzleLibraryBtn.addEventListener('click', togglePuzzleDropdown);
    
    // Filter buttons
    App.elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // Reset button
    App.elements.resetPuzzleBtn.addEventListener('click', handleResetPuzzle);
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!App.elements.puzzleLibraryBtn.contains(e.target) && 
            !App.elements.puzzleDropdown.contains(e.target)) {
            closePuzzleDropdown();
        }
    });
    
    // Initialize puzzle list
    renderPuzzleList('all');
    
    // Update reset button state
    updateResetButtonState();
}

// Initialize a new game
function initializeGame() {
    // Get a random puzzle from the database
    const puzzle = PuzzleDatabase.getRandomPuzzle();
    loadPuzzleIntoGame(puzzle);
}

// Toggle puzzle dropdown
function togglePuzzleDropdown(e) {
    e.stopPropagation();
    const isOpen = App.elements.puzzleDropdown.classList.contains('show');
    
    if (isOpen) {
        closePuzzleDropdown();
    } else {
        openPuzzleDropdown();
    }
}

// Open puzzle dropdown
function openPuzzleDropdown() {
    App.elements.puzzleDropdown.classList.add('show');
    App.elements.puzzleLibraryBtn.classList.add('active');
}

// Close puzzle dropdown
function closePuzzleDropdown() {
    App.elements.puzzleDropdown.classList.remove('show');
    App.elements.puzzleLibraryBtn.classList.remove('active');
}

// Handle filter button clicks
function handleFilterClick(e) {
    const difficulty = e.target.dataset.difficulty;
    
    // Update active state
    App.elements.filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
    });
    
    // Render filtered list
    renderPuzzleList(difficulty);
}

// Render puzzle list
function renderPuzzleList(filter = 'all') {
    const puzzles = filter === 'all' 
        ? PuzzleDatabase.getAllPuzzles()
        : PuzzleDatabase.getPuzzlesByDifficulty(filter);
    
    // Clear current list
    App.elements.puzzleList.innerHTML = '';
    
    // Add puzzle items
    puzzles.forEach(puzzle => {
        const puzzleInfo = PuzzleDatabase.getPuzzleInfo(puzzle);
        const item = createPuzzleItem(puzzleInfo);
        App.elements.puzzleList.appendChild(item);
    });
}

// Refresh puzzle library to show updated completion status
function refreshPuzzleLibrary() {
    // Always refresh the list, regardless of dropdown state
    // Get the current filter
    const activeFilter = document.querySelector('.filter-btn.active');
    const currentFilter = activeFilter ? activeFilter.dataset.difficulty : 'all';
    
    // Re-render the list with current filter
    renderPuzzleList(currentFilter);
    
    console.log('Puzzle library refreshed with filter:', currentFilter);
}

// Update progress bar based on grid completion
function updateProgressBar() {
    if (!App.currentGrid || !App.elements.progressContainer) return;
    
    let filledCells = 0;
    const totalCells = 81;
    
    // Count filled cells
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (App.currentGrid.cells[row][col].value !== 0) {
                filledCells++;
            }
        }
    }
    
    const percentage = Math.round((filledCells / totalCells) * 100);
    
    // Update progress bar
    App.elements.progressFill.style.width = percentage + '%';
    App.elements.progressText.textContent = `${percentage}% Complete`;
    
    // Show progress container if hidden
    App.elements.progressContainer.classList.remove('hidden');
}

function handleResetPuzzle() {
    if (!App.currentGrid || !App.currentPuzzleId) return;
    
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to reset this puzzle? All your progress will be lost.');
    
    if (confirmed) {
        // Get the original puzzle
        const puzzle = PuzzleDatabase.getPuzzleById(App.currentPuzzleId);
        if (puzzle) {
            // If this puzzle was completed, remove its completed solution and status
            const puzzleInfo = PuzzleDatabase.getPuzzleInfo(puzzle);
            if (puzzleInfo.completed) {
                PuzzleDatabase.removeCompletedSolution(App.currentPuzzleId);
                // Also remove completion status
                const allStatus = PuzzleDatabase.loadCompletionStatus();
                delete allStatus[App.currentPuzzleId];
                localStorage.setItem('sudoku_puzzle_status', JSON.stringify(allStatus));
                console.log('Removed completion status and solution for puzzle:', App.currentPuzzleId);
            }
            
            // Reset game state
            App.history = [];
            App.historyIndex = -1;
            App.selectedCell = null;
            
            // Load fresh puzzle from original
            App.currentGrid = Grid.createEmptyGrid();
            Grid.loadPuzzle(App.currentGrid, puzzle.board);
            
            // Reset mascot stats (timer)
            Mascot.stats.startTime = Date.now();
            Mascot.stats.hintsUsed = 0;
            Mascot.stats.movesMade = 0;
            
            // Clear completion animations
            App.elements.gridContainer.classList.remove('completed');

            // If we're in view-only mode, switch back to editable mode
            if (App.currentGrid && App.currentGrid.isViewOnly) {
                resetUIForEditableMode();
            }
            
            // Clear view-only flags
            App.currentGrid.isViewOnly = false;
            App.currentGrid.isCompleted = false;
            
            // Re-render and update UI
            Grid.render(App.currentGrid);
            updateHistoryButtons();
            updateProgressBar();
            Grid.clearHighlights();
            
            // Refresh puzzle library to update completion status immediately
            setTimeout(() => {
                refreshPuzzleLibrary();
            }, 50);
            
            // Close puzzle dropdown
            closePuzzleDropdown();
            
            // Show mascot message
            Mascot.showMessage('Puzzle reset! Fresh start!');
        }
    }
}

// Update reset button state (enabled/disabled)
function updateResetButtonState() {
    if (!App.elements.resetPuzzleBtn) return;
    
    const hasActivePuzzle = App.currentGrid && App.currentPuzzleId;
    App.elements.resetPuzzleBtn.disabled = !hasActivePuzzle;
}

// Handle individual puzzle reset from library
function handleIndividualPuzzleReset(puzzleId) {
    const puzzle = PuzzleDatabase.getPuzzleById(puzzleId);
    if (!puzzle) return;
    
    const confirmed = confirm(`Reset progress for Puzzle #${puzzleId}? This will remove your completion status and best time.`);
    
    if (confirmed) {
        // Remove completion status from localStorage
        const allStatus = PuzzleDatabase.loadCompletionStatus();
        delete allStatus[puzzleId];
        localStorage.setItem('sudoku_puzzle_status', JSON.stringify(allStatus));
        
        // Remove the completed solution
        PuzzleDatabase.removeCompletedSolution(puzzleId);
        
        // If this is the currently active puzzle, reset it too
        if (App.currentPuzzleId === puzzleId) {
            // Reset the active game
            loadPuzzleIntoGame(puzzle);
        }
        
        // Refresh the puzzle library to update the UI
        setTimeout(() => {
            refreshPuzzleLibrary();
            console.log('Individual puzzle reset completed for puzzle:', puzzleId);
        }, 50);
        
        // Show confirmation message
        Mascot.showMessage(`Puzzle #${puzzleId} progress reset!`);
    }
}

// Create puzzle item element
function createPuzzleItem(puzzleInfo) {
    const item = document.createElement('div');
    item.className = 'puzzle-item';
    if (puzzleInfo.completed) {
        item.classList.add('completed');
    }
    
    // Create HTML structure
    item.innerHTML = `
        <div class="puzzle-info">
            <span class="puzzle-number">${puzzleInfo.displayName}</span>
            <div class="puzzle-difficulty">
                ${createStarRating(puzzleInfo.stars)}
            </div>
        </div>
        <div class="puzzle-status">
            ${puzzleInfo.completed ? `
                <svg class="checkmark" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                ${puzzleInfo.bestTime ? `<span class="best-time">${formatTime(puzzleInfo.bestTime)}</span>` : ''}
                <button class="puzzle-reset-btn" data-puzzle-id="${puzzleInfo.id}" title="Reset progress">🔄</button>
            ` : ''}
        </div>
    `;
    
    // Add click handler for puzzle selection
    item.addEventListener('click', (e) => {
        // Don't select puzzle if reset button was clicked
        if (e.target.classList.contains('puzzle-reset-btn')) {
            return;
        }
        selectPuzzle(puzzleInfo.id);
    });
    
    // Add reset button handler if puzzle is completed
    if (puzzleInfo.completed) {
        const resetBtn = item.querySelector('.puzzle-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent puzzle selection
                handleIndividualPuzzleReset(puzzleInfo.id);
            });
        }
    }
    
    return item;
}

// Create star rating HTML
function createStarRating(stars) {
    let html = '';
    for (let i = 0; i < 4; i++) {
        if (i < stars) {
            html += `<svg class="star" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>`;
        } else {
            html += `<svg class="star empty" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>`;
        }
    }
    return html;
}

// Format time for display
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Select and load a puzzle
function selectPuzzle(puzzleId) {
    const puzzle = PuzzleDatabase.getPuzzleById(puzzleId);
    if (!puzzle) return;
    
    // Check if puzzle is completed
    const puzzleInfo = PuzzleDatabase.getPuzzleInfo(puzzle);
    
    if (puzzleInfo.completed) {
        // Load completed puzzle in view-only mode
        loadCompletedPuzzle(puzzle, puzzleInfo);
        closePuzzleDropdown();
        Mascot.showMessage(`Viewing completed Puzzle #${puzzleId}!`);
        return;
    }
    
    // For incomplete puzzles, check if current game has progress
    if (hasUnsavedProgress()) {
        if (!confirm('You have an unfinished puzzle. Do you want to start a new one?')) {
            return;
        }
    }
    
    // Load the selected puzzle normally
    loadPuzzleIntoGame(puzzle);
    closePuzzleDropdown();
    Mascot.showMessage(`Starting Puzzle #${puzzleId}!`);
}

// Load puzzle into the game
function loadPuzzleIntoGame(puzzle) {
    // Reset game state
    App.currentGrid = Grid.createEmptyGrid();
    App.history = [];
    App.historyIndex = -1;
    App.selectedCell = null;
    
    // Clear completion animations from previous puzzle
    App.elements.gridContainer.classList.remove('completed');
    
    // Reset mascot stats
    Mascot.stats.startTime = Date.now();
    Mascot.stats.hintsUsed = 0;
    Mascot.stats.movesMade = 0;
    
    // Load the puzzle
    Grid.loadPuzzle(App.currentGrid, puzzle.board);
    Grid.render(App.currentGrid);
    
    // Store current puzzle ID
    App.currentPuzzleId = puzzle.id;
    
    // Update UI
    updateHistoryButtons();
    Grid.clearHighlights();

    // Reset UI for normal (editable) mode
    resetUIForEditableMode();

    // Update progress bar
    updateProgressBar();

    // Update reset button state
    updateResetButtonState();
}

// Load a completed puzzle in view-only mode
// Load a completed puzzle in view-only mode
function loadCompletedPuzzle(puzzle, puzzleInfo) {
    // Reset game state
    App.currentGrid = Grid.createEmptyGrid();
    App.history = [];
    App.historyIndex = -1;
    App.selectedCell = null;
    
    // Try to load the user's completed solution
    const completedGrid = PuzzleDatabase.getCompletedSolution(puzzle.id);
    
    if (completedGrid) {
        // Load the user's completed solution
        App.currentGrid = completedGrid;
        console.log('Loaded completed solution for puzzle:', puzzle.id);
    } else {
        // Fallback: Load original puzzle (shouldn't happen for completed puzzles)
        Grid.loadPuzzle(App.currentGrid, puzzle.board);
        console.warn('No completed solution found for puzzle:', puzzle.id, 'Loading original');
    }
    
    // Mark as view-only and completed
    App.currentGrid.isViewOnly = true;
    App.currentGrid.isCompleted = true;
    
    // Store current puzzle ID
    App.currentPuzzleId = puzzle.id;
    
    // Render the grid with the completed solution
    Grid.render(App.currentGrid);
    
    // Update UI for view-only mode
    updateUIForViewOnlyMode(puzzleInfo);
    
    // Update progress bar (should show 100% for completed)
    updateProgressBar();
    
    // Update reset button state
    updateResetButtonState();
    
    // Clear highlights
    Grid.clearHighlights();
}

// Reset UI elements for normal editable mode
function resetUIForEditableMode() {
    // Enable number pad buttons
    App.elements.numberBtns.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
    });
    
    // Enable pencil mode
    App.elements.pencilMode.disabled = false;
    App.elements.pencilMode.parentElement.style.opacity = '1';
    
    // Enable erase button
    App.elements.eraseBtn.disabled = false;
    App.elements.eraseBtn.style.opacity = '1';
    
    // Remove view-only class from grid
    App.elements.gridContainer.classList.remove('view-only');
    
    // Hide status message
    if (App.elements.puzzleStatusMessage) {
        App.elements.puzzleStatusMessage.classList.add('hidden');
    }
    
    // Clear view-only flags
    if (App.currentGrid) {
        App.currentGrid.isViewOnly = false;
        App.currentGrid.isCompleted = false;
    }
}

// Update UI elements for view-only mode
// Update UI elements for view-only mode
function updateUIForViewOnlyMode(puzzleInfo) {
    // Disable number pad buttons
    App.elements.numberBtns.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
    
    // Disable pencil mode
    App.elements.pencilMode.disabled = true;
    App.elements.pencilMode.parentElement.style.opacity = '0.5';
    
    // Disable erase button
    App.elements.eraseBtn.disabled = true;
    App.elements.eraseBtn.style.opacity = '0.5';
    
    // Add view-only class to grid
    App.elements.gridContainer.classList.add('view-only');
    
    // Show status message
    if (App.elements.puzzleStatusMessage) {
        App.elements.statusText.textContent = 'Puzzle Complete!';
        if (puzzleInfo.bestTime) {
            App.elements.statusSubtext.textContent = `Completed in ${formatTime(puzzleInfo.bestTime)} • Reset to play again`;
        } else {
            App.elements.statusSubtext.textContent = 'Reset to play again';
        }
        App.elements.puzzleStatusMessage.classList.remove('hidden');
    }
    
    // Show completion message
    if (puzzleInfo.bestTime) {
        Mascot.showMessage(`Viewing completed puzzle! Time: ${formatTime(puzzleInfo.bestTime)}`, 4000);
    }
}



// Check if there's unsaved progress
function hasUnsavedProgress() {
    // Check if any non-given cells have values
    if (!App.currentGrid) return false;
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = App.currentGrid.cells[row][col];
            if (!cell.isGiven && cell.value !== 0) {
                return true;
            }
        }
    }
    return false;
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
        
        // Mascot reaction for error
        Mascot.onError();
        
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
        
        // Mascot reaction for correct move
        Mascot.onCorrectMove();
        
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

    // Update progress bar
    updateProgressBar();
}

function handleErase() {
    if (!App.selectedCell) return;
    
    const { row, col } = App.selectedCell;
    const cell = App.currentGrid.cells[row][col];
    
    if (cell.isGiven) {
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellElement.classList.add('error-shake');
        setTimeout(() => cellElement.classList.remove('error-shake'), 500);
        
        // Mascot reaction for error
        Mascot.onError();
        
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
    
    // Track the move
    Mascot.stats.movesMade++;
    
    // Update conflict states after erasing
    Validation.updateAllConflictStates(App.currentGrid);
    
    // Save the action
    saveAction(action);
    
    // Re-render to update conflict displays
    Grid.render(App.currentGrid);

    // Update progress bar
    updateProgressBar();
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
    // Add mascot reaction
    Mascot.onHintRequest();
    
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
    
    // Show the hint panel with animation
    App.elements.hintPanel.classList.remove('hidden');
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
    } else {
        App.elements.hintText.textContent = hint.message;
        
        // Update highlight for new hint
        Grid.clearHintHighlights();
        if (hint.cells) {
            Grid.highlightHintCells(hint.cells);
        }
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
    if (hasUnsavedProgress()) {
        if (!confirm('Start a new game? Current progress will be lost.')) {
            return;
        }
    }
    
    // Get a random puzzle
    const puzzle = PuzzleDatabase.getRandomPuzzle();
    loadPuzzleIntoGame(puzzle);
    
    Mascot.showMessage('New puzzle loaded! Good luck!');
}

// Make it globally accessible for victory modal
window.handleNewGame = handleNewGame;

function handlePuzzleComplete() {
    console.log('🎉 Puzzle completed!');
    
    // Calculate completion time
    const completionTime = Math.floor((Date.now() - Mascot.stats.startTime) / 1000);
    
        // Save completion status if we have a puzzle ID
        if (App.currentPuzzleId) {
            const currentStatus = PuzzleDatabase.loadCompletionStatus()[App.currentPuzzleId] || {};
            const newStatus = {
                completed: true,
                bestTime: currentStatus.bestTime 
                    ? Math.min(currentStatus.bestTime, completionTime) 
                    : completionTime,
                lastCompleted: Date.now()
            };
            
            // Save completion status
            PuzzleDatabase.saveCompletionStatus(App.currentPuzzleId, newStatus);
            
            // Save the completed grid solution
            PuzzleDatabase.saveCompletedSolution(App.currentPuzzleId, App.currentGrid);
            
            // Refresh puzzle library to show completion status immediately
            // Use setTimeout to ensure the save operation completes first
            setTimeout(() => {
                refreshPuzzleLibrary();
                console.log('Completion status and solution saved for puzzle:', App.currentPuzzleId);
            }, 100);
        }
    
    // Add completion animation
    App.elements.gridContainer.classList.add('completed');
    
    // Trigger mascot celebration
    Mascot.onPuzzleComplete();
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