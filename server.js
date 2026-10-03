// server.js
const express = require('express')
const path = require('path')
const app = express()

app.use(express.json())

// this here is just template data, this will be replaced by actual data banks
const mockDatabase = {

    // template user
    users: {
        525810958: {
            id: 525810958,
            username: 'petkoslaw',
            grade: 10,
            xp: 1250,
            streakDays: 0,
            overallProgress: {
                "rechnen": 0,
                "brüche": 0,
                "potenzen": 0,
                "würzeln": 0,
            }
        },
        103072006: {
            id: 103072006,
            username: 'AfonsoStuf',
            grade: 10,
            xp: 1250,
            streakDays: 0,
            overallProgress: {
                "rechnen": 0,
                "brüche": 0,
                "potenzen": 0,
                "würzeln": 0,
            }
        }
    },

    exercises: {
        "02-gleichungen": [
            {
                id: "1",
                subcategoryId: "grundlagen",
                question: "Was ist x + 2 = 5?",
                options: ["1", "2", "3", "4"],
                correctIndex: 2
            },
        ]
    },

    topics: [
        {
            id: "02-gleichungen",
            title: "02 Gleichungen",
            description: "",
            progress: 30,
            unlocked: true,
            icon: "fa-calculator",
            subcategories: {
                "grundlagen": {
                    id: "grundlagen",
                    name: "Grundlagen",
                    description: "",
                },
                "lineare-gleichungen": {
                    id: "lineare-gleichungen",
                    name: "Lineare Gleichungen",
                    description: "",
                },
                "quadratische-gleichungen": {
                    id: "quadratische-gleichungen",
                    name: "Quadratische Gleichungen",

                },
                "bruch-gleichungen": {
                    id: "bruch-gleichungen",
                    name: "Bruchgleichungen",
                },
            },
        },
    ],
}

// this thing here gets the template data
app.get('/api/dashboard/:userId', async (req, res) => {
    const { userId } = req.params
    console.log(`Fetching dashboard for User ID: ${userId}`)
    
    const user = mockDatabase.users[userId]
    if (!user) {
        return res.status(404).json({ error: "User not found "})
    }

    res.json({
        user: user,
        topics: mockDatabase.topics
    })
})

// this here then gets the lesson questions for a specific topic (like Trigonometrie n stuff like that)
app.get('/api/lessons/:topicId', (req, res) => {
    const { topicId } = req.params
    console.log(`Fetching topic & exercises for: ${topicId}`)

    const topic = mockDatabase.topics.find(t => t.id === topicId)
    if (!topic) return res.status(404).json({ error: "Topic not found" })

    const allExercises = mockDatabase.exercises[topicId]

    res.json({ ...topic, allExercises})
})

app.get('/api/user/:userId/progress', (req, res) => {
    const { userId } = req.params
    const { topicId, questionId, correct } = req.body

    const user = mockDatabase.users[userId]
    if (!user) return

    if (correct) {
        user.xp += 10

        if (user.overallProgress[topicId] !== undefined) {
            user.overallProgress[topicId] = Math.min(100, user.overallProgress[topicId] + 10)
        }
    }

    console.log(`Updated progress for user ${userId}: `, user)

    res.json({
        user: user,
        topics: mockDatabase.topics
    })

})

// I genuinely have no idea what this does
app.use(express.static(__dirname));

// Starts the server
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})
app.listen(3000, () => console.log('Math App Backend running on port 3000'))