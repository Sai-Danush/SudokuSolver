// storage-utils.js - Storage Management and Utility Functions

// Storage Management
const Storage = {
    // Keys for localStorage
    KEYS: {
        CURRENT_GAME: 'sudoku_current_game',
        THEME_PREFERENCE: 'sudoku_theme',
        STATISTICS: 'sudoku_statistics',
        SETTINGS: 'sudoku_settings'
    },
    
    // Save current game state
    saveGame(grid, puzzleId = null) {
        try {
            const gameData = {
                grid: this.serializeGrid(grid),
                puzzleId: puzzleId,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            localStorage.setItem(this.KEYS.CURRENT_GAME, JSON.stringify(gameData));
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
        }
    },
    
    // Load saved game
    loadGame() {
        try {
            const savedData = localStorage.getItem(this.KEYS.CURRENT_GAME);
            if (!savedData) return null;
            
            const gameData = JSON.parse(savedData);
            
            // Check version compatibility
            if (gameData.version !== '1.0') {
                console.warn('Saved game version mismatch');
                return null;
            }
            
            return {
                grid: this.deserializeGrid(gameData.grid),
                puzzleId: gameData.puzzleId || null,
                timestamp: gameData.timestamp
            };
        } catch (error) {
            console.error('Error loading game:', error);
            return null;
        }
    },
    
    // Clear saved game
    clearGame() {
        localStorage.removeItem(this.KEYS.CURRENT_GAME);
    },
    
    // Save theme preference
    saveThemePreference(theme) {
        localStorage.setItem(this.KEYS.THEME_PREFERENCE, theme);
    },
    
    // Load theme preference
    loadThemePreference() {
        return localStorage.getItem(this.KEYS.THEME_PREFERENCE) || 'default';
    },
    
    // Save game statistics
    saveStatistics(stats) {
        try {
            const currentStats = this.loadStatistics() || this.getDefaultStatistics();
            const updatedStats = { ...currentStats, ...stats };
            localStorage.setItem(this.KEYS.STATISTICS, JSON.stringify(updatedStats));
        } catch (error) {
            console.error('Error saving statistics:', error);
        }
    },
    
    // Load game statistics
    loadStatistics() {
        try {
            const stats = localStorage.getItem(this.KEYS.STATISTICS);
            return stats ? JSON.parse(stats) : null;
        } catch (error) {
            console.error('Error loading statistics:', error);
            return null;
        }
    },
    
    // Get default statistics structure
    getDefaultStatistics() {
        return {
            gamesPlayed: 0,
            gamesCompleted: 0,
            totalTime: 0,
            bestTime: null,
            hintsUsed: 0,
            lastPlayed: null
        };
    },
    
    // Serialize grid for storage (compress to save space)
    serializeGrid(grid) {
        const serialized = {
            cells: []
        };
        
        for (let row = 0; row < 9; row++) {
            serialized.cells[row] = [];
            for (let col = 0; col < 9; col++) {
                const cell = grid.cells[row][col];
                serialized.cells[row][col] = {
                    v: cell.value, // shortened keys
                    g: cell.isGiven ? 1 : 0,
                    p: Array.from(cell.pencilMarks),
                    c: cell.hasConflict ? 1 : 0
                };
            }
        }
        
        return serialized;
    },
    
    // Deserialize grid from storage
    deserializeGrid(serialized) {
        const grid = {
            cells: [],
            solution: null
        };
        
        for (let row = 0; row < 9; row++) {
            grid.cells[row] = [];
            for (let col = 0; col < 9; col++) {
                const cell = serialized.cells[row][col];
                grid.cells[row][col] = {
                    value: cell.v,
                    isGiven: cell.g === 1,
                    pencilMarks: new Set(cell.p),
                    hasConflict: cell.c === 1
                };
            }
        }
        
        return grid;
    }
};

// Utility Functions
const Utils = {
    // Deep clone an object (for history management)
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Set) return new Set([...obj]);
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        
        return cloned;
    },
    
    // Format time for display (seconds to MM:SS)
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Generate a random number between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Shuffle an array (Fisher-Yates algorithm)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    // Convert grid to string format (for debugging or export)
    gridToString(grid) {
        let result = '';
        
        for (let row = 0; row < 9; row++) {
            if (row % 3 === 0 && row !== 0) {
                result += '------+-------+------\n';
            }
            
            for (let col = 0; col < 9; col++) {
                if (col % 3 === 0 && col !== 0) {
                    result += '| ';
                }
                
                const value = grid.cells[row][col].value;
                result += value === 0 ? '. ' : value + ' ';
            }
            
            result += '\n';
        }
        
        return result;
    },
    
    // Parse string format to grid (for importing puzzles)
    stringToGrid(str) {
        const grid = Grid.createEmptyGrid();
        const lines = str.split('\n').filter(line => line && !line.includes('-'));
        
        let row = 0;
        for (const line of lines) {
            const chars = line.replace(/[|+\s]/g, '');
            let col = 0;
            
            for (const char of chars) {
                if (char >= '1' && char <= '9') {
                    grid.cells[row][col].value = parseInt(char);
                    grid.cells[row][col].isGiven = true;
                }
                col++;
                if (col >= 9) break;
            }
            
            row++;
            if (row >= 9) break;
        }
        
        return grid;
    },
    
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function for performance
    throttle(func, limit) {
        let lastFunc;
        let lastRan;
        
        return function(...args) {
            if (!lastRan) {
                func.apply(this, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    },
    
    // Create coordinates array for a unit
    getUnitCoordinates(type, index) {
        const coords = [];
        
        switch (type) {
            case 'row':
                for (let col = 0; col < 9; col++) {
                    coords.push({ row: index, col });
                }
                break;
                
            case 'column':
                for (let row = 0; row < 9; row++) {
                    coords.push({ row, col: index });
                }
                break;
                
            case 'box':
                const boxRow = Math.floor(index / 3) * 3;
                const boxCol = (index % 3) * 3;
                for (let r = boxRow; r < boxRow + 3; r++) {
                    for (let c = boxCol; c < boxCol + 3; c++) {
                        coords.push({ row: r, col: c });
                    }
                }
                break;
        }
        
        return coords;
    },
    
    // Animation helper - run after DOM update
    nextFrame(callback) {
        requestAnimationFrame(() => {
            requestAnimationFrame(callback);
        });
    },
    
    // Check if device is mobile/tablet
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    },
    
    // Generate celebration particles (for completion)
    createCelebrationParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'victory-firework';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Random direction and color
        const angle = Math.random() * Math.PI * 2;
        const velocity = 100 + Math.random() * 100;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7A8', '#F66D72', '#FFD93D', '#6C5CE7'];
        
        particle.style.setProperty('--x', Math.cos(angle) * velocity + 'px');
        particle.style.setProperty('--y', Math.sin(angle) * velocity + 'px');
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        document.body.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => particle.remove(), 1000);
    }
};