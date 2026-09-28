document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData()
})

// gets the data that will then be displayed on the Übersicht
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard')
        const data = await response.json()
        const overallProgress = document.querySelector('.overall-progress-text')
        if (overallProgress) {
            overallProgress.innerText = `${data.user.overallProgress}%`
        }

        renderTopics(data.topics)
    } catch (error) {
        console.error('Error while fetching progress: ', error)
    }
}

// this here will actually then display the data on the Übersicht
function renderTopics(topics) {
    const container = document.querySelector('.topics-list-container')
    if (!container) return;

    container.innerHTML = topics.map(topic => `
        <div class="topic-card">
            <div class="topic-info">
                <h3>${topic.title}</h3>
            </div>
            <div class="topic-progress-bar">
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${topic.progress}%;"></div>
                </div>
                <span class="topic-percentage">${topic.progress}%</span>
                <span class="arrow">></span>
            </div>
        </div>
    `).join('');
}