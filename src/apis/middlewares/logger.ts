import morgan, { Options } from "morgan";
import { logger } from "../../utils/logger";

const morganOption = {
  stream: {
    write: (message: string): void => {
      logger.info(message.trim());
    }
  }
};

export const LoggerMiddleware = morgan("combined", morganOption);
