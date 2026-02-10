let ws;
let localStream;
let peers = {};
let coords = {};
let myCoords = {x:0, y:0, z:0};
let speaking = false;
let myNick = "Steve"; // можно брать с input при join

let micEnabled = true;
let speakerEnabled = true;

const micBtn = document.getElementById("micBtn");
const speakerBtn = document.getElementById("speakerBtn");
const join = document.getElementById("join");

// подключение
async function start() {
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  ws = new WebSocket("ws://localhost:8765");

  ws.onopen = () => console.log("Connected to WS server");
  ws.onmessage = async e => {
    const msg = JSON.parse(e.data);

    if (msg.type === "coords") {
      coords = msg.players;
      updateVolumes();
    }

    if (msg.type === "offer") {
      await handleOffer(msg); // твоя WebRTC логика
    }
  };

  ws.onerror = e => console.error("WS error", e);
  ws.onclose = () => console.log("WS closed");

  monitorSpeaking(localStream); // мониторим микрофон
}

// кнопка Войти
join.onclick = () => {
  myNick = prompt("Введите ник для ActionBar") || "Steve";
  start();
};

// кнопка Микрофон
micBtn.onclick = () => {
  micEnabled = !micEnabled;
  if (localStream) {
    localStream.getAudioTracks().forEach(track => track.enabled = micEnabled);
  }
  micBtn.textContent = `Микрофон: ${micEnabled ? "Вкл" : "Выкл"}`;

  // если выключили микрофон — сбрасываем speaking
  if (!micEnabled && speaking) {
    speaking = false;
    ws.send(JSON.stringify({type: "stoppedSpeaking", nick: myNick}));
  }
};

// кнопка Наушники
speakerBtn.onclick = () => {
  speakerEnabled = !speakerEnabled;

  // Меняем громкость всех подключенных пиров
  for (const nick in peers) {
    if (peers[nick] && peers[nick].gain) {
      peers[nick].gain.gain.value = speakerEnabled ? 1 : 0;
    }
  }

  // Меняем иконку кнопки
  speakerBtn.innerHTML = speakerEnabled
    ? `<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
           d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a6 6 0 0 1 0 7.07" />
       </svg>`
    : `<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
           d="M11 5L6 9H2v6h4l5 4V5zM19 9l-6 6M19 15l-6-6" />
       </svg>`;
};


// обновление громкости по координатам
function updateVolumes() {
  for (const nick in peers) {
    const d = distance(myCoords, coords[nick]);
    if (peers[nick] && peers[nick].gain) {
      peers[nick].gain.gain.value = speakerEnabled ? Math.max(0, 1 - d / 20) : 0;
    }
  }
}

function distance(a, b) {
  if (!b) return 20;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

// мониторинг микрофона
function monitorSpeaking(stream) {
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);

  const data = new Uint8Array(analyser.frequencyBinCount);

  setInterval(() => {
    if (!micEnabled) return; // микрофон выключен — не отправляем

    analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const avg = sum / data.length;

    if (avg > 20) {
      if (!speaking) {
        speaking = true;
        ws.send(JSON.stringify({type: "speaking", nick: myNick}));
      }
    } else {
      if (speaking) {
        speaking = false;
        ws.send(JSON.stringify({type: "stoppedSpeaking", nick: myNick}));
      }
    }
  }, 100);
}

micBtn.onclick = () => {
  micEnabled = !micEnabled;

  // Включаем/выключаем микрофон в потоке
  if (localStream) {
    localStream.getAudioTracks().forEach(track => track.enabled = micEnabled);
  }

  // Меняем иконку кнопки
  micBtn.innerHTML = micEnabled
    ? `<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
           d="M12 1v11m0 0a4 4 0 0 0 4-4V1a4 4 0 0 0-8 0v7a4 4 0 0 0 4 4zm0 0v4m-4 4h8" />
       </svg>` 
    : `<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
           d="M9 9l6 6m0-6l-6 6M12 1v11m0 0a4 4 0 0 0 4-4V1a4 4 0 0 0-8 0v7a4 4 0 0 0 4 4zm0 0v4m-4 4h8" />
       </svg>`;

  // Отправляем событие в WS
  if (!micEnabled) {
    speaking = false;
    ws.send(JSON.stringify({type: "muted", nick: myNick}));
  } else {
    ws.send(JSON.stringify({type: "unmuted", nick: myNick}));
  }
};
