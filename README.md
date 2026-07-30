# 🔥 Anonymous Roast Cards

> A multiplayer, anonymous roast-assignment game where participants spin a virtual wheel and are secretly assigned a random classmate to roast.

![Project Status](https://img.shields.io/badge/status-ready-brightgreen)
![Frontend](https://img.shields.io/badge/frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-orange)
![Hosting](https://img.shields.io/badge/hosting-Netlify-00C7B7)
![Backend](https://img.shields.io/badge/backend-Google%20Apps%20Script-4285F4)
![Database](https://img.shields.io/badge/database-Google%20Sheets-34A853)

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [How the Game Works](#-how-the-game-works)
- [Features](#-features)
- [Project Architecture](#-project-architecture)
- [Technologies Used](#-technologies-used)
- [Project Structure](#-project-structure)
- [Google Sheet Setup](#-google-sheet-setup)
- [Google Apps Script Setup](#-google-apps-script-setup)
- [Frontend Setup](#-frontend-setup)
- [Netlify Deployment](#-netlify-deployment)
- [GitHub Setup](#-github-setup)
- [Game Flow](#-game-flow)
- [Multiple Games / Rounds](#-multiple-games--rounds)
- [Data Recording](#-data-recording)
- [Security and Concurrency](#-security-and-concurrency)
- [Important Configuration](#-important-configuration)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Customization](#-customization)
- [Future Improvements](#-future-improvements)
- [License](#-license)

---

# 🎭 About the Project

**Anonymous Roast Cards** is an interactive multiplayer game designed for classroom events, batch gatherings, parties, club events, and social activities.

The concept is inspired by **Secret Santa**, but instead of secretly giving gifts, each participant is anonymously assigned another participant who will become their roast target.

The basic idea is:

1. Every participant is added to a list of 90 people.
2. A participant enters their own name and roll number.
3. The system verifies their identity against the participant list.
4. They spin the virtual wheel.
5. The backend randomly assigns another participant.
6. The participant can never receive themselves.
7. A participant cannot be assigned to more than one person.
8. Every assignment is permanently recorded in Google Sheets.
9. The participant sees only their own target.
10. The complete assignment history remains available to the organizer.

The goal is to keep the activity fun, anonymous, and organized.

---

# 🎯 How the Game Works

Imagine there are 90 participants:

```text
Rahim
Nabila
Tanvir
Karim
Sara
...
Person 90
