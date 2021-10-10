// Define imports
import ReadDevforumCommand from "./read-devforum-command";

// Export class
export default class ReadDevforumAnnouncementsCommand extends ReadDevforumCommand {

    name: string = "devforum_announcements";
    displayName: string = "Devforum announcements";
    categoryId: number = 55;
    maxDescriptionLength: number = 250;

};