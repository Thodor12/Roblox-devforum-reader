// Define imports
import axios from "axios";
import moment from "moment";
import HtmlSanitizer from "./html-sanitizer";

// Export interfaces
export interface Category {
    id: number;
    slug: string;
    name: string;
    color: string;
}

export interface Topic {
    name: string;
    description: string;
    postedBy: string;
    postedByAvatar: string;
    postedAt: moment.Moment;
    image: string;
    href: string;
};

// Export class
export default class DiscourseApiReader {

    private baseUrl: string;

    /**
     * Creates a new discourse api reader
     * @param baseUrl The base url of the website
     */
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Get all information of a specific category
     * @param categoryId 
     */
    async getCategory(categoryId: number): Promise<Category> {
        let result = await axios.get(new URL(`/c/${categoryId}/show.json`, this.baseUrl).href);
        let data = result.data.category;

        return {
            id: categoryId,
            slug: data.slug,
            name: data.name,
            color: data.color
        };
    }

    /**
     * Fetch all of the topics inside of a certain category. Requires the json url slug of the Discourse website.
     * @param categoryId The category ID you are trying to read the data from.
     * @param since A moment.js date object used to check which topics to get.
     */
    async getTopicsInCategory(categoryId: number, since: moment.Moment): Promise<Array<Topic>> {
        let result = await axios.get(new URL(`/c/${categoryId}.json`, this.baseUrl).href);
        let arr: Array<Topic> = [];

        for (const topic of result.data.topic_list.topics) {
            let datePosted = moment(topic.created_at, moment.ISO_8601);
            if (since === null || datePosted.isAfter(since)) {
                let topicInfo = await axios.get(new URL(`/t/${topic.id}.json`, this.baseUrl).href);
                let firstPost = topicInfo.data.post_stream.posts[0];
                arr.push(this.createTopic(topic, firstPost));
            }
        }

        return arr;
    }

    /**
     * Turns an untyped axios topic into a Topic object
     * @param topic The untyped topic object
     */
    private createTopic(topic: any, post: any): Topic {
        return {
            name: topic.fancy_title,
            description: HtmlSanitizer.Sanitize(post.cooked),
            postedBy: post.username,
            postedByAvatar: new URL(post.avatar_template.replace("{size}", "64"), this.baseUrl).href,
            postedAt: moment.utc(topic.created_at),
            image: topic.image_url,
            href: new URL(`/t/${topic.id}`, this.baseUrl).href
        };
    }

};