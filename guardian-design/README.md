# Body Boundary

> Focus app that helps women understand how their menstrual cycle affects their productivity patterns.

## Quick Start

### Test Locally
1. Open `body-boundary.html` in your browser
2. That's it!

### Deploy to Web (5 minutes)
```bash
# Install Vercel CLI (one time)
npm install -g vercel

# Deploy
cd guardian-design
vercel

# Follow prompts, get live URL
```

Or just drag the `guardian-design` folder to [Netlify Drop](https://app.netlify.com/drop).

---

## What This Does

Tracks 3 things:
1. **Menstrual cycle phase** (Menstrual, Follicular, Ovulation, Luteal)
2. **Daily metrics** (Sleep, Energy, Symptoms)
3. **Focus sessions** (From binaural beats app)

Then shows you patterns like:
- "Focus sessions are 40% longer during follicular phase"
- "Brain fog peaks during luteal phase"
- "Sleep <6hrs = 50% lower energy"

---

## Files

- `body-boundary.html` - Main app (Today, Focus, Insights screens)
- `test-binaural-beats.html` - Focus session player
- `js/cycleTracker.js` - Cycle & daily log tracking
- `js/sessionTracker.js` - Focus session logging
- `js/primerManager.js` - Guided meditation primers
- `js/binauralBeatsEngine.js` - Audio engine

---

## Tech Stack

- Pure HTML/CSS/JavaScript (no framework)
- IndexedDB for local storage
- Web Audio API for binaural beats
- No backend, no accounts, no cloud

---

## Privacy

All data stored locally in your browser. Nothing is sent to any server. Export your data anytime with keyboard shortcuts (E = JSON, C = CSV).

---

## License

MIT - Use however you want

---

Built by Dr. Eva • January 2026
