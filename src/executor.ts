// Define imports
import Command from "./commands/command";
import Logger from "./util/logger";

// Import commands
import RobloxUptimeCommand from "./commands/uptime/roblox-uptime";
import BlogUptimeCommand from "./commands/uptime/blog-uptime";
import DevforumUptimeCommand from "./commands/uptime/devforum-uptime";
import StatusPageMonitorCommand from "./commands/uptime/status-page-monitor";
import ReadDevforumAnnouncementsCommand from "./commands/devforum-reader/read-devforum-announcements";
import ReadDevforumReleaseNotesCommand from "./commands/devforum-reader/read-devforum-releasenotes";
import ReadDevforumNewsAndAlertsCommand from "./commands/devforum-reader/read-devforum-news-alerts";
import BlogReaderProductTechCommand from "./commands/blog-reader/blog-reader-product-tech-command";

// Command status enum
export enum ExecutionStatus {
    Skipped,
    Success,
    Failed
};

// Status breakdown class
class StatusBreakdown {
    completedTasks: number = 0;
    failedTasks: number = 0;
    skippedTasks: number = 0;
};

// Export class
export default class Executor {

    private commands: Array<Command> = [];
    private logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    async loadCommands() {
        this.commands.push(new RobloxUptimeCommand());
        this.commands.push(new BlogUptimeCommand());
        this.commands.push(new DevforumUptimeCommand());
        this.commands.push(new StatusPageMonitorCommand());
        this.commands.push(new BlogReaderProductTechCommand());
        this.commands.push(new ReadDevforumAnnouncementsCommand());
        this.commands.push(new ReadDevforumReleaseNotesCommand());
        this.commands.push(new ReadDevforumNewsAndAlertsCommand());

        this.commands.sort((a, b) => {
            let aRequiresB = a.requiredCommands?.some(c => c == b.name) ?? false;
            let bRequiresA = b.requiredCommands?.some(c => c == a.name) ?? false;
            return aRequiresB ? 1 : bRequiresA ? -1 : 0;
        });

        this.commands.forEach((cmd) => {
            cmd.onLoad(this.logger);
        });
    }

    async runAllCommands(identifier: string): Promise<void> {
        this.logger.info(`Running all tasks. Run identifier: ${identifier}`);
        this.logger.info("");

        let statusses: Map<string, ExecutionStatus> = new Map<string, ExecutionStatus>();

        for (const command of this.commands) {
            // Check if a pre-required task has failed
            let allCompleted = command.requiredCommands?.every(name => statusses.get(name) == ExecutionStatus.Success) ?? true;
            if (!allCompleted) {
                let firstFailed = command.requiredCommands.find(name => statusses.get(name) != ExecutionStatus.Success);
                this.logger.info(`Skipping task: ${command.displayName}. Required task failed: ${firstFailed}.`);
                statusses.set(command.name, ExecutionStatus.Skipped);
                continue;
            }

            this.logger.info(`Running task: ${command.displayName}`);

            try {
                let status = await command.execute(new Logger(`${command.displayName} (id: ${identifier})`));
                statusses.set(command.name, status);
            } catch (ex: any) {
                this.logger.error(ex);
                statusses.set(command.name, ExecutionStatus.Failed);
            }

            this.logger.plain("");
        }

        let breakdown = this.getStatusBreakdown(statusses);
        this.logger.info(`Results; Completed: ${breakdown.completedTasks}. Failed: ${breakdown.failedTasks}. Skipped: ${breakdown.skippedTasks}`);
    }

    private getStatusBreakdown(statusses: Map<string, ExecutionStatus>): StatusBreakdown {
        let breakdown = new StatusBreakdown();
        statusses.forEach(value => {
            switch (value) {
                case ExecutionStatus.Success:
                    breakdown.completedTasks++;
                    break;
                case ExecutionStatus.Failed:
                    breakdown.failedTasks++;
                    break;
                case ExecutionStatus.Skipped:
                    breakdown.skippedTasks++;
                    break;
            }
        });
        return breakdown;
    }
};