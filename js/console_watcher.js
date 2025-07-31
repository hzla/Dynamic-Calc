
// // Store console output
// let consoleOutput = [];

// // Store original console methods
// const originalConsole = {
//     log: console.log,
//     warn: console.warn,
//     error: console.error,
//     info: console.info,
//     debug: console.debug,
//     trace: console.trace
// };

// // Function to format console arguments
// function formatArgs(args) {
//     return Array.from(args).map(arg => {
//         if (typeof arg === 'object') {
//             try {
//                 return JSON.stringify(arg, null, 2);
//             } catch (e) {
//                 return String(arg);
//             }
//         }
//         return String(arg);
//     }).join(' ');
// }

// // Function to add timestamp
// function getTimestamp() {
//     return new Date().toISOString();
// }

// // Override console methods to capture output
// function interceptConsole(method, level) {
//     console[method] = function(...args) {
//         // Store the output
//         const timestamp = getTimestamp();
//         const message = formatArgs(args);
//         consoleOutput.push(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
        
//         // Call original console method
//         originalConsole[method].apply(console, args);
//     };
// }

// // Intercept all console methods
// interceptConsole('log', 'log');
// interceptConsole('warn', 'warn');
// interceptConsole('error', 'error');
// interceptConsole('info', 'info');
// interceptConsole('debug', 'debug');
// interceptConsole('trace', 'trace');

// // Function to copy console output to clipboard
// async function copyConsoleToClipboard() {


    
//     try {
        
//         const fullOutput = consoleOutput.join('\n');
        
//         if (navigator.clipboard && window.isSecureContext) {
//             // Use modern clipboard API
//             await navigator.clipboard.writeText(fullOutput);
//         }
        

        
//     } catch (error) {
//         // Show error message
//         console.error('Copy failed:', error);
//     } 
// }

// // Add event listener to copy button
// // document.getElementById('#copy-console').addEventListener('click', copyConsoleToClipboard);

// // Optional: Add keyboard shortcut (Ctrl+Shift+C)
// document.addEventListener('keydown', function(e) {
//     if (e.ctrlKey && e.shiftKey && e.key === 'C') {
//         e.preventDefault();
//         copyConsoleToClipboard();
//     }
// });


