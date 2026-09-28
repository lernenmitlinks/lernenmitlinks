const express = require('express')
const path = require('path')
const app = express()

app.use(express.json())

// this here is just template data, this will be replaced by actual data banks
const mockDatabase = {

    // template user
    user: {
        id: 525810958,
        username: 'petkoslaw',
        grade: 10,
        xp: 1250,
        streakDays: 5,
        overallProgress: 72 // this is in % (100% is all the topics that the student chose)
    },

    topics: [
        {
            id: "01-grundlagen",
            title: "01 Grundlagen",
            description: "Rechnen, Brüche, Potenzen & Wurzeln",
            progress: 85,
            unlocked: true,
            icon: "fa-calculator"
        },
        {
            id: "02-terme-gleichungen",
            title: "02 Terme & Gleichungen",
            description: "Terme vereinfachen, Gleichungen lösen",
            progress: 70,
            unlocked: true,
            icon: "fa-square-root-variable"
        },
        {
            id: "03-trigonometrie",
            title: "03 Trigonometrie in der Ebene",
            description: "Sinus, Kosinus, Tangens & Dreiecke",
            progress: 65,
            unlocked: true,
            icon: "fa-shapes"
        },
        {
            id: "04-koerper",
            title: "04 Körper",
            description: "Volumen, Oberfläche & räumliche Geometrie",
            progress: 78,
            unlocked: true,
            icon: "fa-cube"
        },
        {
            id: "05-prozentrechnungen",
            title: "05 Prozentrechnungen",
            description: "Prozent, Zins & Sachaufgaben",
            progress: 60,
            unlocked: true,
            icon: "fa-percent"
        },
        {
            id: "06-funktionen",
            title: "06 Funktionen",
            description: "Geraden, Parabeln & Funktionsgleichungen",
            progress: 50,
            unlocked: true,
            icon: "fa-chart-line"
        }
    ],

    lessons: {
        "02-terme-gleichungen": [
            {
                id: "q1",
                question: "Löse nach x auf: 2x + 6 = 14",
                options: ["x = 3", "x = 4", "x = 5", "x = 8"],
                correctAnswer: 1,
                xpReward: 15
            },
            {
                id: "q2",
                question: "Löse die quadratische Gleichung: x² - 5x + 6 = 0",
                options: ["x = 1, x = 6", "x = 2, x = 3", "x = -2, x = -3", "x = 0, x = 5"],
                correctAnswer: 1,
                xpReward: 25
            }
        ]
    }
}

// this thing here gets the template data
app.get('/api/dashboard', async (req, res) => {
    res.json({
        user: mockDatabase.user,
        topics: mockDatabase.topics
    })
})

// this here then gets the lesson questions for a specific topic (like Trigonometrie n stuff like that)
app.get('/api/lessons/:topicId', (req, res) => {
    const { topicId } = req.params
    const questions = mockDatabase.lessons[topicId] || []
    res.json({ topicId, questions })
})

// I genuinely have no idea what this does
app.use(express.static(__dirname));

// Starts the server
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})
app.listen(3000, () => console.log('Math App Backend running on port 3000'))