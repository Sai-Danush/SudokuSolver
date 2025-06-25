// mascot.js - Corgi Mascot Interactions and Messages

const Mascot = {
    // Game statistics for victory screen
    stats: {
        startTime: Date.now(),
        hintsUsed: 0,
        movesMade: 0
    },
    
    // Corgi messages for different events
    messages: {
        correctMove: [
            "Nice one!",
            "You got it!",
            "Great job!",
            "Keep going!",
            "Brilliant!",
            "That's right!",
            "Perfect!",
            "Awesome!",
            "You're doing great!",
            "Excellent move!",
            "Well done!",
            "Fantastic!",
            "Keep it up!",
            "You're on fire!",
            "Smart thinking!"
        ],
        
        hint: [
            "Need some help?",
            "Let me think...",
            "Hmm, let's see...",
            "I've got an idea!",
            "Check this out!",
            "Here's a tip!"
        ],
        
        error: [
            "Oops, not quite!",
            "Try again!",
            "Almost there!",
            "Give it another go!",
            "So close!"
        ],
        
        completion: [
            "You did it! Amazing!",
            "Puzzle complete! Woof!",
            "Victory! Time for treats!",
            "You're a Sudoku master!",
            "Incredible work!"
        ],
        
        idle: [
            "Take your time!",
            "I believe in you!",
            "You can do this!",
            "Think carefully!",
            "No rush!"
        ]
    },
    
    // Initialize mascot
    init() {
        this.corgiElement = document.getElementById('corgiMascot');
        this.speechBubble = document.getElementById('speechBubble');
        
        // Reset stats
        this.stats.startTime = Date.now();
        this.stats.hintsUsed = 0;
        this.stats.movesMade = 0;
        
        // Set up idle messages
        this.startIdleMessages();
    },
    
    // Show a message with animation
    showMessage(message, duration = 3000) {
        if (!this.speechBubble || !this.corgiElement) return;
        
        // Clear any existing timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        // Set the message
        this.speechBubble.textContent = message;
        this.speechBubble.classList.add('show');
        
        // Bounce the corgi
        this.corgiElement.classList.add('bounce');
        setTimeout(() => this.corgiElement.classList.remove('bounce'), 500);
        
        // Hide after duration
        this.messageTimeout = setTimeout(() => {
            this.speechBubble.classList.remove('show');
        }, duration);
    },
    
    // React to correct move
    onCorrectMove() {
        this.stats.movesMade++;
        const message = this.getRandomMessage('correctMove');
        this.showMessage(message);
    },
    
    // React to hint request
    onHintRequest() {
        this.stats.hintsUsed++;
        const message = this.getRandomMessage('hint');
        this.showMessage(message, 2000);
    },
    
    // React to error
    onError() {
        const message = this.getRandomMessage('error');
        this.showMessage(message, 2000);
    },
    
    // React to puzzle completion
    onPuzzleComplete() {
        const message = this.getRandomMessage('completion');
        this.showMessage(message, 5000);
        
        // Show victory modal with stats
        this.showVictoryModal();
        
        // Create confetti
        this.createConfetti();
    },
    
    // Show victory modal with statistics
    showVictoryModal() {
        const modal = document.getElementById('victoryModal');
        const timeElement = document.getElementById('victoryTime');
        const hintsElement = document.getElementById('victoryHints');
        const movesElement = document.getElementById('victoryMoves');
        
        // Calculate time
        const elapsedSeconds = Math.floor((Date.now() - this.stats.startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        
        // Update modal content
        timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        hintsElement.textContent = this.stats.hintsUsed;
        movesElement.textContent = this.stats.movesMade;
        
        // Show modal
        modal.classList.add('show');
        
        // Set up close handlers
        document.getElementById('closeVictoryBtn').onclick = () => {
            modal.classList.remove('show');
        };
        
        document.getElementById('newGameVictoryBtn').onclick = () => {
            modal.classList.remove('show');
            // Trigger new game through main.js
            if (window.handleNewGame) {
                window.handleNewGame();
            }
        };
    },
    
    // Create confetti effect
    createConfetti() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7A8', '#F66D72', '#FFD93D', '#6C5CE7'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.top = -10 + 'px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                
                document.body.appendChild(confetti);
                
                // Animate falling
                const duration = 3000 + Math.random() * 2000;
                const horizontalMovement = (Math.random() - 0.5) * 200;
                
                confetti.animate([
                    { 
                        transform: `translateY(0) translateX(0) rotate(0deg)`,
                        opacity: 1 
                    },
                    { 
                        transform: `translateY(${window.innerHeight + 20}px) translateX(${horizontalMovement}px) rotate(${Math.random() * 720}deg)`,
                        opacity: 0.3
                    }
                ], {
                    duration: duration,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });
                
                // Remove after animation
                setTimeout(() => confetti.remove(), duration);
            }, i * 50);
        }
    },
    
    // Start showing idle messages periodically
    startIdleMessages() {
        // Clear any existing interval
        if (this.idleInterval) {
            clearInterval(this.idleInterval);
        }
        
        // Show an idle message every 30-60 seconds
        this.idleInterval = setInterval(() => {
            // Don't show idle messages if speech bubble is already visible
            if (!this.speechBubble.classList.contains('show')) {
                const message = this.getRandomMessage('idle');
                this.showMessage(message, 2500);
            }
        }, 30000 + Math.random() * 30000);
    },
    
    // Get random message from category
    getRandomMessage(category) {
        const messages = this.messages[category];
        return messages[Math.floor(Math.random() * messages.length)];
    },
    
    // Clean up
    destroy() {
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        if (this.idleInterval) {
            clearInterval(this.idleInterval);
        }
    }
};