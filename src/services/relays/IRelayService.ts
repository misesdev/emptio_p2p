import { NostrRelay } from "./types/NostrRelay";

export type SearchRelayProps = {
    term: string;
    skip?: number;
    take?: number;
}

export interface IRelayService
{
    list(): Promise<NostrRelay[]>;
    add(relayUrl: string): Promise<void>;
    update(relay: NostrRelay): Promise<void>;
    delete(relayUrl: string): Promise<void>;
    search(props: SearchRelayProps): Promise<NostrRelay[]>;
}
