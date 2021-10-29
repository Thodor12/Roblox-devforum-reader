// Define imports
import axios from "axios";
import moment from "moment";
import HtmlSanitizer from "./html-sanitizer";

// Export interfaces
export interface BlogPost {
    name: string;
    description: string;
    postedAt: moment.Moment;
    image?: string;
    href: string;
};

// Export class
export default class BlogApiReader {

    private readonly baseUrl: string = "https://blog.roblox.com";

    /**
     * Creates a new blog api reader
     */
    constructor() { }

    /**
     * Fetch all of the blog posts inside of a certain category.
     * @param categoryId The category ID you are trying to read the data from.
     * @param since A moment.js date object used to check which topics to get.
     */
    async getBlogPostsInCategory(categoryId: number, since: moment.Moment): Promise<Array<BlogPost>> {
        let result = await axios.get(new URL(`/wp-json/wp/v2/posts?categories=${categoryId}`, this.baseUrl).href);
        let arr: Array<BlogPost> = [];

        for (const post of result.data) {
            let datePosted = moment(post.date_gmt, moment.ISO_8601);
            if (since === null || datePosted.isAfter(since)) {
                // Fetch media info
                let mediaLink: string | undefined = undefined;
                try {
                    let mediaSection = post._links["wp:featuredmedia"].shift();
                    if (mediaSection != null) {
                        let result = await axios.get(mediaSection.href);
                        mediaLink = result.data.guid.rendered as string;
                    }
                } catch {
                    // Caught a problem when fetching the media url, no problem as we don't NEED an image per sé
                }
                arr.push(this.createBlogPost(post, mediaLink));
            }
        }

        return arr;
    }

    /**
     * Turns an untyped axios topic into a BlogPost object
     * @param post The untyped post object
     * @param imageLink The header image (if any)
     */
    private createBlogPost(post: any, imageLink?: string): BlogPost {
        return {
            name: post.title.rendered,
            description: HtmlSanitizer.Sanitize(post.excerpt.rendered),
            postedAt: moment.utc(post.date_gmt),
            image: imageLink,
            href: post.link
        };
    }

};