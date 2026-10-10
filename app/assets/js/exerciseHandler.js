// exercise.js
var currentQuestionIndex = 0
var currentTopicData = null
var currentSubExercises = []
var activeSubcategoryId = null

document.addEventListener('DOMContentLoaded', async () => {
    currentQuestionIndex = 0
    const DEFAULT_USER_ID = 525810958

    // CRITICAL FIX: Ensure session is always loaded from server if missing in localStorage
    let session = AppSync.getSession()
    if (!session || !session.user) {
        console.log("No session found in localStorage. Refreshing session from server...")
        session = await AppSync.refreshSession(DEFAULT_USER_ID)
    }
    console.log("Active session verified:", session)

    let hashVal = window.location.hash.substring(1)
    let topicId = hashVal.split('/')[0]
    
    if (!topicId) {
        topicId = "02-gleichungen"
        window.location.hash = topicId
    }

    try {
        const response = await fetch(`/api/lessons/${topicId}`)
        if (!response.ok) throw new Error("Topic not found on server.")

        currentTopicData = await response.json()

        const topicName = document.getElementById("topic-name")
        const topicDescription = document.getElementById("topic-description")
        if (topicName) topicName.textContent = currentTopicData.title
        if (topicDescription) topicDescription.textContent = currentTopicData.description

        if (currentTopicData.subcategories) {
            renderOptions(currentTopicData.subcategories)
        }

        const subParts = hashVal.split('/')
        if (subParts.length > 1 && subParts[1]) {
            initiateQuestion(subParts[1])
        }

    } catch (error) {
        console.error("Error loading topic lessons: ", error)
    }

    window.addEventListener('sessionUpdated', (e) => {
        if (currentTopicData && currentTopicData.subcategories) {
            renderOptions(currentTopicData.subcategories)
        }
    })
})

function renderOptions(subcategories) {
    const container = document.querySelector(".subdata")
    if (!container) return

    const session = AppSync.getSession()
    const subProgressMap = session?.user?.subcategoryProgress?.[currentTopicData.id] || {}

    const subList = Object.values(subcategories)
    container.innerHTML = subList.map(sub => {
        const prog = subProgressMap[sub.id] || 0
        return `
            <div class="topic-card">
                <div class="topic-info">
                    <h3>${sub.name}</h3>
                    <p>${sub.description || ''}</p>
                </div>
                <div class="topic-progress-bar">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${prog}%;"></div>
                    </div>
                    <span class="topic-percentage">${prog}%</span>
                    <a class="arrow" href="javascript:void(0)" onclick="initiateQuestion('${sub.id}')">&gt;</a>
                </div>
            </div>
        `
    }).join('')

    if (window.MathJax) MathJax.typeset()
}

function initiateQuestion(subcategoryId) {
    activeSubcategoryId = subcategoryId
    const subdataEl = document.querySelector(".topic-subdata")
    const exerciseContainerEl = document.querySelector(".exercise-container")

    if (subdataEl) subdataEl.style.display = "none"
    if (exerciseContainerEl) exerciseContainerEl.style.display = "block"

    const currentHash = window.location.hash.substring(1).split('/')[0]
    window.location.hash = `${currentHash}/${subcategoryId}`

    if (currentTopicData && currentTopicData.allExercises) {
        currentSubExercises = currentTopicData.allExercises.filter(
            ex => ex.subcategoryId === subcategoryId
        )

        currentQuestionIndex = 0
        if (currentSubExercises.length > 0) {
            renderQuestion(currentSubExercises[currentQuestionIndex])
        } else {
            exerciseContainerEl.innerHTML = `
                <h2>Keine Aufgaben gefunden</h2>
                <p>Für diese Subkategorie sind aktuell noch keine Aufgaben hinterlegt.</p>
                <a href="aufgabe.html#${currentTopicData.id}" class="nav-item" style="display:inline-block; margin-top:20px;" onclick="location.reload()">Zurück zur Übersicht</a>
            `
        }
    }
}

function renderQuestion(question) {
    const exerciseBox = document.querySelector(".exercise-container")
    if (!exerciseBox) return

    exerciseBox.innerHTML = `
        <h2>Aufgabe ${currentQuestionIndex + 1} von ${currentSubExercises.length}</h2>
        <div class="exercise">
            <div class="question-card" style="background:#fff; padding:24px; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                <h3 class="question-text" style="font-size:1.3rem; margin-bottom:12px; color:#1e293b;">${question.question}</h3>
                <p style="color:#64748b; font-size:0.95rem; margin-bottom:20px;">💡 <em>Tipp: ${question.hint}</em></p>
                
                <div class="input-group" style="display:flex; gap:12px; align-items:center;">
                    <input type="text" id="user-answer-input" placeholder="Gib dein Ergebnis ein..." 
                        style="flex:1; padding:14px 16px; font-size:1rem; border:2px solid #cbd5e1; border-radius:8px; outline:none;">
                    
                    <button id="submit-answer-btn"
                        style="padding:14px 24px; background:#112a43; color:#fff; font-weight:600; border:none; border-radius:8px; cursor:pointer;">
                        Antwort prüfen
                    </button>
                </div>
                <div id="feedback-msg" style="margin-top:16px; font-weight:600; font-size:1rem;"></div>
            </div>
        </div>
    `

    const inputEl = document.getElementById("user-answer-input")
    const btnEl = document.getElementById("submit-answer-btn")

    inputEl.focus()

    // Bind event listeners cleanly via JS
    btnEl.addEventListener('click', () => {
        submitTypedAnswer(currentTopicData.id, question.id, question.correctAnswer)
    })

    inputEl.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            submitTypedAnswer(currentTopicData.id, question.id, question.correctAnswer)
        }
    })

    if (window.MathJax) MathJax.typeset()
}

async function submitTypedAnswer(topicId, questionId, correctAnswer) {
    const inputEl = document.getElementById("user-answer-input")
    const feedbackEl = document.getElementById("feedback-msg")
    if (!inputEl || !feedbackEl) return

    const userVal = inputEl.value.trim()
    const isCorrect = (userVal.toLowerCase() === correctAnswer.toLowerCase())

    console.log("Submitting answer:", { topicId, subcategoryId: activeSubcategoryId, userVal, isCorrect })

    inputEl.disabled = true

    if (isCorrect) {
        inputEl.style.borderColor = "#22c55e"
        inputEl.style.backgroundColor = "#f0fdf4"
        feedbackEl.style.color = "#166534"
        feedbackEl.innerText = "Richtig! Starke Leistung, Boss!"
    } else {
        inputEl.style.borderColor = "#ef4444"
        inputEl.style.backgroundColor = "#fef2f2"
        feedbackEl.style.color = "#991b1b"
        feedbackEl.innerText = `Falsch. Die richtige Lösung wäre: ${correctAnswer}`
    }

    if (window.AppSync && typeof AppSync.getSession === 'function') {
        const session = AppSync.getSession()
        console.log("Current session found for save:", session)
        if (session && session.user) {
            await AppSync.saveProgress(session.user.id, {
                topicId: topicId,
                subcategoryId: activeSubcategoryId,
                correct: isCorrect,
            })
        } else {
            console.warn("No user session found when trying to save progress!")
        }
    }

    setTimeout(() => {
        currentQuestionIndex++
        if (currentQuestionIndex < currentSubExercises.length) {
            renderQuestion(currentSubExercises[currentQuestionIndex])
        } else {
            alert("Subkategorie erfolgreich abgeschlossen, Boss!")
            window.location.hash = topicId
            location.reload()
        }
    }, 1800)
}