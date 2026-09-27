# NEET OS 🩺

A clean, dark-themed desktop dashboard I built to track my NEET (UG) prep. 

Spreadsheets always ended up feeling messy and tedious to update, so I put together a dedicated desktop app instead. It tracks mock test scores over time, enforces spaced repetition for chapter revisions, and keeps an eye on the daily pace needed to finish the syllabus by December 31.

---

## What it does

### Mock Test Analytics
* **Proper NEET Scoring:** Hardcoded strictly for the actual NEET pattern (Physics /180, Chemistry /180, Biology /360 — out of 720).
* **Score Trajectory:** A clean line chart showing progress over 200+ mocks against a persistent 650+ target line.
* **Instant Stats:** Automatically calculates latest score, personal best, rolling average, accuracy percentage, and remaining target gap.
* **Error Analysis Check:** Simple checklist indicator to make sure tests actually get reviewed instead of just logged.

### Syllabus & Spaced Repetition Tracker
* **Active Recall Schedule:** Calculates spaced revision intervals automatically once a chapter is completed:
  * **R1:** +3 days
  * **R2:** +7 days
  * **R3:** +15 days
  * **R4:** +30 days
* **Status Flags:** Flags chapters as `Upcoming`, `Due Today`, or `Overdue` so revision doesn't slip through the cracks.
* **Question Counter:** Quick buttons (+10, +25) to log practice problem counts per chapter.
* **Pace Tracker:** Live counter showing remaining days and required chapters per week to clear the entire syllabus before mock season starts.
* **Pre-loaded Chapters:** Includes all 73 official chapters across Physics, Chemistry, and Biology.

### UI & Themes
* Dark, minimal interface designed for long desk sessions.
* Built-in color theme switcher: Electric Blue, Emerald Matrix, Cyberpunk Amber, Neon Violet, and Crimson Stealth.
* Stores everything locally on your machine—no signups, cloud sync hassles, or subscriptions.

---

## Getting Started (Windows)

Just download the portable build from the **[Releases](https://github.com/praneshrao07/NEET-OS/releases)** tab:
1. Grab `NEET-OS-vX.X-Windows.exe`
2. Double-click to run. No setup wizard or extra runtimes needed.

---

## Running from Source

If you want to tweak the code or build it yourself:

```bash
# Clone the repository
git clone [https://github.com/praneshrao07/NEET-OS.git](https://github.com/praneshrao07/NEET-OS.git)
cd NEET-OS/neet-tracker

# Install dependencies
npm install

# Run the dev app
npm run electron:dev

# Build portable .exe
npm run build:electron; npx electron-builder --win
