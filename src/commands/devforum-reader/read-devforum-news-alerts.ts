// Define imports
import ReadDevforumCommand from "./read-devforum-command";

// Export class
export default class ReadDevforumNewsAndAlertsCommand extends ReadDevforumCommand {

    name: string = "devforum_news_alerts";
    displayName: string = "Devforum news & alerts";
    categoryId: number = 193;
    maxDescriptionLength: number = 250;

};