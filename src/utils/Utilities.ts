import { NDKEvent } from "@nostr-dev-kit/ndk-mobile";
import { ChatUser } from "../services/zustand/useChatStore";
import { User } from "../services/user/types/User";
import { useTranslate } from "../services/translate/TranslateService";
import { pushMessage } from "../services/notification";
import Clipboard from "@react-native-clipboard/clipboard";
import { Formatter } from "../services/converter/Formatter";
import { BNetwork } from "bitcoin-tx-lib";
import theme from "../theme";

export class Utilities
{
    public static pubkeyFromTags(event: NDKEvent): string[]
    {
        return event.tags.filter(t => t[0] == "p").map(t => t[1])
    }

    public static orderEvents(events: NDKEvent[]): NDKEvent[] 
    {
        return events.sort((a, b) => {
            return (b.created_at ?? 1) - (a.created_at ?? 1)
        })
    }

    public static orderChats(chats: ChatUser[]): ChatUser[] 
    {
        return chats.sort((a, b) => 
            (b.lastMessage.created_at ?? 1) - (a.lastMessage.created_at ?? 1)
        )
    }

    public static getUserName(user: User, maxsize: number = 16): string 
    {
        const username = user.display_name ?? user.displayName ?? user.name ?? user.pubkey ?? ""
        if(username.length > maxsize)
            return `${username?.substring(0,maxsize)}...` 
        return username
    }

    public static copyToClipboard(text: string) 
    {
        Clipboard.setString(text)
        useTranslate("message.copied")
            .then(pushMessage)
    }

    public static getClipedContent(content: string, limit: number=50): string 
    {
        if(content.length > limit)
            return `${content.substring(0,limit)}...`
        return content
    }

    public static shortenString(value: string, size: number): string 
    {
        let length = Math.ceil(size / 2);
        return `${value.substring(0, length)}...${value.slice(-length)}`
    }

    public static copyPubkey(pubkey: string)
    {
        const npub = Formatter.pubkeyToNpub(pubkey)
        this.copyToClipboard(npub)
    }

    public static getDisplayPubkey(pubkey: string, maxSize: number = 20)
    {
        const npub = Formatter.pubkeyToNpub(pubkey)
        return this.shortenString(npub, maxSize)
    }

    public static replaceContentEvent(content: string): string
    {
        return content.replaceAll("nostr:", "")
            .replaceAll(" note", " \nnote")
            .replaceAll(" nevent", " \nnevent")
            .replaceAll("\n\nhttps", "\nhttps")
            .replaceAll("\n\nhttps", "\nhttps")
            .replaceAll("\nhttps", "\n\nhttps")
            .replaceAll("\nhttps", "\n\nhttps")
            .replaceAll(" https", " \n\nhttps")
            .replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, "$1\n\n$2")
            //.replaceAll(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1\n\n$2")
    }

    public static async getDescriptionTypeWallet(type: BNetwork): Promise<string>
    {
        switch(type)
        {
            case "testnet":
                return await useTranslate("wallet.network.testnet.title")
            case "mainnet":
                return await useTranslate("wallet.network.mainnet.title")
            default:
                return await useTranslate("wallet.network.mainnet.title")
        }
    }

    public static extractVideoUrl(content: string) 
    {
        const videoRegex = /(https?:\/\/[^\s]+?\.(mp4|webm|mov|mkv|avi|flv|ogg))/i;
        const match = content.match(videoRegex);
        return match ? match[0] : null;
    }

    public static getColorFromPubkey(pubkey: string): string 
    {
        if (!pubkey) return theme.colors.green; 
        let hash = 0;
        for (let i = 0; i < pubkey.length; i++) {
            hash = pubkey.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = `#${((hash >> 24) & 0xFF).toString(16).padStart(2, "0")}` +
                      `${((hash >> 16) & 0xFF).toString(16).padStart(2, "0")}` +
                      `${((hash >> 8) & 0xFF).toString(16).padStart(2, "0")}`;
        return color;
    }

    public static distinctBy<T>(keySelector: (item: T) => string | number): (items: T[]) => T[] 
    {
        return (items: T[]) => {
            const seen = new Set<string | number>()
            return items.filter(item => {
                const key = keySelector(item)
                if (seen.has(key)) return false
                seen.add(key)
                return true
            })
        }
    }
}
