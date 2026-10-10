// server.js
const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()

app.use(express.json())

const DATA_FILE = path.join(__dirname, 'metadata.json')

function loadDatabase() {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const rawData = fs.readFileSync(DATA_FILE, 'utf8')
            if (rawData.trim() === "") {
                throw new Error("File is empty")
            }
            return JSON.parse(rawData)
        } catch (err) {
            console.warn("metadata.json was empty or corrupted. Re-initializing default database...", err.message)
        }
    }

    // Default initial database structure
    const initialData = {
        users: {
            525810958: {
                id: 525810958,
                username: 'petkoslaw',
                grade: 10,
                xp: 1250,
                streakDays: 0,
                overallProgress: {
                    "02-gleichungen": 0
                },
                subcategoryProgress: {
                    "02-gleichungen": {
                        "grundlagen": 0,
                        "lineare-gleichungen": 0,
                        "quadratische-gleichungen": 0,
                        "bruch-gleichungen": 0
                    }
                }
            }
        },
        exercises: {
            "02-gleichungen": [
                {
                    id: "e1",
                    subcategoryId: "grundlagen",
                    question: "Löse nach $x$ auf: $x + 5 = 12$",
                    hint: "Subtrahiere 5 auf beiden Seiten.",
                    correctAnswer: "7"
                },
                {
                    id: "e2",
                    subcategoryId: "lineare-gleichungen",
                    question: "Bestimme die Lösung für die lineare Gleichung: $3x - 4 = 11$",
                    hint: "Addiere 4 und teile durch 3.",
                    correctAnswer: "5"
                },
                {
                    id: "e3",
                    subcategoryId: "quadratische-gleichungen",
                    question: "Finde die positive Lösung von $x^2 = 49$",
                    hint: "Ziehe auf beiden Seiten die Wurzel.",
                    correctAnswer: "7"
                },
                {
                    id: "e4",
                    subcategoryId: "bruch-gleichungen",
                    question: "Löse die Bruchgleichung für $x \\neq 0$: $\\frac{8}{x} = 4$",
                    hint: "Multipliziere mit $x$ und teile durch 4.",
                    correctAnswer: "2"
                }
            ]
        },
        topics: [
            {
                id: "02-gleichungen",
                title: "02 Gleichungen",
                description: "Realschule BW Prüfungsvorbereitung: Grundlagen, lineare, quadratische und Bruchgleichungen.",
                progress: 0,
                unlocked: true,
                icon: "fa-calculator",
                subcategories: {
                    "grundlagen": { id: "grundlagen", name: "Grundlagen", description: "Einfache Äquivalenzumformungen." },
                    "lineare-gleichungen": { id: "lineare-gleichungen", name: "Lineare Gleichungen", description: "Gleichungen mit $x$ auf beiden Seiten." },
                    "quadratische-gleichungen": { id: "quadratische-gleichungen", name: "Quadratische Gleichungen", description: "Gleichungen mit $x^2$." },
                    "bruch-gleichungen": { id: "bruch-gleichungen", name: "Bruchgleichungen", description: "Gleichungen mit der Unbekannten im Nenner." },
                },
            },
        ],
    }

    saveDatabase(initialData)
    return initialData
}

// Helper function to save database state to metadata.json
function saveDatabase(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
    } catch (err) {
        console.error("Error writing to metadata.json:", err)
    }
}

let mockDatabase = loadDatabase()

app.get('/api/dashboard/:userId', async (req, res) => {
    const { userId } = req.params
    const user = mockDatabase.users[userId]
    if (!user) return res.status(404).json({ error: "User not found" })

    res.json({ user: user, topics: mockDatabase.topics })
})

app.get('/api/lessons/:topicId', (req, res) => {
    const { topicId } = req.params
    const topic = mockDatabase.topics.find(t => t.id === topicId)
    if (!topic) return res.status(404).json({ error: "Topic not found" })

    const allExercises = mockDatabase.exercises[topicId] || []
    res.json({ ...topic, allExercises })
})

app.post('/api/user/:userId/progress', (req, res) => {
    const { userId } = req.params
    const { topicId, subcategoryId, correct } = req.body

    console.log("Received progress update:", { userId, topicId, subcategoryId, correct })

    const user = mockDatabase.users[userId]
    if (!user) return res.status(404).json({ error: "User not found" })

    if (correct) {
        user.xp += 10
        if (!user.subcategoryProgress[topicId]) {
            user.subcategoryProgress[topicId] = {}
        }
        let subProg = user.subcategoryProgress[topicId][subcategoryId] || 0
        user.subcategoryProgress[topicId][subcategoryId] = Math.min(100, subProg + 50)

        // Calculate average topic progress based on subcategories
        const subcategories = mockDatabase.topics.find(t => t.id === topicId)?.subcategories || {}
        const subKeys = Object.keys(subcategories)
        let totalSub = 0
        subKeys.forEach(sk => {
            totalSub += (user.subcategoryProgress[topicId][sk] || 0)
        })
        const avgTopicProgress = Math.round(totalSub / subKeys.length)
        user.overallProgress[topicId] = avgTopicProgress

        const topic = mockDatabase.topics.find(t => t.id === topicId)
        if (topic) {
            topic.progress = avgTopicProgress
        }

        // Persist changes directly to metadata.json
        saveDatabase(mockDatabase)
        console.log("Successfully saved updated database to metadata.json!")
    }

    res.json({
        user: user,
        topics: mockDatabase.topics
    })
})

app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')))
app.listen(3000, () => console.log('Math App Backend with file persistence running on port 3000'))