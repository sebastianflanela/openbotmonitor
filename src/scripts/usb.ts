import { faces } from "../data/faces";

interface SerialPort {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
}
interface SerialAPI extends EventTarget {
  requestPort(): Promise<SerialPort>;
}

const serial = (navigator as Navigator & { serial?: SerialAPI }).serial;
const connectButton =
  document.querySelector<HTMLButtonElement>("#connect-usb")!;
const disconnectButton =
  document.querySelector<HTMLButtonElement>("#disconnect-usb")!;
const status = document.querySelector<HTMLElement>("#usb-status")!;
const badge = document.querySelector<HTMLElement>("#connection-badge")!;
const log = document.querySelector<HTMLElement>("#serial-log")!;
const select = document.querySelector<HTMLSelectElement>("#face-select")!;
const configForm = document.querySelector<HTMLFormElement>("#device-config")!;
const saveConfigButton = document.querySelector<HTMLButtonElement>("#save-config")!;
const configStatus = document.querySelector<HTMLElement>("#config-status")!;
let port: SerialPort | null = null;
let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
let readTask: Promise<void> | null = null;
let firmwareReady = false;
let protocolBuffer = "";
let disconnecting = false;
let disposed = false;

function updateFace(id: string) {
  const face = faces.find((item) => item.id === id) || faces[0];
  select.value = face.id;
  document.querySelector<HTMLCanvasElement>(
    ".selected-preview canvas",
  )!.dataset.face = face.id;
  document.querySelector("#face-description")!.textContent = face.description;
  const url = new URL(window.location.href);
  url.searchParams.set("face", face.id);
  window.history.replaceState(null, "", url);
}
updateFace(new URLSearchParams(window.location.search).get("face") || "hero");
select.addEventListener("change", () => updateFace(select.value));

function setConnected(connected: boolean) {
  badge.textContent = connected ? "Połączono" : "Rozłączono";
  badge.classList.toggle("connected", connected);
  connectButton.hidden = connected;
  disconnectButton.hidden = !connected;
  connectButton.disabled = false;
  if (!connected) {
    firmwareReady = false;
    protocolBuffer = "";
    saveConfigButton.disabled = true;
    configStatus.textContent = "Połącz ESP32 i poczekaj na komunikat gotowości firmware’u.";
  } else {
    configStatus.textContent = "Czekam na firmware obsługujące konfigurację USB…";
  }
}

function addLog(value: string) {
  const follow = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
  log.textContent = ((log.textContent || "") + value).slice(-24000);
  protocolBuffer = (protocolBuffer + value).slice(-2048);
  if (protocolBuffer.includes("SERIAL_CONFIG_READY")) {
    firmwareReady = true;
    configStatus.textContent = "Firmware gotowe. Ustawienia wyślesz bezpośrednio przez USB.";
    saveConfigButton.disabled = !port;
  }
  if (protocolBuffer.includes("CONFIG_OK")) {
    configStatus.textContent = "Ustawienia zapisane w ESP32. Urządzenie łączy się z Wi‑Fi.";
    saveConfigButton.disabled = !port;
    configForm.querySelector<HTMLInputElement>("#wifi-password")!.value = "";
    configForm.querySelector<HTMLInputElement>("#bridge-token")!.value = "";
  }
  const configError = protocolBuffer.match(/CONFIG_ERROR:([a-z_]+)/);
  if (configError) {
    configStatus.textContent = `ESP32 odrzuciło ustawienia (${configError[1]}). Sprawdź pola i spróbuj ponownie.`;
    saveConfigButton.disabled = !port || !firmwareReady;
  }
  if (follow) log.scrollTop = log.scrollHeight;
}

async function readLogs(activePort: SerialPort) {
  if (!activePort.readable) return;
  const decoder = new TextDecoder();
  const activeReader = activePort.readable.getReader();
  reader = activeReader;
  try {
    while (!disconnecting) {
      const { value, done } = await activeReader.read();
      if (done) break;
      if (value) addLog(decoder.decode(value, { stream: true }));
    }
    addLog(decoder.decode());
  } catch {
    if (!disconnecting)
      status.textContent =
        "Utracono połączenie USB. Sprawdź kabel i połącz ponownie.";
  } finally {
    activeReader.releaseLock();
    reader = null;
    if (!disconnecting) {
      try {
        await activePort.close();
      } catch {
        /* Odłączony port może być już zamknięty. */
      }
      if (port === activePort) {
        port = null;
        setConnected(false);
        status.textContent =
          "Połączenie USB zakończone. Możesz ponownie wybrać port.";
      }
    }
  }
}

async function disconnect() {
  if (!port || disconnecting) return;
  disconnecting = true;
  disconnectButton.disabled = true;
  const activePort = port;
  try {
    await reader?.cancel();
    await readTask;
    await activePort.close();
    status.textContent = "Rozłączono urządzenie. Możesz ponownie wybrać port.";
  } catch {
    status.textContent =
      "Port został odłączony. Możesz ponownie połączyć urządzenie.";
  } finally {
    port = null;
    readTask = null;
    disconnecting = false;
    disconnectButton.disabled = false;
    setConnected(false);
  }
}

if (!window.isSecureContext || !serial) {
  connectButton.disabled = true;
  badge.textContent = "Sprawdź przeglądarkę";
  status.textContent = !window.isSecureContext
    ? "USB wymaga bezpiecznego adresu HTTPS. Otwórz stronę przez HTTPS."
    : "Ta przeglądarka nie udostępnia Web Serial. Użyj aktualnego Chrome lub Edge na komputerze.";
} else {
  connectButton.addEventListener("click", async () => {
    if (port) return;
    connectButton.disabled = true;
    let selectedPort: SerialPort | null = null;
    try {
      selectedPort = await serial.requestPort();
      await selectedPort.open({ baudRate: 115200 });
      port = selectedPort;
      if (disposed) {
        await selectedPort.close();
        port = null;
        return;
      }
      log.textContent = "";
      firmwareReady = false;
      protocolBuffer = "";
      setConnected(true);
      status.textContent =
        "Port USB otwarty. Oczekiwanie na logi urządzenia. Wgrywanie firmware’u jest jeszcze w przygotowaniu.";
      readTask = readLogs(selectedPort);
    } catch (error) {
      if (selectedPort) {
        try {
          await selectedPort.close();
        } catch {
          /* Port nie został otwarty. */
        }
      }
      port = null;
      const name = error instanceof DOMException ? error.name : "";
      status.textContent =
        name === "NotFoundError"
          ? "Wybór portu anulowany. Kliknij ponownie, gdy urządzenie będzie gotowe."
          : "Nie udało się otworzyć portu. Sprawdź kabel, sterownik i zamknij inne programy korzystające z urządzenia.";
      setConnected(false);
    }
  });
}
configForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!port?.writable || !firmwareReady) return;

  const ssid = configForm.querySelector<HTMLInputElement>("#wifi-ssid")!.value.trim();
  const password = configForm.querySelector<HTMLInputElement>("#wifi-password")!.value;
  const bridgeToken = configForm.querySelector<HTMLInputElement>("#bridge-token")!.value.trim();
  const bridgeUrlText = configForm.querySelector<HTMLInputElement>("#bridge-url")!.value.trim();
  let bridgeUrl: URL;
  try {
    bridgeUrl = new URL(bridgeUrlText);
  } catch {
    configStatus.textContent = "Wpisz poprawny adres bridge’a zakończony /api/status.";
    return;
  }
  if (!ssid || ssid.length > 32 || password.length > 63 || bridgeToken.length < 32 || bridgeToken.length > 128 ||
      !["http:", "https:"].includes(bridgeUrl.protocol) || bridgeUrl.pathname !== "/api/status" ||
      bridgeUrl.username || bridgeUrl.password || bridgeUrl.search || bridgeUrl.hash) {
    configStatus.textContent = "Sprawdź SSID, długość tokenu i adres bridge’a. Wymagany jest endpoint /api/status.";
    return;
  }

  const payload = JSON.stringify({
    command: "configure",
    ssid,
    password,
    bridge_url: bridgeUrl.href,
    bridge_token: bridgeToken,
  }) + "\n";
  saveConfigButton.disabled = true;
  configStatus.textContent = "Wysyłam ustawienia przewodem USB…";
  protocolBuffer = "";
  let writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  try {
    writer = port.writable.getWriter();
    await writer.write(new TextEncoder().encode(payload));
    configStatus.textContent = "Wysłano. Czekam na potwierdzenie ESP32…";
  } catch {
    configStatus.textContent = "Nie udało się wysłać ustawień. Sprawdź połączenie USB.";
    saveConfigButton.disabled = false;
  } finally {
    writer?.releaseLock();
  }
});
disconnectButton.addEventListener("click", disconnect);
document.querySelector("#clear-log")!.addEventListener("click", () => {
  log.textContent = "";
});
window.addEventListener("pagehide", () => {
  disposed = true;
  void disconnect();
});

