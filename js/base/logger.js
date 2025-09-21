// Logger.js
const getDateTime = () => {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const output = (source, level, message, data) => {
  const parts = [getDateTime(), level, source, message];
  if (data !== undefined) parts.push(JSON.stringify(data));
  console.log(parts.join(" | "));
};

const logger = {
  config: null,

  init(config) {
      this.config = config;
  },

  debug(source, message, data) {
      output(source, "debug", message, data);
  },

  info(source, message, data) {
      output(source, "info", message, data);
  },

  warning(source, message, data) {
      output(source, "warning", message, data);
  },

  error(source, message, data) {
      output(source, "error", message, data);
  },
};

export default logger;
