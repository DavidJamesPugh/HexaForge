// Logger.js
const getDateTime = () => {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const output = (source, level, message, data) => {
  const parts = [getDateTime(), level, source, message];
  if (data !== undefined) parts.push(JSON.stringify(data));
  console.log(parts.join("-"));
};

const logger = {
  config: null,

  init(config) {
      this.config = config;
  },

  debug(source, message, data) {
      output(source, "D", message, data);
  },

  info(source, message, data) {
      output(source, "I", message, data);
  },

  warning(source, message, data) {
      output(source, "W", message, data);
  },

  error(source, message, data) {
      output(source, "E", message, data);
  },
};

export default logger;
