// logger.js

import winston from "winston";
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Create Winston logger
const logger = createLogger({
  level: "info", // Default log level
  format: combine(
    colorize(), // Makes the output colorful (optional)
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamp to logs
    errors({ stack: true }), // Handle errors with stack trace
    logFormat
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: "logs/app.log" }), // Log to a file
  ],
});

// Export the logger to use it across your app
export default logger;
