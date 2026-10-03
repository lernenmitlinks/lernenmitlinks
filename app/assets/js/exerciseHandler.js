// exercise.js
var currentQuestionIndex = 0
var currentTopicData = null

document.addEventListener('DOMContentLoaded', async () => {

    currentQuestionIndex = 0

    const topicId = window.location.hash.substring(1).split('#')[0]
    if (!topicId) {
        console.error("No topic ID found in URL has!")
        return
    }

    try {
        const response = await fetch(`/api/lessons/${topicId}`)
        if (!response.ok) throw new Error("Topic not found.")

        currentTopicData = await response.json()

        const topicName = document.getElementById("topic-name")
        const topicDescription = document.getElementById("topic-description")
        if (topicName) topicName.textContent = currentTopicData.title
        if (topicDescription) topicDescription.textContent = currentTopicData.description

        if (currentTopicData.subcategories) {
            renderOptions(currentTopicData.subcategories)
        }

    } catch (error) {
        console.error("Error loading topics: ", error)
    }

    window.addEventListener('sessionUpdated', () => {
        if (currentTopicData && currentTopicData.subcategories) {
            renderOptions(currentTopicData.subcategories)
        }
    })
})

function renderOptions(subcategories) {
    const container = document.querySelector(".subdata")
    if (!container) {
        console.log("Yeah no")
        return
    }

    const subList = Object.values(subcategories)
    const data = AppSync.getSession()

    container.innerHTML = subList.map(sub => `
        <div class="topic-card">
            <div class="topic-info">
                <h3>${sub.name}</h3>
            </div>
            <div class="topic-progress-bar">
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: 0%;"></div>
                </div>
                <span class="topic-percentage">0%</span>
                <a class="arrow" onClick="initiateQuestion('${sub.id}')">></a>
            </div>
        </div>
        `
    ).join('')
}

function initiateQuestion(subcategoryId) {
    const currentHash = window.location.hash.substring(1).split('/')[0]
    window.location.hash = `${currentHash}/${subcategoryId}`

    if (currentTopicData && currentTopicData.allExercises) {
        const subExercises = currentTopicData.allExercises.filter(
            ex => ex.subcategoryId === subcategoryId
        )

        console.log(`Starting subcategory ${subcategoryId} with exercises: `, subExercises)

        currentQuestionIndex = 0
        renderQuestion(subExercises[currentQuestionIndex])
    }
}

function renderQuestion(question) {

}

async function checkAnswer(topicId, questionId, selectedIdx, correctIdx) {
    const session = AppSync.getSession()
    const isCorrect = (selectedIdx === correctIdx)
    
    if (isCorrect) {
        alert("Richtig!")
    } else {
        alert("Falsch!")
    }

    if (session && session.user) {
        await AppSync.saveProgress(session.user.id, {
            topicId: topicId,
            questionId: questionId,
            correct: isCorrect,
        }) 
    }
}