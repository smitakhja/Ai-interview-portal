import app from "./server.js";

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`AI Interview Portal API running on http://${HOST}:${PORT}`);
});
