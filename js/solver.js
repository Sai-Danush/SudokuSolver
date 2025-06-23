// solver.js - Sudoku Solving Algorithms

const Solver = {
    // Find all candidates (possible values) for each empty cell
    calculateCandidates(grid) {
        const candidates = [];
        
        for (let row = 0; row < 9; row++) {
            candidates[row] = [];
            for (let col = 0; col < 9; col++) {
                if (grid.cells[row][col].value === 0) {
                    candidates[row][col] = this.getCellCandidates(grid, row, col);
                } else {
                    candidates[row][col] = new Set();
                }
            }
        }
        
        return candidates;
    },
    
    // Get possible values for a specific cell
    getCellCandidates(grid, row, col) {
        if (grid.cells[row][col].value !== 0) {
            return new Set();
        }
        
        const candidates = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        // Remove values from same row
        for (let c = 0; c < 9; c++) {
            const value = grid.cells[row][c].value;
            if (value !== 0) {
                candidates.delete(value);
            }
        }
        
        // Remove values from same column
        for (let r = 0; r < 9; r++) {
            const value = grid.cells[r][col].value;
            if (value !== 0) {
                candidates.delete(value);
            }
        }
        
        // Remove values from same 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                const value = grid.cells[r][c].value;
                if (value !== 0) {
                    candidates.delete(value);
                }
            }
        }
        
        return candidates;
    },
    
    // Find naked singles (cells with only one candidate)
    findNakedSingles(grid) {
        const singles = [];
        const candidates = this.calculateCandidates(grid);
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid.cells[row][col].value === 0 && candidates[row][col].size === 1) {
                    const value = [...candidates[row][col]][0];
                    singles.push({
                        row,
                        col,
                        value,
                        technique: 'naked single',
                        reason: `Cell R${row + 1}C${col + 1} can only be ${value}`
                    });
                }
            }
        }
        
        return singles;
    },
    
    // Find hidden singles (values that can only go in one cell in a unit)
    findHiddenSingles(grid) {
        const singles = [];
        const candidates = this.calculateCandidates(grid);
        
        // Check rows
        for (let row = 0; row < 9; row++) {
            const rowSingles = this.findHiddenSinglesInUnit(
                grid, candidates,
                (i) => ({ row, col: i }),
                `row ${row + 1}`
            );
            singles.push(...rowSingles);
        }
        
        // Check columns
        for (let col = 0; col < 9; col++) {
            const colSingles = this.findHiddenSinglesInUnit(
                grid, candidates,
                (i) => ({ row: i, col }),
                `column ${col + 1}`
            );
            singles.push(...colSingles);
        }
        
        // Check boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const boxSingles = this.findHiddenSinglesInBox(
                    grid, candidates,
                    boxRow, boxCol
                );
                singles.push(...boxSingles);
            }
        }
        
        return singles;
    },
    
    // Helper for finding hidden singles in a unit (row or column)
    findHiddenSinglesInUnit(grid, candidates, getCoords, unitName) {
        const singles = [];
        const valueCounts = new Map();
        
        // Count where each value can go
        for (let i = 0; i < 9; i++) {
            const { row, col } = getCoords(i);
            if (grid.cells[row][col].value === 0) {
                for (const value of candidates[row][col]) {
                    if (!valueCounts.has(value)) {
                        valueCounts.set(value, []);
                    }
                    valueCounts.get(value).push({ row, col });
                }
            }
        }
        
        // Find values that can only go in one cell
        for (const [value, positions] of valueCounts) {
            if (positions.length === 1) {
                const { row, col } = positions[0];
                singles.push({
                    row,
                    col,
                    value,
                    technique: 'hidden single',
                    reason: `${value} can only go in R${row + 1}C${col + 1} in ${unitName}`
                });
            }
        }
        
        return singles;
    },
    
    // Helper for finding hidden singles in a box
    findHiddenSinglesInBox(grid, candidates, boxRow, boxCol) {
        const singles = [];
        const valueCounts = new Map();
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;
        
        // Count where each value can go in the box
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (grid.cells[r][c].value === 0) {
                    for (const value of candidates[r][c]) {
                        if (!valueCounts.has(value)) {
                            valueCounts.set(value, []);
                        }
                        valueCounts.get(value).push({ row: r, col: c });
                    }
                }
            }
        }
        
        // Find values that can only go in one cell
        for (const [value, positions] of valueCounts) {
            if (positions.length === 1) {
                const { row, col } = positions[0];
                singles.push({
                    row,
                    col,
                    value,
                    technique: 'hidden single',
                    reason: `${value} can only go in R${row + 1}C${col + 1} in box ${boxRow * 3 + boxCol + 1}`
                });
            }
        }
        
        return singles;
    },
    
    // Find naked pairs (two cells in a unit with the same two candidates)
    findNakedPairs(grid) {
        const pairs = [];
        const candidates = this.calculateCandidates(grid);
        
        // Check rows
        for (let row = 0; row < 9; row++) {
            pairs.push(...this.findNakedPairsInUnit(
                grid, candidates,
                (i) => ({ row, col: i }),
                'row'
            ));
        }
        
        // Check columns
        for (let col = 0; col < 9; col++) {
            pairs.push(...this.findNakedPairsInUnit(
                grid, candidates,
                (i) => ({ row: i, col }),
                'column'
            ));
        }
        
        // Check boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                pairs.push(...this.findNakedPairsInBox(
                    grid, candidates,
                    boxRow, boxCol
                ));
            }
        }
        
        return pairs;
    },
    
    // Helper for finding naked pairs in a unit
    findNakedPairsInUnit(grid, candidates, getCoords, unitType) {
        const pairs = [];
        const cellsWithTwoCandidates = [];
        
        // Find cells with exactly 2 candidates
        for (let i = 0; i < 9; i++) {
            const { row, col } = getCoords(i);
            if (grid.cells[row][col].value === 0 && candidates[row][col].size === 2) {
                cellsWithTwoCandidates.push({ row, col, candidates: [...candidates[row][col]] });
            }
        }
        
        // Find matching pairs
        for (let i = 0; i < cellsWithTwoCandidates.length - 1; i++) {
            for (let j = i + 1; j < cellsWithTwoCandidates.length; j++) {
                const cell1 = cellsWithTwoCandidates[i];
                const cell2 = cellsWithTwoCandidates[j];
                
                if (this.arraysEqual(cell1.candidates, cell2.candidates)) {
                    // Found a naked pair - check if it eliminates anything
                    const eliminations = this.findNakedPairEliminations(
                        grid, candidates, cell1, cell2, getCoords
                    );
                    
                    if (eliminations.length > 0) {
                        pairs.push({
                            cells: [cell1, cell2],
                            values: cell1.candidates,
                            eliminations,
                            technique: 'naked pair',
                            reason: `Cells R${cell1.row + 1}C${cell1.col + 1} and R${cell2.row + 1}C${cell2.col + 1} form a naked pair with values ${cell1.candidates.join(',')}`
                        });
                    }
                }
            }
        }
        
        return pairs;
    },
    
    // Helper for finding naked pairs in a box
    findNakedPairsInBox(grid, candidates, boxRow, boxCol) {
        const pairs = [];
        const cellsWithTwoCandidates = [];
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;
        
        // Find cells with exactly 2 candidates in the box
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (grid.cells[r][c].value === 0 && candidates[r][c].size === 2) {
                    cellsWithTwoCandidates.push({ row: r, col: c, candidates: [...candidates[r][c]] });
                }
            }
        }
        
        // Find matching pairs (similar logic as unit helper)
        for (let i = 0; i < cellsWithTwoCandidates.length - 1; i++) {
            for (let j = i + 1; j < cellsWithTwoCandidates.length; j++) {
                const cell1 = cellsWithTwoCandidates[i];
                const cell2 = cellsWithTwoCandidates[j];
                
                if (this.arraysEqual(cell1.candidates, cell2.candidates)) {
                    // Check for eliminations in the box
                    const eliminations = [];
                    
                    for (let r = startRow; r < startRow + 3; r++) {
                        for (let c = startCol; c < startCol + 3; c++) {
                            if ((r !== cell1.row || c !== cell1.col) && 
                                (r !== cell2.row || c !== cell2.col) &&
                                grid.cells[r][c].value === 0) {
                                
                                for (const value of cell1.candidates) {
                                    if (candidates[r][c].has(value)) {
                                        eliminations.push({ row: r, col: c, value });
                                    }
                                }
                            }
                        }
                    }
                    
                    if (eliminations.length > 0) {
                        pairs.push({
                            cells: [cell1, cell2],
                            values: cell1.candidates,
                            eliminations,
                            technique: 'naked pair',
                            reason: `Cells R${cell1.row + 1}C${cell1.col + 1} and R${cell2.row + 1}C${cell2.col + 1} form a naked pair in box ${boxRow * 3 + boxCol + 1}`
                        });
                    }
                }
            }
        }
        
        return pairs;
    },
    
    // Find eliminations from a naked pair
    findNakedPairEliminations(grid, candidates, cell1, cell2, getCoords) {
        const eliminations = [];
        
        for (let i = 0; i < 9; i++) {
            const { row, col } = getCoords(i);
            
            // Skip the pair cells themselves
            if ((row === cell1.row && col === cell1.col) || 
                (row === cell2.row && col === cell2.col)) {
                continue;
            }
            
            if (grid.cells[row][col].value === 0) {
                for (const value of cell1.candidates) {
                    if (candidates[row][col].has(value)) {
                        eliminations.push({ row, col, value });
                    }
                }
            }
        }
        
        return eliminations;
    },
    
    // Find all available moves using various techniques
    findAllMoves(grid) {
        const moves = [];
        
        // Try techniques in order of complexity
        moves.push(...this.findNakedSingles(grid));
        if (moves.length === 0) {
            moves.push(...this.findHiddenSingles(grid));
        }
        if (moves.length === 0) {
            moves.push(...this.findNakedPairs(grid));
        }
        
        return moves;
    },
    
    // Check if the current grid state is valid (no conflicts)
    isValidState(grid) {
        // Check rows
        for (let row = 0; row < 9; row++) {
            if (!this.isValidUnit(grid.cells[row].map(cell => cell.value))) {
                return false;
            }
        }
        
        // Check columns
        for (let col = 0; col < 9; col++) {
            const column = [];
            for (let row = 0; row < 9; row++) {
                column.push(grid.cells[row][col].value);
            }
            if (!this.isValidUnit(column)) {
                return false;
            }
        }
        
        // Check boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const box = [];
                const startRow = boxRow * 3;
                const startCol = boxCol * 3;
                
                for (let r = startRow; r < startRow + 3; r++) {
                    for (let c = startCol; c < startCol + 3; c++) {
                        box.push(grid.cells[r][c].value);
                    }
                }
                
                if (!this.isValidUnit(box)) {
                    return false;
                }
            }
        }
        
        return true;
    },
    
    // Check if a unit (row, column, or box) is valid
    isValidUnit(values) {
        const seen = new Set();
        
        for (const value of values) {
            if (value !== 0) {
                if (seen.has(value)) {
                    return false;
                }
                seen.add(value);
            }
        }
        
        return true;
    },
    
    // Utility function to compare arrays
    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
};