// syncStore.js
window.AppSync = {
    getSession() {
        const data = localStorage.getItem('userSession')
        return data ? JSON.parse(data) : null
    },

    setSession(data) {
        localStorage.setItem('userSession', JSON.stringify(data))
        window.dispatchEvent(new CustomEvent('sessionUpdated', { detail: data }))
    },

    async refreshSession(userId) {
        try {
            const res = await fetch(`/api/dashboard/${userId}`)
            if (!res.ok) throw new Error("Failed to fetch fresh user data.")
            const freshData = await res.json()
            this.setSession(freshData)
            return freshData
        } catch (err) {
            console.error("Error syncinc session: ", err)
            return this.getSession()
        }
    },

    async saveProgress(userId, progressData) {
        try {
            const res = await fetch(`/api/user/${userId}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(progressData)
            })

            if (!res.ok) throw new Error("Server update failed")
            
            const updatedFullState = await res.json()
            this.setSession(updatedFullState)
            return updatedFullState
        } catch (err) {
            console.error("Error saving progress: ", err)
            return null
        }
    }
}

window.addEventListener('storage', (e) => {
    if (e.key === 'userSession' && e.newValue) {
        window.dispatchEvent(new CustomEvent('sessionUpdated', {
            detail: JSON.parse(e.newValue)
        }))
    }
})