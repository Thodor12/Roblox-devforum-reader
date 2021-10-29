// Define imports
import Executor from "./executor";

// Setup the executor
const executor = new Executor();

// Run the commands a single time
executor.loadCommands().then(() => {
    executor.runAllCommands(new Date().getTime().toString());;
});