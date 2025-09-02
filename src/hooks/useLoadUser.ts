
import { useEffect, useMemo, useState } from "react"
import { User } from "@services/user/types/User"
import { UserStorage } from "@storage/user/UserStorage"

const useLoadUser = () => {

    const [user, setUser] = useState({} as User)
    const [loading, setLoading] = useState(true)
    const storage = useMemo(() => new UserStorage(), [])

    useEffect(() => { 
        const load = async () => await loadUser()
        load()
    }, [])

    const loadUser = async () => {
        const user = await storage.get()
        if(user) setUser(user)
        setLoading(false)
    }

    return {
        user,
        setUser,
        loading
    }
}

export default useLoadUser
