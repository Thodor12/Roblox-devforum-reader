// Define imports
import { schedule } from "node-cron";
import Executor from "./executor";

// Setup the executor
const executor = new Executor();

// Start the scheduler
schedule("* * * * *", async () => {
    await executor.runAllCommands(new Date().getTime().toString());
});