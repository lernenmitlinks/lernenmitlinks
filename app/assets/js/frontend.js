// frontend.js
document.addEventListener('DOMContentLoaded', async () => {
    const DEFAULT_USER_ID = 525810958

    let data = AppSync.getSession() || await AppSync.refreshSession(DEFAULT_USER_ID)
    renderDashboard(data)

    window.addEventListener('sessionUpdated', (e) => {
        renderDashboard(e.detail)
    })

})

// gets the data that will then be displayed on the Übersicht
async function renderDashboard(data) {

    if (!data) return

    const welcomeText = document.querySelector(".welcome-text")
    if (welcomeText && data.user) {
        welcomeText.querySelector("h1").innerText = "Hallo, " + data.user.username
    }

    const overallProgress = document.querySelector(".overall-progress-text")
    if (overallProgress && data.topics) {
        // calculation
    }

    renderTopics(data.topics || [])
}

// this here will actually then display the data on the Übersicht
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
                    <div class="progress-bar-fill" style="width: ${topic.progress}%;"></div>
                </div>
                <span class="topic-percentage">${topic.progress}%</span>
                <a href="aufgabe.html#${topic.id}" class="arrow">></a>
            </div>
        </div>
    `).join('');
}