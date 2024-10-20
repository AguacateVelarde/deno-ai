export const logger = {
  log: (message: string) => {
    console.log(`\x1B[31m[INFO]\x1B[34m: ${message}`);
  },
  debug: (message: string) => {
    console.log(`🛑 [DEBUG]: ${message}`);
  },
};
