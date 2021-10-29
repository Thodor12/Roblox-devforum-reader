// Define imports
import axios from "axios";

const DISCORD_WEBHOOK_EMBED_LIMIT = 10;

// Create the embed interface
export interface Embed {
    title: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    author?: {
        name?: string;
        icon_url?: string;
    };
    image?: {
        url?: string;
    };
    fields?: Array<EmbedField>;
}

export interface EmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

export interface Options {
    name: string;
    avatar?: string;
}

// Export class
export default class DiscordWebhookPoster {

    private urls: Array<string>;

    constructor(urls: string | Array<string>) {
        if (typeof (urls) == "string") {
            this.urls = [urls];
        } else {
            this.urls = urls;
        }
        this.urls = this.urls.filter(f => f.startsWith("http://") || f.startsWith("https://"))
    }

    async postEmbeds(embeds: Array<Embed>, options?: Options) {
        let chunks = this.chunkEmbeds(embeds, DISCORD_WEBHOOK_EMBED_LIMIT);

        for (const url of this.urls) {
            for (const chunk of chunks) {
                await axios.post(url, {
                    username: options?.name,
                    avatar_url: options?.avatar,
                    embeds: chunk
                });
            }
        }
    }

    /**
     * Returns an array with arrays of the given size.
     *
     * @param embeds Array of embeds to split
     * @param chunkSize {Integer} Size of every group
     */
    private chunkEmbeds(embeds: Array<Embed>, chunkSize: number): Array<Array<Embed>> {
        var result = [];
        for (let idx = 0; idx < embeds.length; idx += chunkSize) {
            result.push(embeds.slice(idx, idx + chunkSize));
        }
        return result;
    }

}