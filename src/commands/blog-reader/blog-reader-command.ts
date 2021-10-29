// Define imports
import moment from "moment";
import Logger from "../../util/logger";
import Command from "../command";
import DiscordWebhookPoster, { Embed } from "../../util/discord-webhook-poster";
import { ExecutionStatus } from "../../executor";
import BlogApiReader, { BlogPost } from "../../util/blog-api-reader";

// Export class
export default abstract class ReadBlogCommand implements Command {

    abstract name: string;
    abstract displayName: string;
    abstract categoryId: number;
    abstract hexColor: string;

    requiredCommands: Array<string> = [];

    private poster: DiscordWebhookPoster;
    private reader: BlogApiReader;
    private lastRunTime: moment.Moment = moment.utc();

    constructor() {
        this.poster = new DiscordWebhookPoster(process.env.DISCORD_WEBHOOKS?.split(",") ?? []);
        this.reader = new BlogApiReader();
        this.requiredCommands.push("blog_uptime");
    }

    async onLoad(): Promise<void> { }

    async execute(logger: Logger): Promise<ExecutionStatus> {
        logger.info(`Looking for blog posts posted after ${this.lastRunTime}.`);

        let posts = await this.reader.getBlogPostsInCategory(this.categoryId, this.lastRunTime);

        logger.info(`Found ${posts.length} new blog posts.`);

        posts = posts.filter(post => {
            let isAfter = post.postedAt.isAfter(this.lastRunTime);
            if (isAfter) {
                this.lastRunTime = post.postedAt;
            }
            return isAfter;
        });

        this.poster.postEmbeds(this.getEmbedsFromPosts(posts), {
            name: "Blog posts"
        });

        return ExecutionStatus.Success;
    }

    private getEmbedsFromPosts(posts: Array<BlogPost>): Array<Embed> {
        let embeds: Array<Embed> = [];
        posts.forEach(post => {
            embeds.push({
                title: post.name,
                description: post.description,
                timestamp: post.postedAt.toISOString(),
                url: post.href,
                color: parseInt(this.hexColor, 16),
                image: {
                    url: post.image
                }
            })
        });

        return embeds;
    }
};