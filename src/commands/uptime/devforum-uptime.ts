// Define imports
import UptimeCommand from "./uptime-command";

// Export class
export default class DevforumUptimeCommand extends UptimeCommand {

    name: string = "devforum_uptime";
    displayName: string = "Devforum uptime";
    monitorName: string = "Devforum uptime monitor";
    monitorUrl: string = "https://devforum.roblox.com/srv/status";

};
