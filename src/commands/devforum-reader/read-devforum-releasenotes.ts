// Define imports
import ReadDevforumCommand from "./read-devforum-command";

// Export class
export default class ReadDevforumReleaseNotesCommand extends ReadDevforumCommand {

    name: string = "devforum_release_notes";
    displayName: string = "Devforum release notes"
    categoryId: number = 62;
    maxDescriptionLength: number = 250;

};