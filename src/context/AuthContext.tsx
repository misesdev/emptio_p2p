import { createContext, useContext, useState, ReactNode, ReactElement, useEffect } from 'react';
import { User } from '@services/user/types/User';
import useLoadUser from '../hooks/useLoadUser';

type AuthContextType = {
    user: User;
    setUser: (u: User) => void;
    loading: boolean;
    isLoggedIn: boolean;
    login: (u: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('AuthProvider not found');
    return context;
}

const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
   
    const { loading, user, setUser } = useLoadUser()
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        setIsLoggedIn(!!user.pubkey)
    }, [user])

    const login = (user: User) => {
        setIsLoggedIn(true)
        setUser(user)
    }

    const logout = () => setIsLoggedIn(false)

    return (
        <AuthContext.Provider value={{ loading, user, setUser, isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthProvider, useAuth }
