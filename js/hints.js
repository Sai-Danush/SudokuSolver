// hints.js - Hint Generation System

const Hints = {
    // Generate a hint based on the current grid state and hint level
    generateHint(grid, level) {
        // First, find all available moves
        const moves = Solver.findAllMoves(grid);
        
        if (moves.length === 0) {
            // No moves found - check if puzzle is complete or invalid
            if (Validation.isPuzzleComplete(grid)) {
                return {
                    message: "Congratulations! The puzzle is already complete! 🎉",
                    cells: []
                };
            } else if (!Solver.isValidState(grid)) {
                return {
                    message: "There appears to be an error in the puzzle. Check for conflicts!",
                    cells: this.findConflictingCells(grid)
                };
            } else {
                return {
                    message: "This puzzle requires more advanced techniques that aren't implemented yet. Keep trying!",
                    cells: []
                };
            }
        }
        
        // Select the best move (prefer simpler techniques)
        const move = this.selectBestMove(moves);
        
        // Generate hint based on level
        switch (level) {
            case 1:
                return this.generateLevel1Hint(move, grid);
            case 2:
                return this.generateLevel2Hint(move, grid);
            case 3:
                return this.generateLevel3Hint(move, grid);
            default:
                return this.generateLevel1Hint(move, grid);
        }
    },
    
    // Level 1: Gentle nudge - just point to the general area
    generateLevel1Hint(move, grid) {
        const hints = [];
        const { row, col } = move;
        
        // Generate various vague hints
        hints.push({
            message: `Take a closer look at row ${row + 1}.`,
            cells: this.getRowCells(row)
        });
        
        hints.push({
            message: `Something interesting is happening in column ${col + 1}.`,
            cells: this.getColumnCells(col)
        });
        
        const boxNum = this.getBoxNumber(row, col);
        hints.push({
            message: `Check out box ${boxNum} - there's a move there!`,
            cells: this.getBoxCells(row, col)
        });
        
        // Mix it up with some variety
        if (move.technique === 'naked single') {
            hints.push({
                message: `Look for a cell that has only one possible value.`,
                cells: []
            });
        } else if (move.technique === 'hidden single') {
            hints.push({
                message: `There's a number that can only go in one place somewhere.`,
                cells: []
            });
        }
        
        // Return a random hint from the options
        return hints[Math.floor(Math.random() * hints.length)];
    },
    
    // Level 2: Technique hint - explain what to look for
    generateLevel2Hint(move, grid) {
        const { row, col, value, technique } = move;
        let hint = { cells: [] };
        
        switch (technique) {
            case 'naked single':
                hint.message = `Look for a naked single in box ${this.getBoxNumber(row, col)}. ` +
                              `A naked single is a cell that can only contain one possible value.`;
                hint.cells = [{ row, col }];
                break;
                
            case 'hidden single':
                hint.message = this.generateHiddenSingleHint(move);
                hint.cells = this.getRelevantCellsForHiddenSingle(move, grid);
                break;
                
            case 'naked pair':
                hint.message = `There's a naked pair in ${this.getUnitDescription(move)}. ` +
                              `Two cells that can only contain the same two values: ${move.values.join(' and ')}.`;
                hint.cells = move.cells;
                break;
                
            default:
                hint.message = `Try using the ${technique} technique in this area.`;
                hint.cells = [{ row, col }];
        }
        
        return hint;
    },
    
    // Level 3: Specific solution - tell them exactly what to do
    generateLevel3Hint(move, grid) {
        const { row, col, value, technique, reason } = move;
        
        let hint = {
            message: reason || `Place ${value} in R${row + 1}C${col + 1}.`,
            cells: [{ row, col }]
        };
        
        // Add more explanation based on technique
        switch (technique) {
            case 'naked single':
                const candidates = Solver.getCellCandidates(grid, row, col);
                hint.message = `R${row + 1}C${col + 1} is a naked single - it can only be ${value}. ` +
                              `All other numbers (${this.getMissingNumbers(candidates)}) are already used in the same row, column, or box.`;
                break;
                
            case 'hidden single':
                hint.message = `${value} is a hidden single at R${row + 1}C${col + 1}. ` + 
                              reason;
                hint.cells = this.getRelevantCellsForHiddenSingle(move, grid);
                break;
                
            case 'naked pair':
                hint.message = `This naked pair (${move.values.join(', ')}) eliminates candidates from other cells. ` +
                              `You can remove these values from the highlighted cells.`;
                hint.cells = [...move.cells, ...move.eliminations.map(e => ({ row: e.row, col: e.col }))];
                break;
        }
        
        return hint;
    },
    
    // Generate a helpful description for hidden singles
    generateHiddenSingleHint(move) {
        const { row, col, value, reason } = move;
        
        if (reason.includes('row')) {
            return `Look for a hidden single in row ${row + 1}. ` +
                   `There's a number that can only go in one cell in this row.`;
        } else if (reason.includes('column')) {
            return `Look for a hidden single in column ${col + 1}. ` +
                   `One number has only one possible position in this column.`;
        } else if (reason.includes('box')) {
            return `Look for a hidden single in box ${this.getBoxNumber(row, col)}. ` +
                   `A certain number can only fit in one cell within this box.`;
        }
        
        return `There's a hidden single nearby. Look for a number that can only go in one specific cell.`;
    },
    
    // Get cells to highlight for hidden single hints
    getRelevantCellsForHiddenSingle(move, grid) {
        const { row, col, value, reason } = move;
        const cells = [{ row, col }]; // Always include the target cell
        
        // Add other empty cells in the relevant unit
        if (reason.includes('row')) {
            for (let c = 0; c < 9; c++) {
                if (c !== col && grid.cells[row][c].value === 0) {
                    cells.push({ row, col: c });
                }
            }
        } else if (reason.includes('column')) {
            for (let r = 0; r < 9; r++) {
                if (r !== row && grid.cells[r][col].value === 0) {
                    cells.push({ row: r, col });
                }
            }
        } else if (reason.includes('box')) {
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let r = boxRow; r < boxRow + 3; r++) {
                for (let c = boxCol; c < boxCol + 3; c++) {
                    if ((r !== row || c !== col) && grid.cells[r][c].value === 0) {
                        cells.push({ row: r, col: c });
                    }
                }
            }
        }
        
        return cells;
    },
    
    // Select the best move from available options
    selectBestMove(moves) {
        // Prefer moves in this order: naked singles > hidden singles > pairs
        const priorityOrder = ['naked single', 'hidden single', 'naked pair'];
        
        for (const technique of priorityOrder) {
            const move = moves.find(m => m.technique === technique);
            if (move) return move;
        }
        
        // Return first move if no preferred technique found
        return moves[0];
    },
    
    // Find cells with conflicts for error hints
    findConflictingCells(grid) {
        const conflicts = [];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid.cells[row][col].value !== 0) {
                    const cellConflicts = Validation.checkConflicts(grid, row, col);
                    if (cellConflicts.length > 0) {
                        conflicts.push({ row, col });
                    }
                }
            }
        }
        
        return conflicts;
    },
    
    // Helper functions for getting cell groups
    getRowCells(row) {
        const cells = [];
        for (let col = 0; col < 9; col++) {
            cells.push({ row, col });
        }
        return cells;
    },
    
    getColumnCells(col) {
        const cells = [];
        for (let row = 0; row < 9; row++) {
            cells.push({ row, col });
        }
        return cells;
    },
    
    getBoxCells(row, col) {
        const cells = [];
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                cells.push({ row: r, col: c });
            }
        }
        
        return cells;
    },
    
    // Get box number (1-9) from row and column
    getBoxNumber(row, col) {
        const boxRow = Math.floor(row / 3);
        const boxCol = Math.floor(col / 3);
        return boxRow * 3 + boxCol + 1;
    },
    
    // Get missing numbers for display
    getMissingNumbers(candidates) {
        const all = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const missing = all.filter(n => !candidates.has(n));
        return missing.join(', ');
    },
    
    // Get unit description for hints
    getUnitDescription(move) {
        if (move.reason.includes('row')) {
            return `row ${move.cells[0].row + 1}`;
        } else if (move.reason.includes('column')) {
            return `column ${move.cells[0].col + 1}`;
        } else if (move.reason.includes('box')) {
            return `box ${this.getBoxNumber(move.cells[0].row, move.cells[0].col)}`;
        }
        return 'this unit';
    }
};