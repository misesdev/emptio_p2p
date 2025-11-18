import { RelayStorage } from "@storage/relays/RelayStorage";
import { IRelayService, SearchRelayProps } from "./IRelayService";
import { NostrRelay } from "./types/NostrRelay";
import axios from "axios";
import { trackException } from "../telemetry";

class RelaysService implements IRelayService
{
    private readonly _storage: RelayStorage;
    constructor(
        storage: RelayStorage = new RelayStorage()
    ) {
        this._storage = storage
    }

    public async add(url: string): Promise<void>
    {
        await this._storage.add({ url })
    }

    public async list(): Promise<NostrRelay[]>
    {
        return await this._storage.listEntities()
    }
    
    public async update(relay: NostrRelay): Promise<void> 
    {
        const relays = await this._storage.list()
        for(let stored of relays) {
            if(stored.entity.url == relay.url) {
                await this._storage.update(stored.id, relay)
            }
        }
    }

    public async delete(relayUrl: string): Promise<void> 
    {
        const relays = await this._storage.list()
        for(let stored of relays) {
            if(stored.entity.url == relayUrl) {
                await this._storage.delete(stored.id)
            }
        }
    }

    public async search({ term, skip=0, take=50 }: SearchRelayProps): Promise<NostrRelay[]>
    {
        try
        {
            const httpClient = axios.create({ baseURL: process.env.NOSTRWIKI_API_URL })
            const response = await httpClient.get(`/search/relays?term=${term.trim()}&skip=${skip}&take=${take}`)
            console.log(response.data)
            if(response.status != 200) 
                throw new Error("an unexpected error occurred during the request")
            return response.data as NostrRelay[]
        }
        catch(ex) { 
            trackException(ex)
            return [] 
        }
    }
}

export default RelaysService
