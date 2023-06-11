(function () {
  const messages = document.querySelector("#messages");
  const wsButton = document.querySelector("#wsButton");
  const wsSendButton = document.querySelector("#wsSendButton");
  const logout = document.querySelector("#logout");
  const login = document.querySelector("#login");
  const sendBroadCase = document.querySelector("#sendBroadCase");
  const startScript = document.querySelector("#startScript");
  const closeWs = document.querySelector("#closeWs");

  function showMessage(message) {
    messages.textContent += `\n${message}`;
    messages.scrollTop = messages.scrollHeight;
  }

  function handleResponse(response) {
    return response.ok ? response.json().then((data) => JSON.stringify(data, null, 2)) : Promise.reject(new Error("Unexpected response"));
  }

  login.onclick = function () {
    fetch("/login", { method: "POST", credentials: "same-origin" })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  logout.onclick = function () {
    fetch("/logout", { method: "DELETE", credentials: "same-origin" })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  let ws;

  wsButton.onclick = function () {
    if (ws) {
      ws.onerror = ws.onopen = ws.onclose = null;
      ws.close();
    }

    ws = new WebSocket(`ws://localhost:3300?deviceId=123456`);
    ws.onerror = function () {
      showMessage("WebSocket error");
    };
    ws.onopen = function () {
      // 链接成功，进行设备注册
      const params = {
        deviceId: 98989889
      };
      ws.send(sendMsg("register", params));

      showMessage("WebSocket connection established");
    };
    ws.onclose = function () {
      showMessage("WebSocket connection closed");
      ws = null;
    };
    ws.onmessage = function (event) {
      try {
        const { type, data } = JSON.parse(event.data);
        if (type === "hello") {
          // 有新设备接入
          console.log(`有新设备`);
        }
        console.log("🚀 ~ file: app.js:59 ~ data:", data);
        showMessage(`Received message: ${JSON.stringify(data, null, 4)}`);
      } catch (error) {
        showMessage(`Received message: ${event.data}`);
      }
    };
  };

  sendBroadCase.onclick = function () {
    ws.send(sendMsg("broadCase"));
  };

  startScript.onclick = function () {
    ws.send(sendMsg("startScript"));
  };

  wsSendButton.onclick = function () {
    if (!ws) {
      showMessage("No WebSocket connection");
      return;
    }

    ws.send("Hello World!");
    showMessage('Sent "Hello World!"');
  };

  closeWs.onclick = function () {
    ws.close();
  };
})();

const sendMsg = (action, data = {}, type = "json") => {
  return JSON.stringify({
    action,
    type,
    data
  });
};
