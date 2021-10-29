// Define imports
import { ExecutionStatus } from "../executor";
import Logger from "../util/logger";

// Export class
export default interface Command {

    name: string;
    displayName: string;
    requiredCommands: Array<string>;

    onLoad(logger: Logger): Promise<void>;
    execute(logger: Logger): Promise<ExecutionStatus>;

};