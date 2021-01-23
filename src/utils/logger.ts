import moment from "moment-timezone";
import { createLogger, transports, format } from "winston";

const options = {
  file: {
    level: "info",
    filename: `${process.cwd()}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    flags: "a",
    mode: 0o666
  },
  console: {
    level: process.env.NODE_ENV === "test" ? "error" : "info",
    handleExceptions: true,
    json: false,
    colorize: true
  }
};

const reformat = function (info): string {
  const { timestamp, label, level, message, ...args } = info;
  const ts = timestamp.slice(0, 19).replace("T", " ");
  return `${ts} [${level}]: ${label} - ${message} ${Object.keys(args).length ? JSON.stringify(args, null, "") : ""
    }`;
};

const appendTimestamp = format((info, opts) => {
  if (opts.tz)
    info.timestamp = moment()
      .tz(opts.tz)
      .format();
  return info;
});

const developmentFormat = format.combine(
  // format.json(),
  format.timestamp(),
  format.label({ label: "main" }),
  appendTimestamp({ tz: "Asia/Taipei" }),
  format.colorize(),
  // format.prettyPrint(),
  format.printf(reformat)
);

export const logger = createLogger({
  exitOnError: false,
  format: developmentFormat,
  transports: [
    new transports.File(options.file),
    new transports.Console(options.console)
  ]
});
