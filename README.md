# Daily Life Tracker & AI Coach 🚀

A comprehensive, full-stack web application designed to help you organize your life, track your finances, build habits, and achieve your goals. Powered by **Google Gemini AI**, this app acts as your personal intelligent life coach.

![Life Tracker Banner](https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=2070)

## ✨ Key Features

### 🔐 Multi-User Authentication
*   **Secure Access**: Create your own account with unique credentials.
*   **Private Data**: Your expenses, tasks, and habits are stored securely and isolated from other users.

### 💰 Smart Finance Tracking
*   **Expense Manager**: Log and categorize daily expenses easily.
*   **Visual Analytics**: View your spending breakdown with interactive **Chart.js** visualizations.
*   **Budget Control**: Set monthly budgets and get alerts when you're close to overspending.
*   **AI Analysis**: Get personalized financial advice and saving tips from the AI analyst.

### 📝 Productivity & Tasks
*   **Daily Routine**: Manage your daily to-do list with a clean interface.
*   **AI Generator**: Stuck on what to do? Let the AI generate a productive routine for you based on a simple goal.
*   **Gamified Progress**: Track your productivity score and daily streaks.

### ❤️ Habit Builder
*   **Habit Plans**: Enter a habit you want to build (e.g., "Drink more water"), and the AI will create a detailed, step-by-step plan for you.
*   **Tracking**: Check off daily wins and earn badges.

### 🎯 Goal Achievement
*   **Milestone Planner**: Break down big dreams into manageable milestones using AI.
*   **Resource Finder**: Instantly find books, websites, and apps to help you achieve your specific goals.

### 🤖 Intelligent AI Coach
*   **Chat Interface**: Talk to your AI Life Coach for motivation, advice, or technical support.
*   **Integrated Intelligence**: AI is woven into every module to provide context-aware help.

## 🛠️ Tech Stack

*   **Frontend**: HTML5, JavaScript (ES6+), Tailwind CSS
*   **Visualization**: Chart.js for data viz, Three.js for 3D background effects
*   **Backend**: Python, Flask
*   **Database**: SQLite with SQLAlchemy ORM
*   **AI Engine**: Google Gemini API (via specific model `gemini-2.0-flash-exp`)

## 🚀 Getting Started

### Prerequisites
*   Python 3.8+
*   Git

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/chayan2006/Daily--life-tracker-.git
    cd Daily--life-tracker-
    ```

2.  **Install Dependencies**
    ```bash
    pip install flask flask-sqlalchemy flask-cors requests werkzeug
    ```

3.  **Configure API Keys**
    The application requires a **Gemini API Key** for AI features.
    
    *High Security Approach:*
    Set the environment variable in your terminal:
    ```powershell
    $env:GEMINI_API_KEY="your_api_key_here"
    ```
    
    *Quick Start (Development):*
    The `app.py` file is pre-configured to look for the key in the environment, but you can also update the `GEMINI_API_KEY` variable directly in `app.py` if needed (ensure you don't commit real keys to public repos).

4.  **Run the Application**
    ```bash
    python app.py
    ```

5.  **Access the App**
    Open your browser and navigate to: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
