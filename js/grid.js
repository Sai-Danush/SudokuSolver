// grid.js - Grid Rendering and Visual Updates

const Grid = {
    // Create an empty 9x9 grid structure
    createEmptyGrid() {
        const grid = {
            cells: [],
            solution: null // Will store the solution when available
        };
        
        for (let row = 0; row < 9; row++) {
            grid.cells[row] = [];
            for (let col = 0; col < 9; col++) {
                grid.cells[row][col] = {
                    value: 0,
                    isGiven: false,
                    pencilMarks: new Set(),
                    hasConflict: false
                };
            }
        }
        
        return grid;
    },
    
    // Load a puzzle into the grid
    loadPuzzle(grid, puzzle) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = puzzle[row][col];
                if (value !== 0) {
                    grid.cells[row][col].value = value;
                    grid.cells[row][col].isGiven = true;
                    grid.cells[row][col].pencilMarks.clear();
                }
            }
        }
    },
    
    // Render the grid to the DOM
    render(grid) {
        const container = App.elements.gridContainer;
        container.innerHTML = ''; // Clear existing cells
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.createCellElement(grid, row, col);
                container.appendChild(cell);
            }
        }
        
        // Restore selection if any
        if (App.selectedCell) {
            const { row, col } = App.selectedCell;
            const selectedElement = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (selectedElement) {
                selectedElement.classList.add('selected');
                this.highlightRelatedCells(row, col);
            }
        }
    },
    
    // Create a single cell DOM element
    createCellElement(grid, row, col) {
        const cell = grid.cells[row][col];
        const cellDiv = document.createElement('div');
        cellDiv.className = 'sudoku-cell';
        cellDiv.dataset.row = row;
        cellDiv.dataset.col = col;
        
        // Add CSS variable for staggered animations
        cellDiv.style.setProperty('--cell-index', row * 9 + col);
        
        // Add classes based on cell state
        if (cell.isGiven) {
            cellDiv.classList.add('given');
        } else if (cell.value !== 0) {
            cellDiv.classList.add('user-input');
        }
        
        if (cell.hasConflict) {
            cellDiv.classList.add('error');
        }
        
        // Add thicker borders for 3x3 boxes
        if (col % 3 === 2 && col !== 8) {
            cellDiv.style.borderRightWidth = '3px';
        }
        if (row % 3 === 2 && row !== 8) {
            cellDiv.style.borderBottomWidth = '3px';
        }
        
        // Add content
        if (cell.value !== 0) {
            cellDiv.textContent = cell.value;
            cellDiv.classList.add('number-placed');
        } else if (cell.pencilMarks.size > 0) {
            cellDiv.appendChild(this.createPencilMarksElement(cell.pencilMarks));
        }
        
        // Add click handler
        cellDiv.addEventListener('click', () => {
            window.handleCellClick(row, col);
        });
        
        return cellDiv;
    },
    
    // Create pencil marks display
    createPencilMarksElement(pencilMarks) {
        const container = document.createElement('div');
        container.className = 'pencil-marks';
        
        for (let num = 1; num <= 9; num++) {
            const mark = document.createElement('div');
            mark.className = 'pencil-mark';
            if (pencilMarks.has(num)) {
                mark.textContent = num;
            }
            container.appendChild(mark);
        }
        
        return container;
    },
    
    // Place a number in a cell
    placeNumber(grid, row, col, value) {
        const cell = grid.cells[row][col];
        cell.value = value;
        cell.pencilMarks.clear();
        
        // Clear pencil marks in related cells
        this.clearRelatedPencilMarks(grid, row, col, value);
        
        // Add animation class to the cell
        setTimeout(() => {
            const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cellElement) {
                cellElement.classList.add('number-placed');
            }
        }, 10);
    },
    
    // Toggle a pencil mark
    togglePencilMark(grid, row, col, number) {
        const cell = grid.cells[row][col];
        
        // Can't add pencil marks to cells with values
        if (cell.value !== 0) return;
        
        if (cell.pencilMarks.has(number)) {
            cell.pencilMarks.delete(number);
        } else {
            cell.pencilMarks.add(number);
        }
    },
    
    // Clear a cell
    clearCell(grid, row, col) {
        const cell = grid.cells[row][col];
        cell.value = 0;
        cell.pencilMarks.clear();
        cell.hasConflict = false;
    },
    
    // Clear pencil marks in related cells when a number is placed
    clearRelatedPencilMarks(grid, row, col, value) {
        // Clear from same row
        for (let c = 0; c < 9; c++) {
            grid.cells[row][c].pencilMarks.delete(value);
        }
        
        // Clear from same column
        for (let r = 0; r < 9; r++) {
            grid.cells[r][col].pencilMarks.delete(value);
        }
        
        // Clear from same 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                grid.cells[r][c].pencilMarks.delete(value);
            }
        }
    },
    
    // Highlight cells related to the selected cell
    highlightRelatedCells(row, col) {
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => cell.classList.remove('highlighted'));
        
        // Highlight same row
        for (let c = 0; c < 9; c++) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${c}"]`);
            if (cell && c !== col) cell.classList.add('highlighted');
        }
        
        // Highlight same column
        for (let r = 0; r < 9; r++) {
            const cell = document.querySelector(`[data-row="${r}"][data-col="${col}"]`);
            if (cell && r !== row) cell.classList.add('highlighted');
        }
        
        // Highlight same 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (r !== row || c !== col) {
                    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    if (cell) cell.classList.add('highlighted');
                }
            }
        }
    },
    
    // Clear all highlights
    clearHighlights() {
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => {
            cell.classList.remove('highlighted');
            cell.classList.remove('hint-related');
        });
    },
    
    // Mark cells with conflicts
    markConflicts(conflicts) {
        // Clear previous conflict marks
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => cell.classList.remove('error'));
        
        // Mark conflicting cells
        conflicts.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('error');
                cell.classList.add('error-shake');
                setTimeout(() => cell.classList.remove('error-shake'), 500);
            }
        });
    },
    
    // Highlight cells for hints
    highlightHintCells(cells) {
        this.clearHighlights();
        
        cells.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('hint-related');
            }
        });
    },
    
    // Clear hint highlights
    clearHintHighlights() {
        const cells = document.querySelectorAll('.hint-related');
        cells.forEach(cell => cell.classList.remove('hint-related'));
    },
    
    // Get a cell's coordinates from the DOM element
    getCellCoordinates(cellElement) {
        return {
            row: parseInt(cellElement.dataset.row),
            col: parseInt(cellElement.dataset.col)
        };
    },
    
    // Check if a cell is in the same unit (row, column, or box) as another
    areCellsRelated(row1, col1, row2, col2) {
        // Same row
        if (row1 === row2) return true;
        
        // Same column
        if (col1 === col2) return true;
        
        // Same 3x3 box
        const box1Row = Math.floor(row1 / 3);
        const box1Col = Math.floor(col1 / 3);
        const box2Row = Math.floor(row2 / 3);
        const box2Col = Math.floor(col2 / 3);
        
        return box1Row === box2Row && box1Col === box2Col;
    }
};