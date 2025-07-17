import fs from 'fs'

const logError = (error) => {

    const date = new Date().toISOString().split('T')[0];
    const logFilePath = `./logs/error-${date}.log`;

    // Ensure the logs directory exists
    if (!fs.existsSync('./logs')) {
        fs.mkdirSync('./logs', { recursive: true });
    }

    const errorMessage = `${new Date().toISOString()} - ${error.message}\n\n`;

    // Append the error message to the log file
    fs.appendFile(logFilePath, errorMessage, (err) => {
        if (err) {
            logError('Failed to write to log file:', err);
        }
    });
}


export default logError;