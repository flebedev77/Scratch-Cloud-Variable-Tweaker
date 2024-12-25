const WebSocket = require("ws");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.3";

if (!USER_AGENT) {
  throw new Error(
    "You are required to provide a valid User-Agent header! See `const USER_AGENT = ...` and the comment above it near the start of this file.",
  );
}

const ws = new WebSocket("wss://clouddata.scratch.mit.edu/", {
  headers: {
    "user-agent": USER_AGENT,
  },
});
const variables = {};

function setVariable(name, value) {
  console.log(`Setting variable: ${name} = ${value}`);
  variables[name] = value;
  ws.send(
    JSON.stringify({
      method: "set",
      name,
      value,
    }),
  );
}

function getVariable(name) {
  return variables[name];
}

ws.onopen = () => {
  console.log("Performing handshake");

  // Tell the server which project you want to connect to.
  ws.send(
    JSON.stringify({
      method: "handshake",
      project_id: "226445813",
      user: "Bomboclat",
    }),
  );

  // mess someone's high score up
  setVariable("☁ Highscore", "1");
};

ws.onmessage = (event) => {
  // Process updates from the server.
  for (const message of event.data.split("\n")) {
    const obj = JSON.parse(message);
    if (obj.method === "set") {
      variables[obj.name] = obj.value;
      console.log(`Server set variable: ${obj.name} = ${obj.value}`);
    }
  }
};

ws.onclose = () => {
  console.log("Server closed connection");
};

ws.onerror = (err) => {
  console.log("Error!", err);
};
