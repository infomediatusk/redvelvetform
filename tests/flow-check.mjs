const targets = await fetch("http://localhost:9223/json").then((response) => response.json());
const target = targets.find((item) => item.type === "page" && item.url.startsWith("http://localhost:4173/"));
if (!target) throw new Error("Preview page was not found in Chrome.");

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let commandId = 0;

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

function send(method, params = {}) {
  const id = ++commandId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true
});
await send("Page.reload", { ignoreCache: true });
await wait(900);

const checks = {};
checks.mobileViewport = await evaluate("({width: innerWidth, height: innerHeight, horizontalOverflow: document.documentElement.scrollWidth > innerWidth})");

await evaluate("document.querySelector('[data-next]').click()");
await wait(120);
await evaluate("document.querySelector('#eventDate').value='2026-11-20'; document.querySelector('#eventDate').dispatchEvent(new Event('change',{bubbles:true})); document.querySelector('[data-date-next]').click()");
await wait(120);
await evaluate("document.querySelector('.event-card[data-value=\"Birthday\"]').click()");
await wait(120);

checks.offerPopup = await evaluate("({open: document.querySelector('#offerDialog').open, title: document.querySelector('#offerTitle').textContent, items: [...document.querySelectorAll('#offerItems li')].map(x=>x.textContent)})");

await evaluate("document.querySelector('#offerContinue').click()");
await wait(100);
await evaluate("document.querySelector('#guestChoices .choice-button').click()");
await wait(240);
await evaluate("document.querySelector('#budgetChoices .choice-button').click()");
await wait(240);
await evaluate("document.querySelector('[data-field=\"booking_timeline\"]').click()");
await wait(240);
await evaluate("document.querySelector('[data-field=\"visit_preference\"]').click()");
await wait(240);
await evaluate("document.querySelector('#fullName').value='Test Guest'; document.querySelector('[data-name-next]').click()");
await wait(120);
await evaluate("document.querySelector('#phoneNumber').value='9876543210'; document.querySelector('#consent').checked=true; document.querySelector('#leadForm').requestSubmit()");
await wait(500);

checks.submission = await evaluate(`(() => {
  const active = document.querySelector('.slide.is-active');
  const backup = JSON.parse(localStorage.getItem('celebration_form_backup') || '[]');
  const latest = backup.at(-1) || {};
  return {
    activeStep: active && active.dataset.step,
    offerCode: document.querySelector('#offerCode').textContent,
    whatsappDisabledUntilConfigured: document.querySelector('#whatsappButton').disabled,
    savedAction: latest.action,
    savedEvent: latest.event_type,
    savedSource: latest.utm_source,
    savedCampaign: latest.utm_campaign,
    savedPhone: latest.phone
  };
})()`);

checks.noVisibleHotelName = await evaluate("!document.body.innerText.toLowerCase().includes('red velvet')");

console.log(JSON.stringify(checks, null, 2));
socket.close();
