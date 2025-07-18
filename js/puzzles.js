// puzzles.js - Sudoku Puzzle Database

const PuzzleDatabase = {
    puzzles: [
        // EASY PUZZLES (1-8)
        {
            id: 1,
            difficulty: "easy",
            stars: 1,
            board: [
                [5,3,4,6,7,8,9,1,2],
                [6,7,2,1,9,5,3,4,8],
                [1,9,8,3,4,2,5,6,7],
                [8,5,9,7,6,1,4,2,3],
                [4,2,6,8,5,3,7,9,1],
                [7,1,3,9,2,4,8,5,6],
                [9,6,1,5,3,7,2,8,4],
                [2,8,7,4,1,9,6,3,5],
                [3,4,5,2,8,6,1,7,0]
            ]
        },
        {
            id: 2,
            difficulty: "easy",
            stars: 1,
            board: [
                [2,0,0,3,0,0,0,0,0],
                [8,0,4,0,6,2,0,0,3],
                [0,1,3,8,0,0,2,0,0],
                [0,0,0,0,2,0,3,9,0],
                [5,0,7,0,0,0,6,2,1],
                [0,3,2,0,0,6,0,0,0],
                [0,2,0,0,0,8,1,4,0],
                [6,0,0,2,1,0,5,0,8],
                [0,0,0,0,0,9,0,0,2]
            ]
        },
        {
            id: 3,
            difficulty: "easy",
            stars: 1,
            board: [
                [0,0,0,2,6,0,7,0,1],
                [6,8,0,0,7,0,0,9,0],
                [1,9,0,0,0,4,5,0,0],
                [8,2,0,1,0,0,0,4,0],
                [0,0,4,6,0,2,9,0,0],
                [0,5,0,0,0,3,0,2,8],
                [0,0,9,3,0,0,0,7,4],
                [0,4,0,0,5,0,0,3,6],
                [7,0,3,0,1,8,0,0,0]
            ]
        },
        {
            id: 4,
            difficulty: "easy",
            stars: 1,
            board: [
                [1,0,0,4,8,9,0,0,6],
                [7,3,0,0,0,0,0,4,0],
                [0,0,0,0,0,1,2,9,5],
                [0,0,7,1,2,0,6,0,0],
                [5,0,0,7,0,3,0,0,8],
                [0,0,6,0,9,5,7,0,0],
                [9,1,4,6,0,0,0,0,0],
                [0,2,0,0,0,0,0,3,7],
                [8,0,0,5,1,2,0,0,4]
            ]
        },
        {
            id: 5,
            difficulty: "easy",
            stars: 1,
            board: [
                [0,2,0,6,0,8,0,0,0],
                [5,8,0,0,0,9,7,0,0],
                [0,0,0,0,4,0,0,0,0],
                [3,7,0,0,0,0,5,0,0],
                [6,0,0,0,0,0,0,0,4],
                [0,0,8,0,0,0,0,1,3],
                [0,0,0,0,2,0,0,0,0],
                [0,0,9,8,0,0,0,3,6],
                [0,0,0,3,0,6,0,9,0]
            ]
        },
        {
            id: 6,
            difficulty: "easy",
            stars: 1,
            board: [
                [0,0,3,0,2,0,6,0,0],
                [9,0,0,3,0,5,0,0,1],
                [0,0,1,8,0,6,4,0,0],
                [0,0,8,1,0,2,9,0,0],
                [7,0,0,0,0,0,0,0,8],
                [0,0,6,7,0,8,2,0,0],
                [0,0,2,6,0,9,5,0,0],
                [8,0,0,2,0,3,0,0,9],
                [0,0,5,0,1,0,3,0,0]
            ]
        },
        {
            id: 7,
            difficulty: "easy",
            stars: 1,
            board: [
                [5,1,7,6,0,0,0,3,4],
                [2,8,9,0,0,4,0,0,0],
                [3,4,6,2,0,5,0,9,0],
                [6,0,2,0,0,0,0,1,0],
                [0,3,8,0,0,6,0,4,7],
                [0,0,0,0,0,0,6,0,0],
                [0,9,0,0,0,0,0,7,8],
                [7,0,3,4,0,0,5,6,0],
                [0,0,0,0,0,0,0,0,0]
            ]
        },
        {
            id: 8,
            difficulty: "easy",
            stars: 1,
            board: [
                [0,0,0,0,0,0,6,8,0],
                [0,0,0,0,7,3,0,0,0],
                [0,7,0,0,9,0,2,0,0],
                [5,0,0,0,0,7,0,0,0],
                [0,0,0,0,4,5,7,0,0],
                [0,0,0,1,0,0,0,3,0],
                [0,0,1,0,0,0,0,6,8],
                [0,0,8,5,0,0,0,1,0],
                [0,9,0,0,0,0,4,0,0]
            ]
        },

        // MEDIUM PUZZLES (9-16)
        {
            id: 9,
            difficulty: "medium",
            stars: 2,
            board: [
                [5,3,0,0,7,0,0,0,0],
                [6,0,0,1,9,5,0,0,0],
                [0,9,8,0,0,0,0,6,0],
                [8,0,0,0,6,0,0,0,3],
                [4,0,0,8,0,3,0,0,1],
                [7,0,0,0,2,0,0,0,6],
                [0,6,0,0,0,0,2,8,0],
                [0,0,0,4,1,9,0,0,5],
                [0,0,0,0,8,0,0,7,9]
            ]
        },
        {
            id: 10,
            difficulty: "medium",
            stars: 2,
            board: [
                [0,2,0,0,0,0,0,0,0],
                [0,0,0,6,0,0,0,0,3],
                [0,7,4,0,8,0,0,0,0],
                [0,0,0,0,0,3,0,0,2],
                [0,8,0,0,4,0,0,1,0],
                [6,0,0,5,0,0,0,0,0],
                [0,0,0,0,1,0,7,8,0],
                [5,0,0,0,0,9,0,0,0],
                [0,0,0,0,0,0,0,4,0]
            ]
        },
        {
            id: 11,
            difficulty: "medium",
            stars: 2,
            board: [
                [1,0,0,0,0,7,0,9,0],
                [0,3,0,0,2,0,0,0,8],
                [0,0,9,6,0,0,5,0,0],
                [0,0,5,3,0,0,9,0,0],
                [0,1,0,0,8,0,0,0,2],
                [6,0,0,0,0,4,0,0,0],
                [3,0,0,0,0,0,0,1,0],
                [0,4,0,0,0,0,0,0,7],
                [0,0,7,0,0,0,3,0,0]
            ]
        },
        {
            id: 12,
            difficulty: "medium",
            stars: 2,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,3,0,8,5],
                [0,0,1,0,2,0,0,0,0],
                [0,0,0,5,0,7,0,0,0],
                [0,0,4,0,0,0,1,0,0],
                [0,9,0,0,0,0,0,0,0],
                [5,0,0,0,0,0,0,7,3],
                [0,0,2,0,1,0,0,0,0],
                [0,0,0,0,4,0,0,0,9]
            ]
        },
        {
            id: 13,
            difficulty: "medium",
            stars: 2,
            board: [
                [7,8,0,4,0,0,1,2,0],
                [6,0,0,0,7,5,0,0,9],
                [0,0,0,6,0,1,0,7,8],
                [0,0,7,0,4,0,2,6,0],
                [0,0,1,0,5,0,9,3,0],
                [9,0,4,0,6,0,0,0,5],
                [0,7,0,3,0,0,0,1,2],
                [1,2,0,0,0,7,4,0,0],
                [0,4,9,2,0,6,0,0,7]
            ]
        },
        {
            id: 14,
            difficulty: "medium",
            stars: 2,
            board: [
                [0,0,5,3,0,0,0,0,0],
                [8,0,0,0,0,0,0,2,0],
                [0,7,0,0,1,0,5,0,0],
                [4,0,0,0,0,5,3,0,0],
                [0,1,0,0,7,0,0,0,6],
                [0,0,3,2,0,0,0,8,0],
                [0,6,0,5,0,0,0,0,9],
                [0,0,4,0,0,0,0,3,0],
                [0,0,0,0,0,9,7,0,0]
            ]
        },
        {
            id: 15,
            difficulty: "medium",
            stars: 2,
            board: [
                [0,4,0,0,0,0,0,0,0],
                [0,0,2,0,9,0,0,0,7],
                [0,0,0,0,0,5,0,0,1],
                [0,0,0,8,0,0,0,6,0],
                [9,0,0,0,0,0,0,0,8],
                [0,6,0,0,0,3,0,0,0],
                [7,0,0,6,0,0,0,0,0],
                [5,0,0,0,4,0,3,0,0],
                [0,0,0,0,0,0,0,2,0]
            ]
        },
        {
            id: 16,
            difficulty: "medium",
            stars: 2,
            board: [
                [0,6,0,1,0,4,0,5,0],
                [0,0,8,3,0,5,6,0,0],
                [2,0,0,0,0,0,0,0,1],
                [8,0,0,4,0,7,0,0,6],
                [0,0,6,0,0,0,3,0,0],
                [7,0,0,9,0,1,0,0,4],
                [5,0,0,0,0,0,0,0,2],
                [0,0,7,2,0,6,9,0,0],
                [0,4,0,5,0,8,0,7,0]
            ]
        },

        // HARD PUZZLES (17-24)
        {
            id: 17,
            difficulty: "hard",
            stars: 3,
            board: [
                [0,0,0,0,0,0,0,1,2],
                [0,0,0,0,0,0,0,0,3],
                [0,0,2,3,0,0,4,0,0],
                [0,0,1,8,0,0,0,0,5],
                [0,6,0,0,7,0,8,0,0],
                [0,0,0,0,0,9,0,0,0],
                [0,0,8,5,0,0,0,0,0],
                [9,0,0,0,4,0,5,0,0],
                [4,7,0,0,0,6,0,0,0]
            ]
        },
        {
            id: 18,
            difficulty: "hard",
            stars: 3,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,3,0,8,5],
                [0,0,1,0,2,0,0,0,0],
                [0,0,0,5,0,7,0,0,0],
                [0,0,4,0,0,0,1,0,0],
                [0,9,0,0,0,0,0,0,0],
                [5,0,0,0,0,0,0,7,3],
                [0,0,2,0,1,0,0,0,0],
                [0,0,0,0,4,0,0,0,9]
            ]
        },
        {
            id: 19,
            difficulty: "hard",
            stars: 3,
            board: [
                [2,0,0,3,0,0,0,0,0],
                [8,0,4,0,6,2,0,0,3],
                [0,1,3,8,0,0,2,0,0],
                [0,0,0,0,2,0,3,9,0],
                [5,0,7,0,0,0,6,2,1],
                [0,3,2,0,0,6,0,0,0],
                [0,2,0,0,0,8,1,0,0],
                [0,0,0,2,0,0,0,0,0],
                [1,0,0,0,0,0,0,0,7]
            ]
        },
        {
            id: 20,
            difficulty: "hard",
            stars: 3,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,0,9,7,0,0,0,0,1],
                [8,0,0,0,0,0,0,0,0],
                [0,0,7,0,0,0,0,0,0],
                [0,0,0,4,3,0,2,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,3,0],
                [5,0,0,0,0,9,0,0,0],
                [0,0,6,0,0,0,0,0,0]
            ]
        },
        {
            id: 21,
            difficulty: "hard",
            stars: 3,
            board: [
                [0,2,0,0,0,0,0,0,0],
                [0,0,0,6,0,0,0,0,0],
                [0,0,1,0,0,0,0,0,0],
                [0,7,0,0,0,0,0,0,0],
                [0,0,0,0,2,0,0,0,0],
                [3,0,0,0,0,0,4,0,0],
                [0,0,0,0,0,8,0,0,5],
                [0,0,0,0,0,0,6,0,0],
                [0,0,0,0,0,0,0,9,0]
            ]
        },
        {
            id: 22,
            difficulty: "hard",
            stars: 3,
            board: [
                [8,0,0,0,0,0,0,0,0],
                [0,0,3,6,0,0,0,0,0],
                [0,7,0,0,9,0,2,0,0],
                [0,5,0,0,0,7,0,0,0],
                [0,0,0,0,4,5,7,0,0],
                [0,0,0,1,0,0,0,3,0],
                [0,0,1,0,0,0,0,6,8],
                [0,0,8,5,0,0,0,1,0],
                [0,9,0,0,0,0,4,0,0]
            ]
        },
        {
            id: 23,
            difficulty: "hard",
            stars: 3,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,8,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0]
            ]
        },
        {
            id: 24,
            difficulty: "hard",
            stars: 3,
            board: [
                [0,0,0,0,0,0,9,0,7],
                [0,0,0,4,2,0,1,8,0],
                [0,0,0,7,0,5,0,2,6],
                [1,0,0,9,0,4,0,0,0],
                [0,5,0,0,0,0,0,4,0],
                [0,0,0,5,0,7,0,0,9],
                [9,2,0,1,0,8,0,0,0],
                [0,3,4,0,5,9,0,0,0],
                [5,0,7,0,0,0,0,0,0]
            ]
        },

        // EXPERT PUZZLES (25-30)
        {
            id: 25,
            difficulty: "expert",
            stars: 4,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,1]
            ]
        },
        {
            id: 26,
            difficulty: "expert",
            stars: 4,
            board: [
                [0,0,5,3,0,0,0,0,0],
                [8,0,0,0,0,0,0,2,0],
                [0,7,0,0,1,0,5,0,0],
                [4,0,0,0,0,5,3,0,0],
                [0,1,0,0,7,0,0,0,6],
                [0,0,3,2,0,0,0,8,0],
                [0,6,0,5,0,0,0,0,9],
                [0,0,4,0,0,0,0,3,0],
                [0,0,0,0,0,9,7,0,0]
            ]
        },
        {
            id: 27,
            difficulty: "expert",
            stars: 4,
            board: [
                [1,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,2]
            ]
        },
        {
            id: 28,
            difficulty: "expert",
            stars: 4,
            board: [
                [0,0,0,8,0,0,0,0,0],
                [0,0,0,0,0,0,0,4,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,6,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [2,0,0,0,0,0,0,0,0],
                [0,0,0,0,5,0,0,0,0],
                [0,0,0,0,0,0,0,0,0]
            ]
        },
        {
            id: 29,
            difficulty: "expert",
            stars: 4,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,1,2,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,3,4,0],
                [0,0,0,0,0,0,0,0,0]
            ]
        },
        {
            id: 30,
            difficulty: "expert",
            stars: 4,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0]
            ]
        }
    ],

    // Get puzzle by ID
    getPuzzleById(id) {
        return this.puzzles.find(puzzle => puzzle.id === id);
    },

    // Get puzzles by difficulty
    getPuzzlesByDifficulty(difficulty) {
        return this.puzzles.filter(puzzle => puzzle.difficulty === difficulty);
    },

    // Get a random puzzle
    getRandomPuzzle() {
        const randomIndex = Math.floor(Math.random() * this.puzzles.length);
        return this.puzzles[randomIndex];
    },

    // Get all puzzles
    getAllPuzzles() {
        return this.puzzles;
    },

    // Get puzzle count by difficulty
    getPuzzleCount() {
        return {
            easy: this.puzzles.filter(p => p.difficulty === 'easy').length,
            medium: this.puzzles.filter(p => p.difficulty === 'medium').length,
            hard: this.puzzles.filter(p => p.difficulty === 'hard').length,
            expert: this.puzzles.filter(p => p.difficulty === 'expert').length,
            total: this.puzzles.length
        };
    },

    // Load puzzle completion status from localStorage
    loadCompletionStatus() {
        const savedStatus = localStorage.getItem('sudoku_puzzle_status');
        return savedStatus ? JSON.parse(savedStatus) : {};
    },

    // Save puzzle completion status
    saveCompletionStatus(puzzleId, status) {
        const allStatus = this.loadCompletionStatus();
        allStatus[puzzleId] = status;
        localStorage.setItem('sudoku_puzzle_status', JSON.stringify(allStatus));
    },

    // Get formatted puzzle info for display
    getPuzzleInfo(puzzle) {
        const status = this.loadCompletionStatus()[puzzle.id] || {};
        return {
            id: puzzle.id,
            difficulty: puzzle.difficulty,
            stars: puzzle.stars,
            completed: status.completed || false,
            bestTime: status.bestTime || null,
            displayName: `Puzzle #${puzzle.id}`
        };
    },

     // Save completed puzzle solution
     saveCompletedSolution(puzzleId, grid) {
        try {
            const completedSolutions = this.loadCompletedSolutions();
            
            // Serialize the completed grid
            const serializedGrid = Storage.serializeGrid(grid);
            completedSolutions[puzzleId] = {
                solution: serializedGrid,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            localStorage.setItem('sudoku_completed_solutions', JSON.stringify(completedSolutions));
            return true;
        } catch (error) {
            console.error('Error saving completed solution:', error);
            return false;
        }
    },
    
    // Load completed puzzle solutions
    loadCompletedSolutions() {
        try {
            const saved = localStorage.getItem('sudoku_completed_solutions');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading completed solutions:', error);
            return {};
        }
    },
    
    // Get completed solution for a specific puzzle
    getCompletedSolution(puzzleId) {
        try {
            const completedSolutions = this.loadCompletedSolutions();
            const solutionData = completedSolutions[puzzleId];
            
            if (solutionData && solutionData.solution) {
                return Storage.deserializeGrid(solutionData.solution);
            }
            return null;
        } catch (error) {
            console.error('Error getting completed solution:', error);
            return null;
        }
    },
    
    // Remove completed solution (when puzzle is reset)
    removeCompletedSolution(puzzleId) {
        try {
            const completedSolutions = this.loadCompletedSolutions();
            delete completedSolutions[puzzleId];
            localStorage.setItem('sudoku_completed_solutions', JSON.stringify(completedSolutions));
            return true;
        } catch (error) {
            console.error('Error removing completed solution:', error);
            return false;
        }
    }
};