// validation.js - Input Validation and Conflict Detection

const Validation = {
    // Check if placing a value at a position would be valid
    isValidMove(grid, row, col, value) {
        // Can't place in a given cell
        if (grid.cells[row][col].isGiven) {
            return false;
        }
        
        // Check if value already exists in row
        for (let c = 0; c < 9; c++) {
            if (c !== col && grid.cells[row][c].value === value) {
                return false;
            }
        }
        
        // Check if value already exists in column
        for (let r = 0; r < 9; r++) {
            if (r !== row && grid.cells[r][col].value === value) {
                return false;
            }
        }
        
        // Check if value already exists in 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && grid.cells[r][c].value === value) {
                    return false;
                }
            }
        }
        
        return true;
    },
    
    // Check for conflicts with a cell's current value
    checkConflicts(grid, row, col) {
        const conflicts = [];
        const value = grid.cells[row][col].value;
        
        if (value === 0) return conflicts;
        
        // Check row conflicts
        for (let c = 0; c < 9; c++) {
            if (c !== col && grid.cells[row][c].value === value) {
                conflicts.push({ row, col: c, type: 'row' });
            }
        }
        
        // Check column conflicts
        for (let r = 0; r < 9; r++) {
            if (r !== row && grid.cells[r][col].value === value) {
                conflicts.push({ row: r, col, type: 'column' });
            }
        }
        
        // Check box conflicts
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && grid.cells[r][c].value === value) {
                    conflicts.push({ row: r, col: c, type: 'box' });
                }
            }
        }
        
        return conflicts;
    },
    
    // Check if the entire puzzle is complete and valid
    isPuzzleComplete(grid) {
        // First check if all cells are filled
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid.cells[row][col].value === 0) {
                    return false;
                }
            }
        }
        
        // Then check if the solution is valid
        return this.isPuzzleValid(grid);
    },
    
    // Check if the current state of the puzzle is valid (no conflicts)
    isPuzzleValid(grid) {
        // Check all rows
        for (let row = 0; row < 9; row++) {
            if (!this.isRowValid(grid, row)) {
                return false;
            }
        }
        
        // Check all columns
        for (let col = 0; col < 9; col++) {
            if (!this.isColumnValid(grid, col)) {
                return false;
            }
        }
        
        // Check all boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                if (!this.isBoxValid(grid, boxRow, boxCol)) {
                    return false;
                }
            }
        }
        
        return true;
    },
    
    // Check if a row is valid
    isRowValid(grid, row) {
        const seen = new Set();
        
        for (let col = 0; col < 9; col++) {
            const value = grid.cells[row][col].value;
            if (value !== 0) {
                if (seen.has(value)) {
                    return false;
                }
                seen.add(value);
            }
        }
        
        return true;
    },
    
    // Check if a column is valid
    isColumnValid(grid, col) {
        const seen = new Set();
        
        for (let row = 0; row < 9; row++) {
            const value = grid.cells[row][col].value;
            if (value !== 0) {
                if (seen.has(value)) {
                    return false;
                }
                seen.add(value);
            }
        }
        
        return true;
    },
    
    // Check if a 3x3 box is valid
    isBoxValid(grid, boxRow, boxCol) {
        const seen = new Set();
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;
        
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                const value = grid.cells[r][c].value;
                if (value !== 0) {
                    if (seen.has(value)) {
                        return false;
                    }
                    seen.add(value);
                }
            }
        }
        
        return true;
    },
    
    // Find all cells with conflicts in the grid
    findAllConflicts(grid) {
        const allConflicts = new Map(); // Use Map to avoid duplicates
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid.cells[row][col].value !== 0) {
                    const conflicts = this.checkConflicts(grid, row, col);
                    
                    if (conflicts.length > 0) {
                        // Add the current cell
                        const key = `${row},${col}`;
                        allConflicts.set(key, { row, col });
                        
                        // Add all conflicting cells
                        conflicts.forEach(conflict => {
                            const conflictKey = `${conflict.row},${conflict.col}`;
                            allConflicts.set(conflictKey, { row: conflict.row, col: conflict.col });
                        });
                    }
                }
            }
        }
        
        return Array.from(allConflicts.values());
    },
    
    // Check if a puzzle has a unique solution (for puzzle generation)
    hasUniqueSolution(grid) {
        // This would require a more complex solving algorithm
        // For now, we'll just check if it's solvable
        // This can be expanded later for puzzle generation
        return this.isSolvable(grid);
    },
    
    // Basic check if puzzle is solvable
    isSolvable(grid) {
        // Check current state is valid
        if (!this.isPuzzleValid(grid)) {
            return false;
        }
        
        // Check if there are moves available or puzzle is complete
        const moves = Solver.findAllMoves(grid);
        return moves.length > 0 || this.isPuzzleComplete(grid);
    },
    
    // Validate pencil marks (remove invalid ones)
    validatePencilMarks(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid.cells[row][col].value === 0) {
                    const validCandidates = Solver.getCellCandidates(grid, row, col);
                    const currentMarks = grid.cells[row][col].pencilMarks;
                    
                    // Remove invalid pencil marks
                    for (const mark of currentMarks) {
                        if (!validCandidates.has(mark)) {
                            currentMarks.delete(mark);
                        }
                    }
                }
            }
        }
    },
    
    // Check difficulty level of puzzle (basic implementation)
    assessDifficulty(grid) {
        let emptyCells = 0;
        let givenCells = 0;
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid.cells[row][col].value === 0) {
                    emptyCells++;
                } else if (grid.cells[row][col].isGiven) {
                    givenCells++;
                }
            }
        }
        
        // Basic difficulty assessment based on given cells
        if (givenCells > 35) return 'Easy';
        if (givenCells > 28) return 'Medium';
        if (givenCells > 22) return 'Hard';
        return 'Expert';
    },
    
    // Get statistics about the current puzzle state
    getGridStatistics(grid) {
        const stats = {
            totalCells: 81,
            filledCells: 0,
            emptyCells: 0,
            givenCells: 0,
            userCells: 0,
            conflicts: 0,
            completionPercentage: 0
        };
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = grid.cells[row][col];
                
                if (cell.value !== 0) {
                    stats.filledCells++;
                    if (cell.isGiven) {
                        stats.givenCells++;
                    } else {
                        stats.userCells++;
                    }
                } else {
                    stats.emptyCells++;
                }
                
                if (cell.hasConflict) {
                    stats.conflicts++;
                }
            }
        }
        
        stats.completionPercentage = Math.round((stats.filledCells / stats.totalCells) * 100);
        
        return stats;
    }
};