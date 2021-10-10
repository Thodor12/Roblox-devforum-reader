// Define imports
import UptimeCommand from "./uptime-command";

// Export class
export default class BlogUptimeCommand extends UptimeCommand {

    name: string = "blog_uptime";
    displayName: string = "Blog uptime";
    monitorName: string = "Blog uptime monitor";
    monitorUrl: string = "https://blog.roblox.com/";

};