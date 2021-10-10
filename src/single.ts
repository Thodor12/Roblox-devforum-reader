// Define imports
import Executor from "./executor";

// Setup the executor
const executor = new Executor();

// Run the commands a single time
(async () => {
    try {
        await executor.runAllCommands(new Date().getTime().toString());;
    } catch (ex) {
        console.error(ex);
    }
})();