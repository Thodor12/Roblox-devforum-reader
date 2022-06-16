// Define imports
import moment from "moment";
import Logger from "../../util/logger";
import Command from "../command";
import DiscourseApiReader, { Category, Topic } from "../../util/discourse-api-reader";
import DiscordWebhookPoster, { Embed } from "../../util/discord-webhook-poster";
import { ExecutionStatus } from "../../executor";

// Export class
export default abstract class ReadDevforumCommand implements Command {

    abstract name: string;
    abstract displayName: string;
    abstract categoryId: number;
    abstract maxDescriptionLength: number;

    private reader: DiscourseApiReader;
    private poster: DiscordWebhookPoster;
    private lastRunTime: moment.Moment = moment.utc();

    private category: Category | null = null;

    requiredCommands: Array<string> = [];

    constructor() {
        this.reader = new DiscourseApiReader("https://devforum.roblox.com/");
        this.poster = new DiscordWebhookPoster(process.env.DISCORD_WEBHOOKS?.split(",") ?? []);
        this.requiredCommands.push("devforum_uptime");
    }

    async onLoad(): Promise<void> { }

    async execute(logger: Logger): Promise<ExecutionStatus> {
        // Load the category info if not yet set
        if (this.category === null) {
            this.category = await this.reader.getCategory(this.categoryId);
        }

        logger.info(`Looking for topics posted after ${this.lastRunTime}.`);

        let topics = await this.reader.getTopicsInCategory(this.categoryId, this.lastRunTime);

        logger.info(`Found ${topics.length} new topics.`);

        topics = topics.filter(topic => {
            let isAfter = topic.postedAt.isAfter(this.lastRunTime);
            if (isAfter) {
                this.lastRunTime = topic.postedAt;
            }
            return isAfter;
        });

        this.poster.postEmbeds(this.getEmbedsFromTopics(this.category, topics, this.maxDescriptionLength), {
            name: "Devforum updates"
        });

        return ExecutionStatus.Success;
    }

    private getEmbedsFromTopics(category: Category, topics: Array<Topic>, descriptionLength: number): Array<Embed> {
        let embeds: Array<Embed> = [];
        topics.forEach(topic => {
            embeds.push({
                title: topic.name,
                description: topic.description?.substring(0, descriptionLength - 3) + "...",
                timestamp: topic.postedAt.toISOString(),
                url: topic.href,
                color: parseInt(category.color, 16),
                author: {
                    name: topic.postedBy,
                    icon_url: topic.postedByAvatar
                },
                image: {
                    url: topic.image
                }
            })
        });

        return embeds;
    }
};
