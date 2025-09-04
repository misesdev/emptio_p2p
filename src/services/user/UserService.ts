import { EventKinds } from "@/src/constants/Events";
import NoteService from "../nostr/note/NoteService";
import { IUserService, ListFollowsProps, SearchUserProps,
    UpdateProfileProps } from "./IUserService";
import NDK, { NDKEvent } from "@nostr-dev-kit/ndk-mobile";
import { UserStorage } from "@storage/user/UserStorage";
import { User } from "./types/User";
import useNDKStore from "../zustand/useNDKStore";
import { TimeSeconds } from "../converter/TimeSeconds";
import { Utilities } from "@src/utils/Utilities";
import { AppSettingsStorage } from "@storage/settings/AppSettingsStorage";
import { AppSettings } from "@storage/settings/types";
import { PrivateKeyStorage } from "@storage/pairkeys/PrivateKeyStorage";
import NostrPairKey from "../nostr/pairkey/NostrPairKey";
import { useTranslate } from "../translate/TranslateService";
import { trackException } from "../telemetry";
import axios from "axios"

class UserService implements IUserService
{
    private readonly _ndk: NDK;
    private _profile: User|null = null;
    private readonly _note: NoteService;
    private readonly _storage: UserStorage;
    private readonly _settings: AppSettingsStorage;
    private readonly _keyStorage: PrivateKeyStorage;
        
    constructor(
        user: User|null = null,
        ndk: NDK = useNDKStore.getState().ndk,
        storage: UserStorage = new UserStorage(),
        note: NoteService|null = null,
        settings: AppSettingsStorage = new AppSettingsStorage(),
        keyStorage: PrivateKeyStorage = new PrivateKeyStorage()
    ) {
        this._note = note ?? new NoteService()
        this._storage = storage 
        this._profile = user
        this._ndk = ndk
        this._settings = settings
        this._keyStorage = keyStorage
    }

    public async init(profile?: User): Promise<void> 
    {
        const user = profile ?? await this._storage.get();
        if (!user?.pubkey) 
            throw new Error("User not found or missing pubkey");
        this._profile = user;
    }

    public async fetchProfile(pubkey: string): Promise<void> 
    {
        const event = await this._note.getNote({
            authors: [pubkey], 
            kinds: [EventKinds.metadata], 
            limit: 1 
        })
        if(!event) throw new Error("profile event not found")
        this._profile = {
            pubkey: event.pubkey,
            ...JSON.parse(event.content)
        } as User
    }

    public async getProfile(): Promise<User> 
    {
        if (!this._profile) throw new Error("UserService not initialized");
        return this._profile
    }

    public async getUser(pubkey: string): Promise<User>
    {
        const event = await this._note.getNote({
            authors: [pubkey], 
            kinds: [EventKinds.metadata], 
            limit: 1 
        })
        if(!event) throw new Error("profile event not found")
        return {
            pubkey: event.pubkey,
            ...JSON.parse(event.content)
        } as User
    }

    public async updateProfile({ user, setUser, upNostr }: UpdateProfileProps): Promise<void> 
    {
        if (!this._profile)
            throw new Error("UserService not initialized");
        this._profile = { ...this._profile, ...user }
        if(upNostr) await this.publishProfile()
        await this._storage.set(this._profile)
        if (setUser) setUser(this._profile)
    }

    public async publishProfile(): Promise<void> 
    {
        if (!this._profile?.pubkey) 
            throw new Error("UserService not initialized");

        const profile: User = {
            name: this._profile.name,
            pubkey: this._profile.pubkey,
            displayName: Utilities.getUserName(this._profile, 100),
            display_name: Utilities.getUserName(this._profile, 100),
            picture: this._profile.picture,
            image: this._profile.image,
            about: this._profile.about,
            bio: this._profile.bio,
            nip05: this._profile.nip05,
            lud06: this._profile.lud06,
            lud16: this._profile.lud16,
            banner: this._profile.banner,
            zapService: this._profile.zapService,
            website: this._profile.website,
            keyRef: ""
        }
        const note = new NDKEvent(this._ndk, {
            kind: EventKinds.metadata,
            pubkey: this._profile.pubkey as string,
            content: JSON.stringify(profile),
            created_at: TimeSeconds.now(),
            tags: []
        })

        await note.publishReplaceable()
    }
    
    public async getFollowsEvent(): Promise<NDKEvent>
    {
        if (!this._profile?.pubkey)
            throw new Error("UserService not initialized");
        const event = await this._note.getNote({
            kinds:[EventKinds.followList], 
            authors: [this._profile.pubkey], 
            limit: 1
        })
        return event as NDKEvent 
    }

    public async listFollows({ follows, iNot=true }: ListFollowsProps): Promise<User[]> 
    {
        if (!this._profile?.pubkey) 
            throw new Error("UserService not initialized");
        const authors = follows?.tags?.filter(t => t[0] == "p").map(t => t[1])
        const events = await this._note.listNotes({ authors, kinds: [0], limit: authors?.length })
        let friends = Array.from(events??[])
            .filter((u: NDKEvent) => u.pubkey != this._profile?.pubkey)
            .map((event: NDKEvent): User => {
                const follow = JSON.parse(event.content) as User
                follow.pubkey = event.pubkey
                return follow
            })
        return iNot ? friends.filter(f => f.pubkey != this._profile?.pubkey)
            : friends
    }

    public async updateFollows(follows: NDKEvent): Promise<void> 
    {
        await follows.publishReplaceable()
    }

    public createFollows(friends: [string[]]): NDKEvent 
    {
        if (!this._profile?.pubkey)
            throw new Error("UserService not initialized");
        return new NDKEvent(this._ndk, {
            kind: EventKinds.followList,
            pubkey: this._profile.pubkey,
            content: JSON.stringify(this._ndk.explicitRelayUrls),
            created_at: TimeSeconds.now(),
            tags: friends
        }) 
    }

    public async lastNotes(limit: number = 3): Promise<NDKEvent[]> 
    {
        if (!this._profile?.pubkey) 
            throw new Error("UserService not initialized");
        const notes = await this._note.listNotes({
            kinds: [1],
            authors: [this._profile.pubkey as string],
            limit
        })
        return notes.filter(e => !e.tags.filter(t => t[0] == "e").length)
    }

    public async listUsers(authors: string[]): Promise<User[]> 
    {
        const notes = await this._note.listNotes({
            kinds: [1], authors, limit: authors.length
        })
        if(notes) {
            return notes.map(event => {
                const user = {
                    ...JSON.parse(event.content) as User,
                    pubkey: event.pubkey
                }
                return user
            })
        }
        return []
    }

    public async searchUser({ searchTerm, limit }: SearchUserProps): Promise<User[]> 
    {
        try 
        {
            let defaultPubkey = process.env.DEFAULT_PUBKEY
           
            const httpClient = axios.create({
                baseURL: process.env.NOSBOOK_API_URL,
                headers: { 'Content-Type': 'application/json' }
            })

            const response = await httpClient.post("/search", {
                pubkey: this._profile?.pubkey ?? defaultPubkey,
                searchTerm,
                limit
            })

            if(response.status != 200) 
                throw new Error(await useTranslate("message.request.error"))
            
            return response.data.filter((u: any) => u.pubkey != this._profile?.pubkey)
                .sort((a:any, b:any) => (b.similarity ?? 1) - (a.similarity ?? 1))
                .map((user: any) => {
                    return {
                        name: user.name,
                        pubkey: user.pubkey,
                        picture: user.profile,
                        display_name: user.displayName
                    }
                })
        }
        catch(ex) {
            trackException(ex)
            return [] 
        }
    }

    public async setSettings(settings: AppSettings): Promise<void>
    {
        await this._settings.set(settings)
    }

    public async getNostrPairKey(): Promise<NostrPairKey>
    {
        if (!this._profile?.pubkey) 
            throw new Error("UserService not initialized");
        const stored = await this._keyStorage.get(this._profile?.keyRef)
        return new NostrPairKey(stored.entity)
    }

    public async save(): Promise<void> 
    {
        if (!this._profile?.pubkey) 
            throw new Error("UserService not initialized");
        await this._storage.set(this._profile)
        await this.publishProfile()
    }
}

export default UserService
