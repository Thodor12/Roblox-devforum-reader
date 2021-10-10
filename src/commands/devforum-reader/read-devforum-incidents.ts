// Define imports
import ReadDevforumCommand from "./read-devforum-command";

// Export class
export default class ReadDevforumIncidentsCommand extends ReadDevforumCommand {

    name: string = "devforum_developer_incidents";
    displayName: string = "Devforum developer incidents";
    categoryId: number = 89;
    maxDescriptionLength: number = 250;

};