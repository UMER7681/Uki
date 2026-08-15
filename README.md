# UKI V1 — Free Tablet Edition

This is the first tablet-friendly UKI prototype.

## What it does
- Chat-style UKI interface
- Local memory stored in browser localStorage
- Local tasks
- Local calendar/events
- Local notes
- Import text/Markdown files manually
- Web search links
- Text-to-speech when the browser supports it
- Voice input when the browser supports SpeechRecognition
- Responsive design for Samsung tablets and phones
- No npm, no framework, no database, no paid API

## Important limitation
This V1 is deliberately browser-only. A browser cannot safely access Gmail, Outlook, private folders, calendar accounts, reminders, or tasks automatically without authenticated APIs/backend code.

The "AI" is a small command agent, not a full LLM. V2 can add a real AI backend and secure account integrations.

## Run
Upload the whole folder to a static host such as GitHub Pages, then open the published page on your tablet.

## Data
Data is stored in this browser's localStorage. Clearing site data resets it.

## Voice
Android Chrome may support browser speech recognition, but browser speech recognition can use the browser/provider's speech service. It is not the privacy-preserving server-side voice architecture from the YouTube JARVIS project.
