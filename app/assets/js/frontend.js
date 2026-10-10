// frontend.js
document.addEventListener('DOMContentLoaded', async () => {
    const DEFAULT_USER_ID = 525810958

    let data = AppSync.getSession() || await AppSync.refreshSession(DEFAULT_USER_ID)
    renderDashboard(data)

    window.addEventListener('sessionUpdated', (e) => {
        renderDashboard(e.detail)
    })
})

async function renderDashboard(data) {
    if (!data) return

    const welcomeText = document.querySelector(".welcome-text")
    if (welcomeText && data.user) {
        welcomeText.querySelector("h1").innerText = "Hallo, " + data.user.username
    }

    const topics = data.topics || []
    if (topics.length > 0) {
        const totalProgress = topics.reduce((acc, t) => acc + (t.progress || 0), 0)
        const avgProgress = Math.round(totalProgress / topics.length)
        
        const overallProgressText = document.querySelector(".overall-progress-text")
        if (overallProgressText) overallProgressText.innerText = avgProgress + "%"

        const progressBarFill = document.querySelector(".progress-bar-fill")
        if (progressBarFill) progressBarFill.style.width = avgProgress + "%"
    }

    renderTopics(topics)
}

function renderTopics(topics) {
    const container = document.querySelector('.topics-list-container')
    if (!container) return;

    container.innerHTML = topics.map(topic => `
        <div class="topic-card">
            <div class="topic-info">
                <h3>${topic.title}</h3>
                <p>${topic.description || ''}</p>
            </div>
            <div class="topic-progress-bar">
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${topic.progress || 0}%;"></div>
                </div>
                <span class="topic-percentage">${topic.progress || 0}%</span>
                <a href="aufgabe.html#${topic.id}" class="arrow">&gt;</a>
            </div>
        </div>
    `).join('');
}