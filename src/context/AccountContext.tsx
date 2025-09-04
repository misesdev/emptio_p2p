import { createContext, useContext, ReactNode, ReactElement, useEffect } from 'react';
import useLoadSubscription from '../hooks/useLoadSubscription';
import useDataEventStore from '@services/zustand/useDataEventStore';
import { User } from '@services/user/types/User';
import { Wallet } from '@services/wallet/types/Wallet';
import { StoredItem } from '@storage/types';
import { AppSettings } from '@storage/settings/types';
import { NDKEvent } from '@nostr-dev-kit/ndk-mobile';
import useLoadFollows from '../hooks/useLoadFollows';
import useLoadSettings from '../hooks/useLoadSettings';
import useLoadWallets from '../hooks/useLoadWallets';
import { useAuth } from './AuthContext';

type UserContextType = {
    user: User;
    setUser: (u: User) => void;
    settings: AppSettings;
    setSettings: (s: AppSettings) => void;
    wallets: StoredItem<Wallet>[];
    setWallets: (ws: StoredItem<Wallet>[]) => void;
    follows: User[];
    setFollows: (fs: User[]) => void;
    followsEvent: NDKEvent;
    setFollowsEvent: (e: NDKEvent) => void;
    loading: boolean;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

const useAccount = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) throw new Error('AuthProvider not found');
    return context;
}

type Props = { children: ReactNode; }

const AccountProvider = ({ children }: Props): ReactElement => {

    const { user, setUser } = useAuth()
    const { loading } = useLoadSubscription(user)
    const { 
        follows, setFollows, followsEvent, setFollowsEvent
    } = useLoadFollows(user)
    const { settings, setSettings } = useLoadSettings()
    const { wallets, setWallets } = useLoadWallets()
    const { dataEvents } = useDataEventStore()
   
    useEffect(() => {
        if(dataEvents["follows"]) {
            console.log("received follows event")
            setFollowsEvent(dataEvents["follows"])
        }
    }, [dataEvents])

    return (
        <UserContext.Provider value={{
                user,
                setUser,
                wallets,
                setWallets,
                settings,
                setSettings,
                follows,
                setFollows,
                followsEvent,
                setFollowsEvent,
                loading
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export { AccountProvider, useAccount }
