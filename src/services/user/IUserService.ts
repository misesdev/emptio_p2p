import { User } from "./types/User"
import { NDKEvent } from "@nostr-dev-kit/ndk-mobile";
import NostrPairKey from "../nostr/pairkey/NostrPairKey";

export type SearchUserProps = {
    searchTerm: string; skip?: number; take?: number;
}
export type UpdateProfileProps = {
    user: User, setUser?: (user: User) => void; upNostr?: boolean;
}
export type ListFollowsProps = {
    follows?: NDKEvent; iNot?: boolean;
}

export interface IUserService {
    getProfile(): Promise<User>;
    publishProfile(): Promise<void>;
    fetchProfile(pubkey: string): Promise<void>;
    getUser(pubkey: string): Promise<User>;
    updateProfile(props: UpdateProfileProps): Promise<void>;
    getFollowsEvent(): Promise<NDKEvent>;
    listFollows(props: ListFollowsProps): Promise<User[]>;
    updateFollows(follows: NDKEvent) : Promise<void>;
    createFollows(friends: [string[]]) : NDKEvent;
    lastNotes(limit: number) : Promise<NDKEvent[]>;
    save(): Promise<void>;

    listUsers(pubkeys: string[]): Promise<User[]>;
    searchUser(props: SearchUserProps): Promise<User[]>;

    getNostrPairKey(): Promise<NostrPairKey>;
}
