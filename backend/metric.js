// metrics.js
const client = require("prom-client");

// Collect default Node.js metrics
client.collectDefaultMetrics();

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Time taken by HTTP requests",
  labelNames: ["method", "route", "status"],
});

module.exports = {
  httpRequestDuration,
  register: client.register,
};
