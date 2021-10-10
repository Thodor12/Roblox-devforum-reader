// Define imports
import axios, { AxiosResponse } from "axios";
import { ExecutionStatus } from "../../executor";
import DiscordWebhookPoster from "../../util/discord-webhook-poster";
import logger from "../../util/logger";
import Command from "../command";

// Export class
export default abstract class UptimeCommand implements Command {

    static readonly GREEN_STATUS_CODE: number = 65280;
    static readonly RED_STATUS_CODE: number = 16711680;

    abstract name: string;
    abstract displayName: string;
    requiredCommands?: string[];

    abstract monitorName: string;
    abstract monitorUrl: string;
    private isOnline: boolean;
    private timeoutMillis: number = 5000;

    private poster: DiscordWebhookPoster;

    public UptimeCommand() {
        this.poster = new DiscordWebhookPoster(process.env.DISCORD_WEBHOOKS.split(","));
    }

    async execute(logger: logger): Promise<ExecutionStatus> {
        let response: AxiosResponse<any>;
        try {
            response = await axios.head(this.monitorUrl, { timeout: this.timeoutMillis, validateStatus: () => true });
        } catch (ex) {
            logger.warning(ex);
        }

        let status = response.status >= 200 && response.status < 300 ? ExecutionStatus.Success : ExecutionStatus.Failed;

        if ((status === ExecutionStatus.Failed && this.isOnline === true) ||
            status === ExecutionStatus.Success && this.isOnline === false) {
            // Reported status is failed, but we are currently online, report down
            // OR
            // Reported status is success, but we are currently down, report up
            this.sendUptimeMessage(!this.isOnline, "HTTP " + response.status + " - " + response.statusText);
        }

        this.isOnline = status == ExecutionStatus.Success;
        return status;
    }

    private sendUptimeMessage(isOnline: boolean, statusCode: string) {
        this.poster.postEmbeds([{
            title: `Monitor is ${isOnline ? "UP" : "DOWN"}`,
            description: statusCode,
            color: isOnline ? UptimeCommand.GREEN_STATUS_CODE : UptimeCommand.RED_STATUS_CODE
        }], {
            name: this.monitorName
        });
    }

}