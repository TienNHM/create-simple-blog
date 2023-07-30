const { execSync } = require('child_process');
/**
 * Run a command in a child process.
 *
 * @param {string} command - The command to run
 * @return {boolean} - Whether the command was successful or not. true if successful, false if not.
 */
const runCommand = (command) => {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Failed to execute ${command}`, error);
        return false;
    }
    return true;
};

module.exports = runCommand;