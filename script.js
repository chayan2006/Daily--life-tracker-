document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication Logic ---
    const authSection = document.getElementById('auth-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const authError = document.getElementById('auth-error');

    let currentUser = null;

    showRegister.addEventListener('click', (e) => { e.preventDefault(); loginForm.classList.add('hidden'); registerForm.classList.remove('hidden'); });
    showLogin.addEventListener('click', (e) => { e.preventDefault(); registerForm.classList.add('hidden'); loginForm.classList.remove('hidden'); });

    // Pre-loader Logic (moved into checkSession potentially, or kept separate)
    const preloader = document.getElementById('preloader');

    async function checkSession() {
        try {
            const res = await fetch('/api/me');
            if (res.ok) {
                const data = await res.json();
                currentUser = data.username;
                authSection.classList.add('hidden');
                // Load data
                fetchExpenses();
                fetchTasks();
            } else {
                authSection.classList.remove('hidden');
            }
        } catch (error) {
            console.error(error);
            authSection.classList.remove('hidden');
        } finally {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => preloader.style.display = 'none', 500);
            }, 500);
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const data = await res.json();
                currentUser = data.username;
                authSection.classList.add('hidden');
                fetchExpenses();
                fetchTasks();
                authError.classList.add('hidden');
            } else {
                const err = await res.json();
                authError.textContent = err.error || 'Login failed';
                authError.classList.remove('hidden');
            }
        } catch (error) {
            authError.textContent = 'Network error';
            authError.classList.remove('hidden');
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                alert('Registration successful! Please log in.');
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
            } else {
                const err = await res.json();
                authError.textContent = err.error || 'Registration failed';
                authError.classList.remove('hidden');
            }
        } catch (error) {
            authError.textContent = 'Network error';
            authError.classList.remove('hidden');
        }
    });

    // Check session on load
    checkSession();

    // --- 3D Animation variables ---
    let scene, camera, renderer, shapes;
    let animationInitialized = false;
    let mouseX = 0, mouseY = 0;

    // --- Page Navigation ---
    const pages = document.querySelectorAll('.page-section');
    const globalUiContainer = document.getElementById('global-ui-container');
    const logoutBtn = document.getElementById('logout-btn');
    const leftSidebar = document.getElementById('left-sidebar');
    const rightSidebar = document.getElementById('right-sidebar');

    function showPage(hash) {
        const cleanHash = (hash && hash !== '#') ? (hash.startsWith('#') ? hash : '#' + hash) : '#domain-selection';

        pages.forEach(page => page.classList.remove('active'));
        let targetPage = document.querySelector(cleanHash);

        if (!targetPage) {
            targetPage = document.querySelector('#domain-selection');
        }

        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    // --- Mutation Observer for Animation Init ---
    const pageObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const targetElement = mutation.target;
                if (targetElement.id === 'domain-selection' && targetElement.classList.contains('active')) {
                    requestAnimationFrame(() => init3DAnimation());
                    pageObserver.disconnect();
                }
            }
        }
    });

    pages.forEach(page => pageObserver.observe(page, { attributes: true }));

    window.addEventListener('hashchange', () => showPage(window.location.hash));

    // --- Auth State Logic (Simplified) ---
    function updateUIAfterLogin(status) {
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');

        if (status) {
            userName.textContent = 'Demo User';
            userEmail.textContent = 'user@example.com';
        } else {
            userName.textContent = 'Guest User';
            userEmail.textContent = 'Please log in';
        }
    }

    logoutBtn.addEventListener('click', async (e) => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.reload();
        } catch (error) { console.error(error); }
    });

    // --- Settings Modal and Theme Toggle ---
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
    const themeToggle = document.getElementById('theme-toggle');

    settingsBtn.addEventListener('click', () => settingsModal.classList.remove('modal-closed'));
    closeSettingsModalBtn.addEventListener('click', () => settingsModal.classList.add('modal-closed'));
    settingsModal.addEventListener('click', e => { if (e.target === settingsModal) settingsModal.classList.add('modal-closed'); });

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-theme', themeToggle.checked);
    });

    // --- About Modal Logic ---
    const aboutBtn = document.getElementById('about-btn');
    const aboutModal = document.getElementById('about-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    aboutBtn.addEventListener('click', () => aboutModal.classList.remove('modal-closed'));
    closeModalBtn.addEventListener('click', () => aboutModal.classList.add('modal-closed'));
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) aboutModal.classList.add('modal-closed');
    });

    // --- Contact Us Modal Logic ---
    const contactUsBtn = document.getElementById('contact-us-btn');
    const contactModal = document.getElementById('contact-modal');
    const closeContactBtn = document.getElementById('close-contact-btn');
    contactUsBtn.addEventListener('click', () => contactModal.classList.remove('modal-closed'));
    closeContactBtn.addEventListener('click', () => contactModal.classList.add('modal-closed'));
    contactModal.addEventListener('click', e => { if (e.target === contactModal) contactModal.classList.add('modal-closed'); });

    // --- FIX: Add event listener for the contact form ---
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real app, you'd send this data to a server.
        // For this demo, we'll just show a confirmation.
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Ticket Submitted!';
        submitButton.disabled = true;
        setTimeout(() => {
            contactForm.reset();
            submitButton.textContent = 'Submit Ticket';
            submitButton.disabled = false;
            contactModal.classList.add('modal-closed');
        }, 2000);
    });

    // --- Finance Module Logic ---
    const monthlyBudgetInput = document.getElementById('monthly-budget');
    const addExpenseForm = document.getElementById('add-expense-form');
    const expenseTableBody = document.getElementById('expense-table-body');
    const summaryBudget = document.getElementById('summary-budget');
    const summarySpent = document.getElementById('summary-spent');
    const summaryRemaining = document.getElementById('summary-remaining');
    const overspendAlert = document.getElementById('overspend-alert');
    const pieChart = document.getElementById('pie-chart');
    const pieLegend = document.getElementById('pie-legend');
    const quickAddExpenseForm = document.getElementById('quick-add-expense-form');
    const summaryBudgetRight = document.getElementById('summary-budget-remaining');

    const categoryColors = {
        'Food': '#f59e0b', 'Transport': '#3b82f6', 'Bills': '#ef4444',
        'Entertainment': '#8b5cf6', 'Shopping': '#ec4899', 'Other': '#6b7280'
    };

    let financeState = { budget: parseFloat(localStorage.getItem('monthlyBudget')) || 0, expenses: [] };
    let expenseChart = null; // Store chart instance

    // Format currency helper
    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    async function fetchExpenses() {
        try {
            const res = await fetch('/api/expenses');
            if (res.ok) {
                financeState.expenses = await res.json();
                renderFinanceUI();
            }
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        }
    }

    function renderFinanceUI() {
        const { budget, expenses } = financeState;
        const totalSpent = expenses.reduce((sum, ex) => sum + ex.amount, 0);
        const remaining = budget - totalSpent;

        summaryBudget.textContent = formatCurrency(budget);
        summarySpent.textContent = formatCurrency(totalSpent);
        summaryRemaining.textContent = formatCurrency(remaining);
        summaryBudgetRight.textContent = formatCurrency(remaining);
        overspendAlert.classList.toggle('hidden', remaining >= 0);

        // Save budget to local storage
        localStorage.setItem('monthlyBudget', budget);

        expenseTableBody.innerHTML = '';
        if (expenses.length === 0) {
            expenseTableBody.innerHTML = `<tr id="empty-row"><td colspan="4" class="px-6 py-10 text-center text-sm text-gray-500">No expenses added yet.</td></tr>`;
        } else {
            expenses.forEach(ex => {
                const row = document.createElement('tr');
                row.className = 'border-b border-slate-700';
                row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-medium">${ex.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${ex.category}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">${formatCurrency(ex.amount)}</td>
                <td class="px-1 py-4 text-center"><button data-id="${ex.id}" class="delete-expense-btn text-gray-500 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" /></svg>
                </button></td>`;
                expenseTableBody.appendChild(row);
            });
        }

        // Chart.js Logic
        const spendingByCategory = expenses.reduce((acc, ex) => {
            acc[ex.category] = (acc[ex.category] || 0) + ex.amount;
            return acc;
        }, {});

        const labels = Object.keys(spendingByCategory);
        const data = Object.values(spendingByCategory);
        const bgColors = labels.map(cat => categoryColors[cat] || '#6b7280');

        // Update Pie Legend (Keep the custom legend as it looks nice)
        let legendHTML = '';
        labels.forEach((cat, index) => {
            legendHTML += `<div class="flex items-center justify-between text-gray-400 mb-1"><div class="flex items-center"><span class="w-3 h-3 rounded-full mr-2" style="background-color: ${bgColors[index]};"></span><span>${cat}</span></div><span class="font-medium text-gray-300">${formatCurrency(data[index])}</span></div>`;
        });
        pieLegend.innerHTML = legendHTML || '<p class="text-center text-gray-500">Add an expense to see the chart.</p>';

        // Render Chart
        const ctx = document.getElementById('pie-chart'); // Note: ensure this is a canvas in HTML or handle properly
        // Check if the element is a canvas, if not we might need to modify HTML. 
        // For now, let's assume we will replace the div with a canvas or append a canvas.
        // Actually, the current HTML has a div id="pie-chart". Chart.js needs a canvas.
        // We will insert a canvas if it doesn't exist, or we rely on the user to have changed HTML.
        // But I haven't changed HTML for canvas yet. I should do that dynamically here or in HTML step.
        // Let's replace the element dynamically if needed.
        let canvas = ctx;
        if (ctx.tagName !== 'CANVAS') {
            canvas = document.createElement('canvas');
            canvas.id = 'pie-chart-canvas';
            ctx.innerHTML = '';
            ctx.appendChild(canvas);
            // Clear the inline style background from previous CSS chart
            ctx.style.background = 'none';
        } else {
            canvas = ctx;
        }

        if (expenseChart) {
            expenseChart.destroy();
        }

        if (data.length > 0) {
            expenseChart = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: bgColors,
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false } // We use our custom legend
                    },
                    cutout: '70%'
                }
            });
        }
    }

    // Initialize budget input value
    if (financeState.budget > 0) {
        monthlyBudgetInput.value = financeState.budget;
    }

    monthlyBudgetInput.addEventListener('input', (e) => {
        financeState.budget = Number(e.target.value) || 0;
        renderFinanceUI(); // This will trigger localStorage save
    });

    async function addExpense(description, amount, category) {
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, amount, category })
            });
            if (res.ok) {
                fetchExpenses(); // Re-fetch to update UI
            }
        } catch (error) {
            console.error(error);
        }
    }

    addExpenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addExpense(
            document.getElementById('expense-desc').value,
            parseFloat(document.getElementById('expense-amount').value),
            document.getElementById('expense-category').value
        );
        addExpenseForm.reset();
    });

    quickAddExpenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addExpense(
            document.getElementById('quick-expense-desc').value,
            parseFloat(document.getElementById('quick-expense-amount').value),
            document.getElementById('quick-expense-category').value
        );
        quickAddExpenseForm.reset();
    });

    expenseTableBody.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-expense-btn')) {
            const expenseId = Number(e.target.closest('.delete-expense-btn').dataset.id);
            try {
                await fetch(`/api/expenses/${expenseId}`, { method: 'DELETE' });
                fetchExpenses();
            } catch (error) { console.error(error); }
        }
    });

    // --- Productivity Module Logic ---
    const taskList = document.getElementById('task-list');
    const progressBar = document.getElementById('progress-bar');
    const tasksDone = document.getElementById('tasks-done');
    const tasksTotal = document.getElementById('tasks-total');
    const productivityScore = document.getElementById('productivity-score');
    const motivationPopup = document.getElementById('motivation-popup');
    const summaryTasks = document.getElementById('summary-tasks');

    // Fetch tasks from API
    async function fetchTasks() {
        try {
            const res = await fetch('/api/tasks');
            if (res.ok) {
                const tasks = await res.json();
                renderTaskList(tasks);
            }
        } catch (error) { console.error(error); }
    }

    function renderTaskList(tasks) {
        taskList.innerHTML = tasks.map(task => `
        <li class="flex items-center">
            <input type="checkbox" data-id="${task.id}" ${task.is_completed ? 'checked' : ''} class="task-checkbox h-5 w-5 rounded border-gray-500 bg-slate-700 text-indigo-500 focus:ring-indigo-500">
            <span class="ml-3 ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-300'}">${task.content}</span>
            <button data-id="${task.id}" class="delete-task-btn ml-auto text-gray-500 hover:text-red-500">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                 </svg>
            </button>
        </li>
        `).join('');
        updateProgress();
    }

    function updateProgress() {
        const checkboxes = taskList.querySelectorAll('input[type="checkbox"]');
        const checkedTasks = taskList.querySelectorAll('input[type="checkbox"]:checked').length;
        const totalTasks = checkboxes.length;
        const percentage = totalTasks > 0 ? (checkedTasks / totalTasks) * 100 : 0;

        progressBar.style.width = percentage + '%';
        tasksDone.textContent = checkedTasks;
        tasksTotal.textContent = totalTasks;
        summaryTasks.textContent = `${checkedTasks} / ${totalTasks}`;
        productivityScore.textContent = Math.round(percentage);

        if (percentage > 0 && percentage < 100) {
            motivationPopup.classList.remove('hidden');
        } else {
            motivationPopup.classList.add('hidden');
        }
    }

    taskList.addEventListener('change', async (e) => {
        if (e.target.classList.contains('task-checkbox')) {
            const id = e.target.dataset.id;
            const is_completed = e.target.checked;
            try {
                await fetch(`/api/tasks/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_completed })
                });
                fetchTasks(); // Refresh to ensure sync
            } catch (error) { console.error(error); }
        }
    });

    taskList.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-task-btn')) {
            const id = e.target.closest('.delete-task-btn').dataset.id;
            try {
                await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
                fetchTasks();
            } catch (error) { console.error(error); }
        }
    });

    // Manual Task Add Logic (was missing in previous script, adding for completeness)
    const addTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskInput && addTaskBtn) {
        addTaskBtn.addEventListener('click', async () => {
            const content = addTaskInput.value.trim();
            if (content) {
                try {
                    await fetch('/api/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content })
                    });
                    addTaskInput.value = '';
                    fetchTasks();
                } catch (err) { console.error(err); }
            }
        });
    }

    // --- Universal Helpers ---
    function toggleButtonLoading(button, textElement, isLoading, loadingText = "Generating...") {
        if (isLoading) {
            button.disabled = true;
            textElement.innerHTML = `<div class="spinner mr-2"></div> ${loadingText}`;
        } else {
            button.disabled = false;
            textElement.innerHTML = button.dataset.originalText;
        }
    }

    // --- FIX: More robust markdown to HTML conversion ---
    function markdownToHtml(text) {
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');

        const lines = html.split('\n');
        let inList = false;
        html = lines.map(line => {
            if (line.startsWith('- ')) {
                const listItem = `<li>${line.substring(2)}</li>`;
                if (!inList) {
                    inList = true;
                    return `<ul>${listItem}`;
                }
                return listItem;
            } else {
                if (inList) {
                    inList = false;
                    return `</ul>${line ? `<p>${line}</p>` : ''}`;
                }
                return line ? `<p>${line}</p>` : '';
            }
        }).join('');

        if (inList) {
            html += '</ul>';
        }

        return html.replace(/<p><\/p>/g, ''); // Clean up empty paragraphs
    }

    // --- Universal Gemini API Logic ---
    async function getGeminiResponse(userPrompt, systemPrompt, isJson = false) {
        const apiUrl = '/api/generate';

        const requestBody = {
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
                responseMimeType: isJson ? "application/json" : "text/plain"
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error("No text content returned from API.");
            }
            return text;

        } catch (error) {
            console.error("Gemini API Error:", error);
            // Return JSON error structure if expected, to prevent parsing errors downstream
            if (isJson) {
                return '{"error": "AI Service Unavailable. Please check API Key."}';
            }
            return `Error: ${error.message}. Please check your server console.`;
        }
    }

    function addChatMessage(chatWindow, message, sender, isTyping = false) {
        if (isTyping) {
            const typingEl = document.createElement('div');
            typingEl.className = 'chat-message bot-message thinking-message';
            typingEl.innerHTML = `<div class="flex items-center gap-2"><div class="spinner !w-4 !h-4 !border-white"></div><span>Thinking...</span></div>`;
            chatWindow.appendChild(typingEl);
        } else {
            const thinkingMessage = chatWindow.querySelector('.thinking-message');
            if (thinkingMessage) thinkingMessage.remove();

            const messageEl = document.createElement('div');
            messageEl.className = `chat-message ${sender}-message`;
            messageEl.innerHTML = markdownToHtml(message);
            chatWindow.appendChild(messageEl);
        }
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // --- AI Coach Chat Logic ---
    const aiCoachBtn = document.getElementById('ai-coach-btn');
    const aiChatModal = document.getElementById('ai-chat-modal');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const lifeCoachChatWindow = document.getElementById('life-coach-chat-window');
    const lifeCoachInput = document.getElementById('life-coach-chat-input');
    const lifeCoachSendBtn = document.getElementById('life-coach-chat-send');
    let isCoachFirstMessage = true;

    aiCoachBtn.addEventListener('click', () => {
        aiChatModal.classList.remove('modal-closed');
        if (isCoachFirstMessage) {
            addChatMessage(lifeCoachChatWindow, "Hello! I'm your AI Life Coach. How can I help you today?", 'bot');
            isCoachFirstMessage = false;
        }
    });
    closeChatBtn.addEventListener('click', () => aiChatModal.classList.add('modal-closed'));

    async function handleLifeCoachSubmit() {
        const userInput = lifeCoachInput.value.trim();
        if (userInput) {
            addChatMessage(lifeCoachChatWindow, userInput, 'user');
            lifeCoachInput.value = '';
            addChatMessage(lifeCoachChatWindow, "", 'bot', true);

            const systemPrompt = `You are a friendly and encouraging AI Life Coach. Your goal is to provide helpful advice on finance, productivity, habits, and goals. Use the data context provided when available, but also offer general wisdom. Keep your answers concise and actionable.`;
            const botResponse = await getGeminiResponse(userInput, systemPrompt, false);

            addChatMessage(lifeCoachChatWindow, botResponse, 'bot');
        }
    }

    lifeCoachSendBtn.addEventListener('click', handleLifeCoachSubmit);
    lifeCoachInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLifeCoachSubmit(); });


    // --- AI Tech Support Logic ---
    const techSupportChatWindow = document.getElementById('tech-support-chat-window');
    const techSupportInput = document.getElementById('tech-support-input');
    const techSupportSendBtn = document.getElementById('tech-support-send');

    contactUsBtn.addEventListener('click', () => {
        if (techSupportChatWindow.children.length === 0) {
            addChatMessage(techSupportChatWindow, "Hello! I'm the support bot. How can I assist you with the Counter Hub app?", 'bot');
        }
    });

    async function handleTechSupportSubmit() {
        const userInput = techSupportInput.value.trim();
        if (userInput) {
            addChatMessage(techSupportChatWindow, userInput, 'user');
            techSupportInput.value = '';
            addChatMessage(techSupportChatWindow, "", 'bot', true);

            const systemPrompt = `You are an AI technical support agent for an application called 'Counter Hub'. You are helpful and knowledgeable about web application issues. You can guide users on how to solve common problems like 'the page is not loading' or 'a button is not working'. Be polite and clear.`;
            const botResponse = await getGeminiResponse(userInput, systemPrompt, false);

            addChatMessage(techSupportChatWindow, botResponse, 'bot');
        }
    }

    techSupportSendBtn.addEventListener('click', handleTechSupportSubmit);
    techSupportInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleTechSupportSubmit(); });

    // --- Finance AI Features ---
    const getFinanceAnalysisBtn = document.getElementById('get-finance-analysis-btn');
    const financeAnalysisBtnText = document.getElementById('finance-analysis-btn-text');
    const financeAnalysisModal = document.getElementById('finance-analysis-modal');
    const closeAnalysisModalBtn = document.getElementById('close-analysis-modal-btn');
    const analysisContent = document.getElementById('analysis-content');
    getFinanceAnalysisBtn.dataset.originalText = financeAnalysisBtnText.innerHTML;

    closeAnalysisModalBtn.addEventListener('click', () => financeAnalysisModal.classList.add('modal-closed'));
    financeAnalysisModal.addEventListener('click', e => { if (e.target === financeAnalysisModal) financeAnalysisModal.classList.add('modal-closed'); });

    getFinanceAnalysisBtn.addEventListener('click', async () => {
        if (financeState.expenses.length === 0) {
            analysisContent.innerHTML = `<p class="text-center text-yellow-400">Please add some expenses before requesting an analysis.</p>`;
            financeAnalysisModal.classList.remove('modal-closed');
            return;
        }
        toggleButtonLoading(getFinanceAnalysisBtn, financeAnalysisBtnText, true, "Analyzing...");
        try {
            const userType = document.getElementById('user-type').value;
            const prompt = `Analyze the following financial data for a ${userType}. Budget: ${financeState.budget}, Expenses: ${JSON.stringify(financeState.expenses)}. Provide a summary, identify the largest spending category, and offer 2-3 actionable saving tips based on the data. Format your response with clear headings.`;
            const systemPrompt = `You are a financial analyst AI. Provide clear, concise, and helpful analysis of user spending data. Use markdown for formatting (e.g., **Heading** and lists with -).`;
            const response = await getGeminiResponse(prompt, systemPrompt);
            analysisContent.innerHTML = markdownToHtml(response);
            financeAnalysisModal.classList.remove('modal-closed');
        } finally {
            toggleButtonLoading(getFinanceAnalysisBtn, financeAnalysisBtnText, false);
        }
    });

    // --- Savings Planner AI ---
    const generateSavingsPlanBtn = document.getElementById('generate-savings-plan-btn');
    const generateSavingsPlanBtnText = document.getElementById('generate-savings-plan-btn-text');
    const savingsPlanOutput = document.getElementById('savings-plan-output');
    generateSavingsPlanBtn.dataset.originalText = generateSavingsPlanBtnText.innerHTML;

    generateSavingsPlanBtn.addEventListener('click', async () => {
        const goalName = document.getElementById('savings-goal-name').value;
        const goalAmount = document.getElementById('savings-goal-amount').value;
        const goalDate = document.getElementById('savings-goal-date').value;

        if (!goalName || !goalAmount || !goalDate) {
            savingsPlanOutput.innerHTML = `<p class="text-yellow-400">Please fill out all fields for the savings goal.</p>`;
            savingsPlanOutput.classList.remove('hidden');
            return;
        }

        toggleButtonLoading(generateSavingsPlanBtn, generateSavingsPlanBtnText, true, "Planning...");
        try {
            const prompt = `Create a savings plan to save ₹${goalAmount} for a "${goalName}" by ${goalDate}. The user's monthly budget is ₹${financeState.budget} and current monthly spending is ${financeState.expenses.reduce((s, e) => s + e.amount, 0)}. Suggest a monthly savings amount and 3 practical tips to cut costs based on their spending profile.`;
            const systemPrompt = `You are a helpful savings planner AI. Provide a clear, actionable savings plan. Use markdown for formatting.`;
            const response = await getGeminiResponse(prompt, systemPrompt);
            savingsPlanOutput.innerHTML = markdownToHtml(response);
            savingsPlanOutput.classList.remove('hidden');
        } finally {
            toggleButtonLoading(generateSavingsPlanBtn, generateSavingsPlanBtnText, false);
        }
    });

    // --- Productivity AI ---
    const productivityGoalInput = document.getElementById('productivity-goal-input');
    const generateTasksBtn = document.getElementById('generate-tasks-btn');
    const generateTasksBtnText = document.getElementById('generate-tasks-btn-text');
    generateTasksBtn.dataset.originalText = generateTasksBtnText.innerHTML;

    generateTasksBtn.addEventListener('click', async () => {
        const goal = productivityGoalInput.value;
        if (!goal) return;

        toggleButtonLoading(generateTasksBtn, generateTasksBtnText, true);
        try {
            const prompt = `Generate a JSON array of 4-6 simple, actionable tasks to achieve the goal: "${goal}". Each item should be a short string. Example format: ["Task 1", "Task 2"]`;
            const systemPrompt = `You are a productivity assistant that provides tasks in a JSON string array format.`;
            const response = await getGeminiResponse(prompt, systemPrompt, true);

            // --- FIX: Add robust JSON parsing with error handling ---
            try {
                const tasks = JSON.parse(response);
                if (tasks.error) { throw new Error(tasks.error); }
                if (!Array.isArray(tasks)) { throw new Error("Response was not an array."); }

                taskList.innerHTML = tasks.map(task => `
                <li class="flex items-center">
                    <input type="checkbox" class="h-5 w-5 rounded border-gray-500 bg-slate-700 text-indigo-500 focus:ring-indigo-500">
                    <span class="ml-3 text-gray-300">${task}</span>
                </li>
            `).join('');
                updateProgress();
            } catch (e) {
                console.error("Failed to parse tasks JSON:", response, e);
                taskList.innerHTML = `<li class="text-red-400">Sorry, there was an error generating the routine. Please try a different goal.</li>`;
            }

        } finally {
            toggleButtonLoading(generateTasksBtn, generateTasksBtnText, false);
        }
    });

    // --- Initial Load ---
    fetchExpenses();
    fetchTasks();

    // --- Habits AI ---
    const habitGoalInput = document.getElementById('habit-goal-input');
    const generateHabitPlanBtn = document.getElementById('generate-habit-plan-btn');
    const generateHabitPlanBtnText = document.getElementById('generate-habit-plan-btn-text');
    const habitTrackerContainer = document.getElementById('habit-tracker-container');
    const habitTitle = document.getElementById('habit-title');
    const habitAdvice = document.getElementById('habit-advice');
    const habitChecklist = document.getElementById('habit-checklist');
    const badgeDisplay = document.getElementById('badge-display');
    generateHabitPlanBtn.dataset.originalText = generateHabitPlanBtnText.innerHTML;

    generateHabitPlanBtn.addEventListener('click', async () => {
        const goal = habitGoalInput.value;
        if (!goal) return;

        toggleButtonLoading(generateHabitPlanBtn, generateHabitPlanBtnText, true);
        try {
            const prompt = `For the habit goal "${goal}", generate a JSON object with: a "title" (string), "advice" (string, 1-2 sentences), a "checklist" (array of 3-4 short string tasks), and "badges" (array of 3 strings for achievements like 'Day 1', 'Week 1', '30-Day Streak').`;
            const systemPrompt = `You are a health and wellness coach that provides habit plans in a specific JSON format.`;
            const response = await getGeminiResponse(prompt, systemPrompt, true);

            // --- FIX: Add robust JSON parsing with error handling ---
            try {
                const plan = JSON.parse(response);
                if (plan.error) { throw new Error(plan.error); }

                habitTitle.textContent = plan.title;
                habitAdvice.textContent = plan.advice;
                habitChecklist.innerHTML = plan.checklist.map(item => `
                 <li class="flex items-center">
                    <input type="checkbox" class="h-5 w-5 rounded border-gray-500 bg-slate-700 text-indigo-500 focus:ring-indigo-500">
                    <span class="ml-3 text-gray-300">${item}</span>
                </li>`).join('');
                badgeDisplay.innerHTML = plan.badges.map(badge => `
                <div class="text-center text-gray-500">
                    <div class="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-3xl mb-1">🏆</div>
                    <p class="text-xs font-medium">${badge}</p>
                </div>`).join('');
                habitTrackerContainer.classList.remove('hidden');
            } catch (e) {
                console.error("Failed to parse habit plan JSON:", response, e);
                habitTrackerContainer.classList.remove('hidden');
                habitTitle.textContent = "Error";
                habitAdvice.textContent = "Could not generate a plan for that habit. Please try another one.";
                habitChecklist.innerHTML = "";
                badgeDisplay.innerHTML = "";
            }

        } finally {
            toggleButtonLoading(generateHabitPlanBtn, generateHabitPlanBtnText, false);
        }
    });

    // --- Goals AI ---
    const timelineContainer = document.getElementById('timeline-container');
    const planMilestonesBtn = document.getElementById('plan-milestones-btn');
    const planMilestonesBtnText = document.getElementById('plan-milestones-btn-text');
    const findResourcesBtn = document.getElementById('find-resources-btn');
    const findResourcesBtnText = document.getElementById('find-resources-btn-text');
    const resourcesContainer = document.getElementById('resources-container');
    const resourcesOutput = document.getElementById('resources-output');
    planMilestonesBtn.dataset.originalText = planMilestonesBtnText.innerHTML;
    findResourcesBtn.dataset.originalText = findResourcesBtnText.innerHTML;

    planMilestonesBtn.addEventListener('click', async () => {
        const title = document.getElementById('goal-title').value;
        const deadline = document.getElementById('goal-deadline').value;
        if (!title || !deadline) return;

        toggleButtonLoading(planMilestonesBtn, planMilestonesBtnText, true);
        try {
            const prompt = `Generate a JSON object for the goal "${title}" with a deadline of ${deadline}. The object should have a "milestones" property, which is an array of objects. Each object in the array should have a "title" (string) and a "description" (string). Create 4-5 milestones.`;
            const systemPrompt = `You are a goal planning AI that returns milestones in a specific JSON format.`;
            const response = await getGeminiResponse(prompt, systemPrompt, true);

            // --- FIX: Add robust JSON parsing with error handling ---
            try {
                const data = JSON.parse(response);
                if (data.error) { throw new Error(data.error); }

                timelineContainer.innerHTML = data.milestones.map((item, index) => `
                <div class="timeline-item">
                    <div class="timeline-line"></div>
                    <div class="timeline-dot font-bold text-gray-400">${index + 1}</div>
                    <div class="font-medium text-gray-300">${item.title}</div>
                    <p class="text-sm text-gray-500">${item.description}</p>
                </div>
            `).join('');
            } catch (e) {
                console.error("Failed to parse milestones JSON:", response, e);
                timelineContainer.innerHTML = `<p class="text-red-400">Sorry, could not generate milestones for that goal.</p>`;
            }
        } finally {
            toggleButtonLoading(planMilestonesBtn, planMilestonesBtnText, false);
        }
    });

    findResourcesBtn.addEventListener('click', async () => {
        const title = document.getElementById('goal-title').value;
        if (!title) return;

        toggleButtonLoading(findResourcesBtn, findResourcesBtnText, true, "Finding...");
        try {
            const prompt = `Find helpful resources for the goal: "${title}". Suggest 2-3 websites, books, or apps. Provide a brief description for each.`;
            const systemPrompt = `You are a helpful AI assistant that finds resources. Use markdown for formatting.`;
            const response = await getGeminiResponse(prompt, systemPrompt);
            resourcesOutput.innerHTML = markdownToHtml(response);
            resourcesContainer.classList.remove('hidden');
        } finally {
            toggleButtonLoading(findResourcesBtn, findResourcesBtnText, false);
        }
    });

    // --- AI Coach Tooltip ---
    const aiTooltip = document.getElementById('ai-tooltip');
    setInterval(() => { if (aiChatModal.classList.contains('modal-closed')) { aiTooltip.classList.add('show'); setTimeout(() => { aiTooltip.classList.remove('show'); }, 1500); } }, 4000);

    // --- 3D Background Animation ---
    function init3DAnimation() {
        if (animationInitialized) return;
        animationInitialized = true;
        const canvas = document.getElementById('bg-animation');
        const container = canvas.parentElement;
        try {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.z = 5;
            renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        } catch (e) { console.error("Could not initialize 3D context:", e); canvas.style.display = 'none'; return; }
        renderer.setPixelRatio(window.devicePixelRatio);
        shapes = new THREE.Group();
        const geometries = [new THREE.IcosahedronGeometry(0.8, 0), new THREE.TorusGeometry(0.5, 0.2, 16, 100), new THREE.BoxGeometry(1, 1, 1), new THREE.SphereGeometry(0.7, 32, 16), new THREE.ConeGeometry(0.6, 1.2, 32)];
        const colors = [0x4ade80, 0x60a5fa, 0xf87171, 0xfbbf24, 0xa78bfa];
        for (let i = 0; i < 40; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.1, emissive: color, emissiveIntensity: 0.2 });
            const shape = new THREE.Mesh(geometry, material);
            shape.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 12);
            shape.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            const scale = Math.random() * 0.4 + 0.3;
            shape.scale.set(scale, scale, scale);
            shapes.add(shape);
        }
        scene.add(shapes);
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);
        window.addEventListener('resize', onWindowResize);
        document.addEventListener('mousemove', onMouseMove);
        onWindowResize();
        animate();
    }
    function onWindowResize() { if (!renderer) return; const container = document.getElementById('domain-selection'); if (container.clientHeight === 0) return; camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); }
    function onMouseMove(event) { mouseX = (event.clientX / window.innerWidth) * 2 - 1; mouseY = -(event.clientY / window.innerHeight) * 2 + 1; }
    function animate() { if (!renderer) return; requestAnimationFrame(animate); shapes.rotation.x += 0.0009; shapes.rotation.y += 0.0009; camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.03; camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.03; camera.lookAt(scene.position); renderer.render(scene, camera); }

    // Initial page load handler
    showPage(window.location.hash || '#domain-selection');
    updateUIAfterLogin(true); // Set to "logged in" state by default
    // Initial page load helper not needed here as we called fetchExpenses above.
    // showPage(window.location.hash || '#domain-selection'); 
    // updateUIAfterLogin(true);
    // renderFinanceUI is called by fetchExpenses
});

