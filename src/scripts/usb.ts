import { faces } from "../data/faces";

interface SerialPort {
  readable: ReadableStream<Uint8Array> | null;
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
let port: SerialPort | null = null;
let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
let readTask: Promise<void> | null = null;
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
}

function addLog(value: string) {
  const follow = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
  log.textContent = ((log.textContent || "") + value).slice(-24000);
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
disconnectButton.addEventListener("click", disconnect);
document.querySelector("#clear-log")!.addEventListener("click", () => {
  log.textContent = "";
});
window.addEventListener("pagehide", () => {
  disposed = true;
  void disconnect();
});
