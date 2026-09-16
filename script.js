(function () {
  "use strict";

  const config = window.LANDING_CONFIG || {};
  const form = document.getElementById("leadForm");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const sceneA = document.getElementById("sceneA");
  const sceneB = document.getElementById("sceneB");
  const scene = document.querySelector(".scene");
  const offerDialog = document.getElementById("offerDialog");
  const offerImage = document.getElementById("offerImage");
  const offerTitle = document.getElementById("offerTitle");
  const offerPrice = document.getElementById("offerPrice");
  const offerItems = document.getElementById("offerItems");
  const offerContinue = document.getElementById("offerContinue");
  const scratchCard = document.getElementById("scratchCard");
  const scratchCanvas = document.getElementById("scratchCanvas");
  const codeCard = document.querySelector(".code-card");
  const codeCardLabel = document.getElementById("codeCardLabel");
  const guestChoices = document.getElementById("guestChoices");
  const budgetChoices = document.getElementById("budgetChoices");
  const toast = document.getElementById("toast");
  const submitButton = document.getElementById("submitButton");
  const whatsappButton = document.getElementById("whatsappButton");
  const connectionNotice = document.getElementById("connectionNotice");

  const answers = {
    event_date: "",
    event_type: "",
    guest_count: "",
    budget: "",
    booking_timeline: "",
    visit_preference: "",
    full_name: "",
    phone_number: ""
  };

  const offerData = {
    Birthday: {
      prefix: "BD",
      image: "assets/hall-crystal.jpg",
      price: "₹22,999 for 20–25 guests",
      items: [
        { icon: "balloon", label: "Balloon styling included" },
        { icon: "cake", label: "Celebration cake included" },
        { icon: "music", label: "Birthday music arrangement" }
      ]
    },
    Anniversary: {
      prefix: "AN",
      image: "assets/private-dining.jpg",
      price: "₹22,999 for 20–25 guests",
      items: [
        { icon: "balloon", label: "Romantic balloon styling" },
        { icon: "cake", label: "Anniversary cake included" },
        { icon: "music", label: "Romantic celebration music" }
      ]
    },
    Engagement: {
      prefix: "EN",
      image: "assets/hall-lounge-seating.jpg",
      price: "₹1,49,999 onwards · 25–100 guests",
      items: [
        { icon: "flower", label: "Floral styling included" },
        { icon: "menu", label: "Chef-curated celebration menu" },
        { icon: "suite", label: "Couple’s suite stay" }
      ]
    },
    Wedding: {
      prefix: "WD",
      image: "assets/venue-overview.jpg",
      price: "₹3,49,999 onwards · 100–550 guests",
      items: [
        { icon: "suite", label: "2 couple’s suite stays" },
        { icon: "menu", label: "Chef-curated celebration menu" },
        { icon: "dj", label: "DJ console setup" },
        { icon: "decor", label: "Signature theme décor" }
      ]
    }
  };

  const offerIcons = {
    balloon: '<path d="M12 3.2c-3.05 0-5.2 2.54-5.2 5.93 0 3.67 2.4 6.3 5.2 6.3s5.2-2.63 5.2-6.3c0-3.39-2.15-5.93-5.2-5.93Z"/><path d="m9.8 15.15 2.2 1.9 2.2-1.9M12 17.05v3.95M12 21l-1.6-1.1M12 21l1.6-1.1"/>',
    cake: '<path d="M4 11h16v7.25A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V11Z"/><path d="M3 11h18M8 7v4M12 7v4M16 7v4M8 7c0-1 .7-1.6 1.4-2.15M12 7c0-1 .7-1.6 1.4-2.15M16 7c0-1 .7-1.6 1.4-2.15M4 15c1.1 0 1.1.9 2.2.9s1.1-.9 2.2-.9 1.1.9 2.2.9 1.1-.9 2.2-.9 1.1.9 2.2.9 1.1-.9 2.2-.9 1.1.9 2.2.9 1.1-.9 2.2-.9 1.1.9 2.2.9"/>',
    music: '<path d="M9 18.25a2.75 2.75 0 1 1-2-2.65V6.5l10-2v10.75a2.75 2.75 0 1 1-2-2.65V7.1L9 8.3v9.95Z"/>',
    flower: '<path d="M12 10.6c-2.2-1.8-2.4-4.75-.55-5.45 1.35-.5 2.2.7 2.55 1.55.35-.85 1.2-2.05 2.55-1.55 1.85.7 1.65 3.65-.55 5.45 2.8-.6 4.8.8 4.25 2.65-.4 1.35-1.8 1.5-2.7 1.35.4.85.65 2.3-.7 2.8-1.85.7-3.55-1.7-2.85-4.35-.7 2.65-3.2 3.65-4.3 2.05-.8-1.15.05-2.3.75-2.85-.9-.15-2.3-.7-2-2.1.4-1.85 2.7-2.15 3.55-.55Z"/><path d="M12 14v7M12 18c-1.2-1.3-2.25-1.5-3.2-1.35M12 17c1.2-1.3 2.25-1.5 3.2-1.35"/>',
    menu: '<path d="M4 14h16M5 14a7 7 0 0 1 14 0M7 17.5h10M8.5 20h7"/><path d="M12 7V4M10.5 4h3"/>',
    suite: '<path d="M3.5 17.5h17M5 17.5v-6h14v6M5 14h14M7 11.5V9.75A1.75 1.75 0 0 1 8.75 8h2.5A1.75 1.75 0 0 1 13 9.75v1.75M3.5 20v-2.5M20.5 20v-2.5"/>',
    dj: '<path d="M4 7h16M6 7v3M18 7v3M5 10h14l-1 9H6l-1-9ZM9 14h6M10 17h4"/>',
    decor: '<path d="m12 3 1.1 4.9L18 9l-4.9 1.1L12 15l-1.1-4.9L6 9l4.9-1.1L12 3ZM19 15l.55 2.45L22 18l-2.45.55L19 21l-.55-2.45L16 18l2.45-.55L19 15Z"/>'
  };

  const guestData = {
    Anniversary: ["20-25 guests", "26-50 guests", "51-100 guests", "More than 100"],
    Birthday: ["20–25 guests", "26–50 guests", "51–100 guests", "More than 100"],
    Engagement: ["25–50 guests", "51–75 guests", "76–100 guests", "More than 100"],
    Wedding: ["100–200 guests", "201–350 guests", "351–550 guests", "More than 550"]
  };

  const budgetData = {
    Anniversary: ["INR 22,999-INR 40,000", "INR 40,001-INR 75,000", "Above INR 75,000", "Need guidance"],
    Birthday: ["₹22,999–₹40,000", "₹40,001–₹75,000", "Above ₹75,000", "Need guidance"],
    Engagement: ["Up to ₹1.5 lakh", "₹1.5–₹2 lakh", "Above ₹2 lakh", "Need guidance"],
    Wedding: ["Up to ₹3.5 lakh", "₹3.5–₹5 lakh", "Above ₹5 lakh", "Need guidance"]
  };

  const slideImages = {
    intro: ["assets/venue-overview.jpg", "assets/suite-premium.jpg"]
  };

  const tracking = collectTracking();
  let currentIndex = 0;
  let activeScene = sceneA;
  let inactiveScene = sceneB;
  let carouselTimer = 0;
  let carouselIndex = 0;
  let leadId = "";
  let offerCode = "";
  let formStarted = false;
  let scratchContext = null;
  let scratchScale = 1;
  let scratchActive = false;
  let scratchMoves = 0;

  init();

  function init() {
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    document.getElementById("eventDate").min = localToday;

    document.querySelectorAll("[data-next]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!formStarted) {
          formStarted = true;
          track("form_start", { form_name: "celebration_offer" }, "FormStart");
        }
        goTo(currentIndex + 1);
      });
    });

    document.querySelectorAll("[data-back]").forEach((button) => {
      button.addEventListener("click", () => goTo(Math.max(0, currentIndex - 1), -1));
    });

    document.querySelector("[data-date-flexible]").addEventListener("click", (event) => {
      document.getElementById("eventDate").value = "";
      answers.event_date = "Date not fixed";
      event.currentTarget.classList.add("is-selected");
      document.getElementById("dateError").textContent = "";
    });

    document.getElementById("eventDate").addEventListener("change", (event) => {
      answers.event_date = event.target.value;
      document.querySelector("[data-date-flexible]").classList.remove("is-selected");
      document.getElementById("dateError").textContent = "";
    });

    document.querySelector("[data-date-next]").addEventListener("click", () => {
      const selectedDate = document.getElementById("eventDate").value;
      if (selectedDate) answers.event_date = selectedDate;
      if (!answers.event_date) {
        document.getElementById("dateError").textContent = "Please select a date or choose ‘Date not fixed yet’.";
        return;
      }
      track("form_step_complete", { step_name: "event_date", answer: answers.event_date }, "FormStepComplete");
      goTo(currentIndex + 1);
    });

    document.querySelectorAll(".event-card").forEach((button) => {
      button.addEventListener("click", () => selectEvent(button));
    });

    document.querySelectorAll(".choice-button[data-field]").forEach((button) => {
      button.addEventListener("click", () => selectChoice(button));
    });

    offerContinue.addEventListener("click", () => {
      offerDialog.close();
      renderGuestOptions();
      renderBudgetOptions();
      goTo(currentIndex + 1);
    });

    scratchCard.addEventListener("pointerdown", startScratch);
    scratchCard.addEventListener("pointermove", continueScratch);
    scratchCard.addEventListener("pointerup", stopScratch);
    scratchCard.addEventListener("pointercancel", stopScratch);
    scratchCard.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        revealScratch();
      }
    });

    document.querySelector("[data-name-next]").addEventListener("click", validateNameAndContinue);
    document.getElementById("fullName").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        validateNameAndContinue();
      }
    });

    document.getElementById("phoneNumber").addEventListener("input", (event) => {
      event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
      document.getElementById("phoneError").textContent = "";
    });

    form.addEventListener("submit", submitForm);
    whatsappButton.addEventListener("click", openWhatsApp);

    goTo(0);
    preloadImages(slideImages.intro);
  }

  function selectEvent(button) {
    document.querySelectorAll(".event-card").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-checked", String(selected));
    });
    answers.event_type = button.dataset.value;
    answers.budget = "";
    document.getElementById("eventError").textContent = "";
    const offer = offerData[answers.event_type];
    offerImage.src = offer.image;
    offerImage.alt = `${answers.event_type} celebration setting`;
    offerTitle.textContent = `${answers.event_type} Celebration Offer`;
    offerPrice.textContent = offer.price;
    offerPrice.hidden = !offer.price;
    offerItems.replaceChildren(...offer.items.map((item) => {
      const li = document.createElement("li");
      const icon = document.createElement("span");
      icon.className = "offer-item-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = `<svg viewBox="0 0 24 24" focusable="false">${offerIcons[item.icon]}</svg>`;
      const copy = document.createElement("span");
      copy.className = "offer-item-copy";
      const label = document.createElement("strong");
      label.textContent = item.label;
      const meta = document.createElement("span");
      meta.textContent = "Included at no extra cost";
      copy.append(label, meta);
      const included = document.createElement("span");
      included.className = "offer-included-badge";
      included.textContent = "Included";
      li.append(icon, copy, included);
      return li;
    }));
    track("event_selected", { event_type: answers.event_type }, "EventSelected");
    track("offer_unlocked", { event_type: answers.event_type }, "OfferUnlocked");
    offerDialog.showModal();
  }

  function renderGuestOptions() {
    const choices = guestData[answers.event_type] || guestData.Wedding;
    guestChoices.replaceChildren(...choices.map((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.dataset.field = "guest_count";
      button.dataset.value = value;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", "false");
      button.textContent = value;
      button.addEventListener("click", () => selectChoice(button));
      return button;
    }));
  }

  function renderBudgetOptions() {
    const choices = budgetData[answers.event_type] || budgetData.Wedding;
    budgetChoices.replaceChildren(...choices.map((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.dataset.field = "budget";
      button.dataset.value = value;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(answers.budget === value));
      button.textContent = value;
      button.addEventListener("click", () => selectChoice(button));
      return button;
    }));
  }

  function selectChoice(button) {
    const field = button.dataset.field;
    const value = button.dataset.value;
    answers[field] = value;
    const group = button.closest("[role='radiogroup']");
    if (group) {
      group.querySelectorAll("[data-field]").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-checked", String(selected));
      });
    }
    track("form_step_complete", { step_name: field, answer: value }, "FormStepComplete");
    window.setTimeout(() => goTo(currentIndex + 1), 170);
  }

  function validateNameAndContinue() {
    const input = document.getElementById("fullName");
    const value = input.value.trim().replace(/\s+/g, " ");
    if (value.length < 2 || !/\p{L}/u.test(value)) {
      document.getElementById("nameError").textContent = "Please enter your name.";
      input.focus();
      return;
    }
    answers.full_name = value;
    document.getElementById("nameError").textContent = "";
    track("form_step_complete", { step_name: "name" }, "FormStepComplete");
    goTo(currentIndex + 1);
  }

  async function submitForm(event) {
    event.preventDefault();
    const phone = document.getElementById("phoneNumber").value.replace(/\D/g, "");
    const consent = document.getElementById("consent").checked;
    const error = document.getElementById("phoneError");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      error.textContent = "Please enter a valid 10-digit WhatsApp number.";
      return;
    }
    if (!consent) {
      error.textContent = "Please confirm that we may contact you about this enquiry.";
      return;
    }

    answers.phone_number = `+91${phone}`;
    leadId = createLeadId();
    offerCode = createOfferCode(phone);
    submitButton.disabled = true;
    submitButton.textContent = "Securing your offer…";

    const payload = buildPayload("form_submit");
    await sendToSheet(payload);

    document.getElementById("offerCode").textContent = offerCode;
    const offer = offerData[answers.event_type];
    resetScratchCard();
    renderOfferSummary(offer);

    track("generate_lead", {
      currency: "INR",
      event_type: answers.event_type,
      lead_id: leadId
    });
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", {
        content_name: answers.event_type,
        content_category: "Celebration enquiry"
      }, { eventID: leadId });
    }

    goTo(slides.length - 1);
    submitButton.disabled = false;
    submitButton.textContent = "Unlock my offer code";

    if (!normaliseWhatsAppNumber(config.whatsappNumber)) {
      whatsappButton.disabled = true;
      connectionNotice.textContent = "WhatsApp activation number must be added before publishing this page.";
    }
  }

  function renderOfferSummary(offer) {
    const summary = document.getElementById("offerSummary");
    const title = document.createElement("strong");
    const price = document.createElement("span");
    const inclusions = document.createElement("span");

    title.textContent = `${answers.event_type} Celebration Offer`;
    price.textContent = offer.price;
    inclusions.textContent = `Includes: ${offer.items.map((item) => item.label).join(" | ")}`;
    summary.replaceChildren(title, price, inclusions);
  }

  function resetScratchCard() {
    const bounds = scratchCard.getBoundingClientRect();
    const width = Math.max(1, Math.floor(bounds.width));
    const height = Math.max(1, Math.floor(bounds.height));
    scratchScale = Math.min(window.devicePixelRatio || 1, 2);
    scratchCanvas.width = Math.floor(width * scratchScale);
    scratchCanvas.height = Math.floor(height * scratchScale);
    scratchCanvas.style.width = `${width}px`;
    scratchCanvas.style.height = `${height}px`;
    scratchContext = scratchCanvas.getContext("2d", { willReadFrequently: true });
    scratchContext.setTransform(scratchScale, 0, 0, scratchScale, 0, 0);
    drawScratchFoil(width, height);
    scratchMoves = 0;
    scratchActive = false;
    scratchCard.classList.remove("is-revealed");
    codeCard.classList.remove("is-revealed");
    codeCardLabel.textContent = "Reveal Your Private Offer Code";
    scratchCard.setAttribute("aria-label", "Scratch to reveal your offer code");
  }

  function drawScratchFoil(width, height) {
    const gradient = scratchContext.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#6f5033");
    gradient.addColorStop(0.48, "#d8ba82");
    gradient.addColorStop(1, "#80603e");
    scratchContext.globalCompositeOperation = "source-over";
    scratchContext.fillStyle = gradient;
    scratchContext.fillRect(0, 0, width, height);
    scratchContext.globalAlpha = 0.24;
    scratchContext.strokeStyle = "#fff5d5";
    scratchContext.lineWidth = 2;
    for (let x = -height; x < width + height; x += 10) {
      scratchContext.beginPath();
      scratchContext.moveTo(x, 0);
      scratchContext.lineTo(x + height, height);
      scratchContext.stroke();
    }
    scratchContext.globalAlpha = 1;
  }

  function startScratch(event) {
    if (scratchCard.classList.contains("is-revealed")) return;
    scratchActive = true;
    scratchCard.setPointerCapture(event.pointerId);
    scratchAt(event);
  }

  function continueScratch(event) {
    if (scratchActive) scratchAt(event);
  }

  function stopScratch(event) {
    scratchActive = false;
    if (scratchCard.hasPointerCapture(event.pointerId)) scratchCard.releasePointerCapture(event.pointerId);
  }

  function scratchAt(event) {
    if (!scratchContext) return;
    const bounds = scratchCanvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    scratchContext.save();
    scratchContext.globalCompositeOperation = "destination-out";
    scratchContext.beginPath();
    scratchContext.arc(x, y, 21, 0, Math.PI * 2);
    scratchContext.fill();
    scratchContext.restore();
    scratchMoves += 1;
    if (scratchMoves % 6 === 0 && scratchCoverage() >= 0.38) revealScratch();
  }

  function scratchCoverage() {
    const pixels = scratchContext.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
    const sampleStep = Math.max(1, Math.round(7 * scratchScale));
    let transparent = 0;
    let samples = 0;
    for (let y = 0; y < scratchCanvas.height; y += sampleStep) {
      for (let x = 0; x < scratchCanvas.width; x += sampleStep) {
        samples += 1;
        if (pixels[(y * scratchCanvas.width + x) * 4 + 3] < 80) transparent += 1;
      }
    }
    return samples ? transparent / samples : 0;
  }

  function revealScratch() {
    if (scratchCard.classList.contains("is-revealed")) return;
    scratchCard.classList.add("is-revealed");
    codeCard.classList.add("is-revealed");
    codeCardLabel.textContent = "Your Private Offer Code";
    scratchCard.setAttribute("aria-label", `Offer code revealed: ${offerCode}`);
  }

  async function openWhatsApp() {
    const destination = normaliseWhatsAppNumber(config.whatsappNumber);
    if (!destination) {
      showToast("WhatsApp activation number has not been configured yet.");
      return;
    }

    whatsappButton.disabled = true;
    whatsappButton.textContent = "Opening WhatsApp…";
    await sendToSheet(buildPayload("whatsapp_click"));

    track("whatsapp_click", {
      event_type: answers.event_type,
      lead_id: leadId,
      offer_code: offerCode
    });
    if (typeof window.fbq === "function") {
      window.fbq("track", "Contact", {
        content_name: `${answers.event_type} WhatsApp activation`
      }, { eventID: `${leadId}-WA` });
    }

    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${destination}?text=${encodeURIComponent(message)}`;
    window.location.href = url;
    window.setTimeout(() => {
      whatsappButton.disabled = false;
      whatsappButton.innerHTML = `${whatsappIcon()}Send Offer Details On WhatsApp`;
    }, 1500);
  }

  function buildWhatsAppMessage() {
    return [
      "Hello, I want to activate my event offer.",
      "",
      `Name: ${answers.full_name}`,
      `Event: ${answers.event_type}`,
      `Event date: ${formatDate(answers.event_date)}`,
      `Expected guests: ${answers.guest_count}`,
      `Estimated budget: ${answers.budget}`,
      `Venue finalisation: ${answers.booking_timeline}`,
      `Preferred assistance: ${answers.visit_preference}`,
      `WhatsApp number: ${answers.phone_number}`,
      `Offer code: ${offerCode}`,
      "",
      "I am sending this message to activate my offer code."
    ].join("\n");
  }

  function buildPayload(action) {
    return {
      action,
      submitted_at: new Date().toISOString(),
      lead_id: leadId,
      event_id: leadId,
      offer_code: offerCode,
      name: answers.full_name,
      phone: answers.phone_number,
      event_type: answers.event_type,
      event_date: answers.event_date,
      guest_count: answers.guest_count,
      budget: answers.budget,
      booking_timeline: answers.booking_timeline,
      visit_preference: answers.visit_preference,
      lead_status: action === "whatsapp_click" ? "WhatsApp Clicked" : "Form Submitted",
      whatsapp_confirmed: "No - update after message is received",
      page_url: window.location.href,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      ...tracking
    };
  }

  async function sendToSheet(payload) {
    if (!config.googleScriptUrl) {
      storeLocally(payload);
      return;
    }
    try {
      await fetch(config.googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams({ payload: JSON.stringify(payload) })
      });
    } catch (error) {
      storeLocally(payload);
      console.error("Lead delivery failed; a local backup was saved.", error);
    }
  }

  function storeLocally(payload) {
    try {
      const key = "celebration_form_backup";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(payload);
      localStorage.setItem(key, JSON.stringify(existing.slice(-20)));
    } catch (error) {
      console.error("Could not store local lead backup.", error);
    }
  }

  function goTo(nextIndex, direction = 1) {
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === nextIndex);
      slide.classList.toggle("is-before", index < nextIndex);
      slide.setAttribute("aria-hidden", String(index !== nextIndex));
    });
    currentIndex = nextIndex;
    const step = slides[currentIndex].dataset.step;
    updateProgress(step);
    startScene(step);
    track("form_step_view", { step_name: step, step_number: currentIndex }, "FormStepView");
    const focusTarget = slides[currentIndex].querySelector("h1, h2");
    if (focusTarget) {
      focusTarget.setAttribute("tabindex", "-1");
      window.setTimeout(() => focusTarget.focus({ preventScroll: true }), 100);
    }
  }

  function updateProgress(step) {
    const percentages = [7, 16, 27, 39, 51, 63, 75, 86, 94, 100];
    progressBar.style.width = `${percentages[currentIndex] || 7}%`;
    if (step === "intro") {
      progressText.textContent = "Your offer awaits";
      progressText.style.visibility = "hidden";
    } else if (step === "success") {
      progressText.textContent = "Final activation";
      progressText.style.visibility = "visible";
    } else {
      progressText.textContent = `Step ${currentIndex} of ${slides.length - 2}`;
      progressText.style.visibility = "visible";
    }
  }

  function startScene(step) {
    window.clearInterval(carouselTimer);
    carouselIndex = 0;
    if (step !== "intro") {
      scene.classList.add("scene--hidden");
      return;
    }
    scene.classList.remove("scene--hidden");
    const images = slideImages.intro;
    setScene(images[0]);
    if (step === "intro" && images.length > 1) {
      carouselTimer = window.setInterval(() => {
        carouselIndex = (carouselIndex + 1) % images.length;
        setScene(images[carouselIndex]);
      }, 5600);
    }
  }

  function setScene(src) {
    if (activeScene.getAttribute("src") === src) return;
    inactiveScene.onload = () => {
      activeScene.classList.remove("is-visible");
      inactiveScene.classList.add("is-visible");
      const previous = activeScene;
      activeScene = inactiveScene;
      inactiveScene = previous;
    };
    inactiveScene.src = src;
  }

  function collectTracking() {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid") || "";
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
      campaign_id: params.get("campaign_id") || "",
      adset_id: params.get("adset_id") || "",
      ad_id: params.get("ad_id") || "",
      fbclid,
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc") || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : "")
    };
  }

  function getCookie(name) {
    const entry = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
    return entry ? decodeURIComponent(entry.split("=").slice(1).join("=")) : "";
  }

  function createLeadId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function createOfferCode(phone) {
    const offer = offerData[answers.event_type] || offerData.Wedding;
    const suffix = Math.random().toString(36).slice(2, 4).toUpperCase();
    return `RV-${offer.prefix}-${phone.slice(-4)}-${suffix}`;
  }

  function formatDate(value) {
    if (!value || value === "Date not fixed") return "Date not fixed";
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(parsed);
  }

  function normaliseWhatsAppNumber(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function track(gaEvent, params, metaEvent) {
    const eventParams = {
      ...(params || {}),
      page_location: window.location.href
    };
    if (typeof window.gtag === "function") {
      window.gtag("event", gaEvent, eventParams);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(["event", gaEvent, eventParams]);
    }
    if (metaEvent && typeof window.fbq === "function") {
      window.fbq("trackCustom", metaEvent, eventParams);
    }
  }

  function preloadImages(images) {
    images.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function whatsappIcon() {
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.1 3.2A12.7 12.7 0 0 0 5.2 22.4L3.5 28.7l6.5-1.7a12.8 12.8 0 1 0 6.1-23.8Zm0 23.1c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.8 1 1-3.7-.3-.4a10.4 10.4 0 1 1 9.1 4.8Zm5.7-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.7.1-1.8-.9-3-1.6-4.2-3.6-.3-.5.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.6.1-1 .5-.3.4-1.3 1.3-1.3 3.2s1.4 3.7 1.6 4c.2.3 2.7 4.1 6.5 5.7 2.4 1 3.4 1.1 4.6.9.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.5Z"/></svg>';
  }
})();
