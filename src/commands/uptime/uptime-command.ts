// Define imports
import axios, { AxiosResponse } from "axios";
import moment from "moment";
import { ExecutionStatus } from "../../executor";
import DiscordWebhookPoster from "../../util/discord-webhook-poster";
import Logger from "../../util/logger";
import Command from "../command";

// Export class
export default abstract class UptimeCommand implements Command {

    static readonly GREEN_STATUS_CODE: number = 65280;
    static readonly RED_STATUS_CODE: number = 16711680;

    abstract name: string;
    abstract displayName: string;
    requiredCommands: string[] = [];

    abstract monitorName: string;
    abstract monitorUrl: string;
    private isOnline: boolean;
    private timeoutMillis: number = 5000;

    private poster: DiscordWebhookPoster;

    constructor() {
        this.poster = new DiscordWebhookPoster(process.env.DISCORD_WEBHOOKS?.split(",") ?? []);
    }

    async onLoad(logger: Logger): Promise<void> {
        this.isOnline = this.checkOnline(await this.getStatus(logger));
    }

    async execute(logger: Logger): Promise<ExecutionStatus> {
        const statusCode = await this.getStatus(logger);
        const status = this.checkOnline(statusCode) ? ExecutionStatus.Success : ExecutionStatus.Failed;

        if ((status === ExecutionStatus.Failed && this.isOnline === true) ||
            status === ExecutionStatus.Success && this.isOnline === false) {
            // Reported status is failed, but we are currently online, report down
            // OR
            // Reported status is success, but we are currently down, report up
            this.sendUptimeMessage(!this.isOnline, statusCode);
        }

        this.isOnline = status === ExecutionStatus.Success;
        return status;
    }

    private async getStatus(logger: Logger): Promise<number> {
        let response: AxiosResponse<any>;
        try {
            response = await axios.head(this.monitorUrl, { timeout: this.timeoutMillis, validateStatus: () => true });
        } catch (ex) {
            logger.warning(ex);
            return 503;
        }
        return response.status;
    }

    private checkOnline(statusCode: number): boolean {
        return statusCode >= 200 && statusCode < 400;
    }

    private sendUptimeMessage(isOnline: boolean, statusCode: number) {
        this.poster.postEmbeds([{
            title: this.monitorName,
            url: this.monitorUrl,
            fields: [
                {
                    name: "Status",
                    value: isOnline ? "UP" : "DOWN"
                },
                {
                    name: "Response code",
                    value: statusCode.toString()
                }
            ],
            timestamp: moment().toISOString(),
            color: isOnline ? UptimeCommand.GREEN_STATUS_CODE : UptimeCommand.RED_STATUS_CODE
        }], {
            name: this.monitorName
        });
    }

}