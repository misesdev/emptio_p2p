import { User } from "../../user/types/User";

export type NostrRelay = {
    url: string;
    name?: string;
    contact?: string;
    description?: string;
    supported_nips?: Array<string>;
    software?: string;
    version?: string;
    pubkey?: string;
    author?: User;
}
