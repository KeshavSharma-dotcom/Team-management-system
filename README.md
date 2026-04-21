TeamControl is a modern, full-stack collaborative platform designed to streamline team workflows using Artificial Intelligence. It goes beyond standard task tracking by using Gemini AI to summarize team discussions and generate actionable task lists from project goals.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![MERN](https://img.shields.io/badge/stack-MERN-purple)

---

## 📂 Project Structure

### Backend (`/backend`)
Built with **Node.js, Express, and MongoDB**.
* `controllers/`: Logic for Auth, Teams, Tasks, and User Profiles.
* `models/`: Mongoose schemas for Users, Teams, and Tasks.
* `routes/`: API endpoint definitions (V1).
* `middlewares/`: Error handling, 404s, and JWT Authentication guards.
* `utils/`: Helper functions like Email Service (Nodemailer).

### Frontend (`/frontend`)
Built with **React.js and Vite**.
* `components/`: Reusable UI elements like NavBar and ProtectedRoute.
* `pages/`: Core views (Dashboard, TeamDetails, Profile, JoinTeam, etc.).
* `styles/`: Modular CSS files for high-fidelity Glassmorphism design.

---

## 🛠️ Tech Stack

**Frontend:** React, Vite, Framer Motion, Lucide React, CSS3.  
**Backend:** Node.js, Express.js.  
**Database:** MongoDB (Mongoose ODM).  
**AI:** Google Generative AI (Gemini 1.5 Flash).  
**Auth:** JSON Web Tokens (JWT), Bcrypt.js.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/team-control.git](https://github.com/your-username/team-control.git)
cd team-control

---

## ✨ Key Features

- **🤖 AI Insights**: Powered by Google Gemini. Summarize long team discussions into bullet points and generate project tasks automatically.
- **👥 Team Management**: Create teams, join via unique invite codes, and manage roles (Owner/Member).
- **🔒 Secure Auth**: JWT-based authentication with OTP verification for primary and secondary emails.
- **💬 Real-time Discussion**: Integrated team chat with user avatars and owner-exclusive settings.
- **📋 Task Generator**: Input a project goal, and the AI breaks it down into structured tasks.
- **🎨 Glassmorphism UI**: A dark-themed, responsive dashboard built with Framer Motion for smooth transitions.
