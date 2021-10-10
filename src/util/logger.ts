// Define imports
import NodeLogger from "node-color-log";

// Define constants
const InfoColor = "white";
const WarningColor = "yellow";
const ErrorColor = "red";

// Export class
export default class Logger {

    private defaultIdentifier: string;

    constructor(identifier: string = null) {
        this.defaultIdentifier = identifier;

        NodeLogger.setLevel("error");
    }

    private formatMessage(message: string, identifier: string): string {
        let id = identifier !== null ? identifier : this.defaultIdentifier;
        let msg = message.length > 0 ? message.trim() : message;
        return id == null ? msg : `${id.trim()} - ${msg}`;
    }

    plain(message: string, identifier: string = null) {
        NodeLogger.color(InfoColor).log(this.formatMessage(message, identifier));
    }

    info(message: string, identifier: string = null) {
        NodeLogger.color(InfoColor).log("INFO: " + this.formatMessage(message, identifier));
    }

    warning(message: string, identifier: string = null) {
        NodeLogger.color(WarningColor).bold().log("WARNING: " + this.formatMessage(message, identifier));
    }

    error(message: string, identifier: string = null) {
        NodeLogger.color(ErrorColor).bold().log("ERROR: " + this.formatMessage(message, identifier));
    }
};