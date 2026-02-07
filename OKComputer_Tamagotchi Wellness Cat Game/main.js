// Glowchi - Wellness Cat Game Main JavaScript
class GlowchiGame {
    constructor() {
        this.currentState = 'idle';
        this.previousState = 'idle';
        this.moodHistory = [];
        this.activitiesCompleted = [];
        this.checkIns = 0;
        this.lastInteraction = Date.now();
        this.stateTimer = null;
        
        // Korean-style cute tiger state configurations
        this.states = {
            idle: {
                image: 'resources/k-tiger-idle.png',
                title: 'Cute and Happy',
                description: 'Your adorable tiger friend is here to make your wellness journey extra cute!',
                minDuration: 30000, // 30 seconds
                maxDuration: 120000 // 2 minutes
            },
            alert: {
                image: 'resources/k-tiger-alert.png',
                title: 'Perked Up and Ready',
                description: 'Your cute tiger is alert and ready to play and support you!',
                minDuration: 3000,  // 3 seconds
                maxDuration: 5000  // 5 seconds
            },
            content: {
                image: 'resources/k-tiger-content.png',
                title: 'Super Content',
                description: 'Your tiger is blissfully happy to share this wellness moment with you!',
                minDuration: 10000, // 10 seconds
                maxDuration: 15000 // 15 seconds
            },
            withdrawn: {
                image: 'resources/k-tiger-withdrawn.png',
                title: 'Sweet Dreams',
                description: 'Your tiger is taking a cute little nap. Sweet dreams, wellness friend!',
                minDuration: 60000,  // 1 minute
                maxDuration: 300000 // 5 minutes
            }
        };

        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.updateStats();
        this.startStateMachine();
        this.logCheckIn();
        
        // Initial greeting
        this.changeState('alert', 3000);
    }

    bindEvents() {
        // Mood buttons
        document.querySelectorAll('.mood-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const mood = parseInt(e.target.dataset.mood);
                this.logMood(mood);
                this.updateMoodDisplay(mood);
            });
        });

        // Activity buttons
        document.querySelectorAll('.activity-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const activity = e.currentTarget.dataset.activity;
                this.performActivity(activity);
            });
        });

        // Breathing exercise
        const breathingCircle = document.getElementById('breathingCircle');
        if (breathingCircle) {
            breathingCircle.addEventListener('click', () => {
                this.startBreathingExercise();
            });
        }

        const stopBreathing = document.getElementById('stopBreathing');
        if (stopBreathing) {
            stopBreathing.addEventListener('click', () => {
                this.stopBreathingExercise();
            });
        }

        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        });

        // Periodic check-ins
        setInterval(() => {
            this.checkForStateChange();
        }, 30000); // Check every 30 seconds
    }

    changeState(newState, duration = null) {
        if (this.currentState === newState) return;

        this.previousState = this.currentState;
        this.currentState = newState;

        const stateConfig = this.states[newState];
        
        // Update UI
        this.updateCatDisplay(stateConfig);
        
        // Set timer for automatic state transition
        if (duration || stateConfig.maxDuration) {
            clearTimeout(this.stateTimer);
            this.stateTimer = setTimeout(() => {
                this.returnToDefaultState();
            }, duration || stateConfig.maxDuration);
        }

        // Update last interaction
        this.lastInteraction = Date.now();
    }

    updateCatDisplay(stateConfig) {
        const catImage = document.getElementById('catImage');
        const stateTitle = document.getElementById('catStateTitle');
        const stateDescription = document.getElementById('catStateDescription');

        if (catImage && stateConfig.image) {
            // Fade transition
            anime({
                targets: catImage,
                opacity: 0,
                duration: 300,
                easing: 'easeOutQuad',
                complete: () => {
                    catImage.src = stateConfig.image;
                    anime({
                        targets: catImage,
                        opacity: 1,
                        duration: 300,
                        easing: 'easeInQuad'
                    });
                }
            });
        }

        if (stateTitle) {
            anime({
                targets: stateTitle,
                opacity: 0,
                duration: 200,
                complete: () => {
                    stateTitle.textContent = stateConfig.title;
                    anime({
                        targets: stateTitle,
                        opacity: 1,
                        duration: 200
                    });
                }
            });
        }

        if (stateDescription) {
            anime({
                targets: stateDescription,
                opacity: 0,
                duration: 200,
                complete: () => {
                    stateDescription.textContent = stateConfig.description;
                    anime({
                        targets: stateDescription,
                        opacity: 1,
                        duration: 200
                    });
                }
            });
        }

        // Add gentle animation to cat container
        const catContainer = document.querySelector('.cat-container');
        if (catContainer) {
            anime({
                targets: catContainer,
                scale: [0.98, 1],
                duration: 600,
                easing: 'easeOutElastic(1, .8)'
            });
        }
    }

    returnToDefaultState() {
        // Determine appropriate default state based on time and mood
        const timeSinceInteraction = Date.now() - this.lastInteraction;
        const avgMood = this.getAverageMood();

        if (timeSinceInteraction > 300000 && avgMood < 5) { // 5 minutes, low mood
            this.changeState('withdrawn');
        } else {
            this.changeState('idle');
        }
    }

    logMood(mood) {
        const moodEntry = {
            mood: mood,
            timestamp: Date.now(),
            date: new Date().toDateString()
        };

        this.moodHistory.push(moodEntry);
        
        // Keep only today's moods
        const today = new Date().toDateString();
        this.moodHistory = this.moodHistory.filter(entry => entry.date === today);
        
        this.saveData();
        this.updateStats();
        
        // Cat responds to mood
        if (mood >= 8) {
            this.changeState('content', 10000);
        } else if (mood <= 3) {
            this.changeState('withdrawn', 60000);
        } else {
            this.changeState('alert', 3000);
        }
    }

    logCheckIn() {
        this.checkIns++;
        this.saveData();
        this.updateStats();
    }

    performActivity(activity) {
        const activityButton = document.querySelector(`[data-activity="${activity}"]`);
        
        // Mark activity as completed
        if (!this.activitiesCompleted.includes(activity)) {
            this.activitiesCompleted.push(activity);
            activityButton.classList.add('completed');
            
            // Add completion animation
            anime({
                targets: activityButton,
                scale: [1, 1.1, 1],
                duration: 600,
                easing: 'easeOutElastic(1, .8)'
            });
        }

        // Handle specific activities
        switch (activity) {
            case 'breathing':
                this.showBreathingExercise();
                break;
            case 'journal':
                this.openJournal();
                break;
            case 'meditation':
                this.startMeditation();
                break;
            case 'walk':
                this.suggestWalk();
                break;
            case 'water':
                this.logWater();
                break;
            case 'stretch':
                this.suggestStretches();
                break;
        }

        // Cat responds positively to activities
        this.changeState('content', 12000);
        this.saveData();
        this.updateStats();
    }

    showBreathingExercise() {
        const breathingSection = document.getElementById('breathingSection');
        if (breathingSection) {
            breathingSection.style.display = 'block';
            anime({
                targets: breathingSection,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                easing: 'easeOutQuad'
            });
        }
    }

    startBreathingExercise() {
        const circle = document.getElementById('breathingCircle');
        if (circle) {
            circle.classList.add('active');
            circle.textContent = 'Breathe...';
            
            // Add gentle pulsing animation
            anime({
                targets: circle,
                scale: [1, 1.2, 1],
                duration: 4000,
                loop: true,
                easing: 'easeInOutSine'
            });
        }
    }

    stopBreathingExercise() {
        const breathingSection = document.getElementById('breathingSection');
        const circle = document.getElementById('breathingCircle');
        
        if (circle) {
            circle.classList.remove('active');
            circle.textContent = 'Breathe';
            anime.remove(circle);
        }
        
        if (breathingSection) {
            anime({
                targets: breathingSection,
                opacity: [1, 0],
                translateY: [0, -20],
                duration: 400,
                easing: 'easeOutQuad',
                complete: () => {
                    breathingSection.style.display = 'none';
                }
            });
        }
    }

    openJournal() {
        const journalPrompt = prompt('How are you feeling today? What\'s on your mind?');
        if (journalPrompt && journalPrompt.trim()) {
            // Save journal entry (in real app, this would go to a proper storage)
            const journalEntry = {
                text: journalPrompt,
                timestamp: Date.now(),
                date: new Date().toDateString()
            };
            
            // Show confirmation
            this.showNotification('Journal entry saved. Thank you for sharing.');
        }
    }

    startMeditation() {
        this.showNotification('Take a moment to breathe deeply and center yourself. You\'re doing great.');
    }

    suggestWalk() {
        this.showNotification('A gentle walk can do wonders for your mood. Even a few minutes helps.');
    }

    logWater() {
        this.showNotification('Great job staying hydrated! Your body thanks you.');
    }

    suggestStretches() {
        this.showNotification('Gentle stretches can help release tension. Listen to your body.');
    }

    showNotification(message) {
        // Create a gentle, non-intrusive notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(168, 218, 220, 0.95);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            z-index: 1000;
            max-width: 300px;
            font-size: 14px;
            line-height: 1.4;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        anime({
            targets: notification,
            opacity: [0, 1],
            translateX: [50, 0],
            duration: 400,
            easing: 'easeOutQuad'
        });
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            anime({
                targets: notification,
                opacity: [1, 0],
                translateX: [0, 50],
                duration: 400,
                easing: 'easeOutQuad',
                complete: () => {
                    document.body.removeChild(notification);
                }
            });
        }, 4000);
    }

    updateMoodDisplay(mood) {
        // Clear previous selections
        document.querySelectorAll('.mood-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Highlight selected mood
        const selectedButton = document.querySelector(`[data-mood="${mood}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
    }

    getAverageMood() {
        if (this.moodHistory.length === 0) return 5;
        
        const sum = this.moodHistory.reduce((acc, entry) => acc + entry.mood, 0);
        return Math.round(sum / this.moodHistory.length);
    }

    updateStats() {
        const moodAverage = document.getElementById('moodAverage');
        const activitiesCompleted = document.getElementById('activitiesCompleted');
        const checkIns = document.getElementById('checkIns');

        if (moodAverage) {
            const avg = this.getAverageMood();
            moodAverage.textContent = avg;
        }

        if (activitiesCompleted) {
            activitiesCompleted.textContent = this.activitiesCompleted.length;
        }

        if (checkIns) {
            checkIns.textContent = this.checkIns;
        }
    }

    checkForStateChange() {
        const timeSinceInteraction = Date.now() - this.lastInteraction;
        const avgMood = this.getAverageMood();

        // Auto-transition to withdrawn if no interaction for 5+ minutes and low mood
        if (timeSinceInteraction > 300000 && avgMood < 5 && this.currentState !== 'withdrawn') {
            this.changeState('withdrawn');
        }
        
        // Auto-transition to idle if in alert state for too long
        if (this.currentState === 'alert' && timeSinceInteraction > 10000) {
            this.changeState('idle');
        }
    }

    handlePageHidden() {
        // When page is hidden, pause animations and note time
        this.hiddenTime = Date.now();
    }

    handlePageVisible() {
        // When page becomes visible, check how long it was hidden
        if (this.hiddenTime) {
            const timeHidden = Date.now() - this.hiddenTime;
            
            // If hidden for more than 5 minutes, show alert state
            if (timeHidden > 300000) {
                this.changeState('alert', 5000);
            }
            
            this.hiddenTime = null;
        }
    }

    startStateMachine() {
        // Periodically check and update state
        setInterval(() => {
            this.checkForStateChange();
        }, 30000); // Every 30 seconds
    }

    saveData() {
        const data = {
            moodHistory: this.moodHistory,
            activitiesCompleted: this.activitiesCompleted,
            checkIns: this.checkIns,
            lastInteraction: this.lastInteraction
        };
        
        localStorage.setItem('glowchi-data', JSON.stringify(data));
    }

    loadData() {
        const saved = localStorage.getItem('glowchi-data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                
                // Only load today's data
                const today = new Date().toDateString();
                this.moodHistory = data.moodHistory?.filter(entry => entry.date === today) || [];
                this.activitiesCompleted = data.activitiesCompleted || [];
                this.checkIns = data.checkIns || 0;
                this.lastInteraction = data.lastInteraction || Date.now();
                
                // Mark completed activities in UI
                this.activitiesCompleted.forEach(activity => {
                    const button = document.querySelector(`[data-activity="${activity}"]`);
                    if (button) {
                        button.classList.add('completed');
                    }
                });
                
            } catch (error) {
                console.log('No previous data found, starting fresh');
            }
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.glowchi = new GlowchiGame();
});

// Add some ambient animations for the cat
document.addEventListener('DOMContentLoaded', () => {
    // Gentle breathing animation for cat container
    const catContainer = document.querySelector('.cat-container');
    if (catContainer) {
        setInterval(() => {
            anime({
                targets: catContainer,
                scale: [1, 1.01, 1],
                duration: 4000,
                easing: 'easeInOutSine'
            });
        }, 8000);
    }

    // Subtle floating animation for cat image
    const catImage = document.getElementById('catImage');
    if (catImage) {
        setInterval(() => {
            anime({
                targets: catImage,
                translateY: [0, -2, 0],
                duration: 3000,
                easing: 'easeInOutSine'
            });
        }, 6000);
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlowchiGame;
}