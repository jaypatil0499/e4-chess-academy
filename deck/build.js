const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaPalette, FaCode, FaRocket, FaGlobe, FaWhatsapp, FaEnvelope,
  FaDatabase, FaArrowRight, FaLightbulb, FaUserTie, FaChessKnight,
  FaGithub, FaFigma, FaCamera, FaBolt, FaCheckCircle, FaCircle,
  FaServer, FaPlay, FaMobileAlt, FaCloudUploadAlt
} = require("react-icons/fa");

// ---------------- Palette (mirrors the E4CA brand) ----------------
const NAVY    = "0D1F2D";
const NAVY2   = "152D40";
const CREAM   = "F7F3EA";
const CREAM2  = "EFE9D8";
const GOLD    = "C9A84C";
const CYAN    = "00B4D8";
const INK     = "1A1A1A";
const MUTED   = "5B6470";
const RULE    = "E4DCC8";
const WHITE   = "FFFFFF";

// ---------------- Helpers ----------------
function svg(IconComponent, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}
async function icon(IconComponent, color = "#" + NAVY, size = 256) {
  const buf = await sharp(Buffer.from(svg(IconComponent, color, size))).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
const makeShadow = () => ({
  type: "outer", color: "000000", blur: 10, offset: 2, angle: 90, opacity: 0.12
});

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625
  pres.author = "Jay";
  pres.title = "Building Web Apps with Claude Code — E4CA Case Study";

  // Pre-render icons we'll reuse
  const ic = {
    palette:  await icon(FaPalette, "#" + GOLD),
    code:     await icon(FaCode, "#" + CYAN),
    rocket:   await icon(FaRocket, "#" + GOLD),
    globe:    await icon(FaGlobe, "#" + CYAN),
    whatsapp: await icon(FaWhatsapp, "#" + GOLD),
    envelope: await icon(FaEnvelope, "#" + CYAN),
    database: await icon(FaDatabase, "#" + GOLD),
    arrow:    await icon(FaArrowRight, "#" + GOLD),
    bulb:     await icon(FaLightbulb, "#" + GOLD),
    pm:       await icon(FaUserTie, "#" + CREAM),
    chess:    await icon(FaChessKnight, "#" + GOLD),
    github:   await icon(FaGithub, "#" + NAVY),
    figma:    await icon(FaFigma, "#" + GOLD),
    camera:   await icon(FaCamera, "#" + CYAN),
    bolt:     await icon(FaBolt, "#" + GOLD),
    check:    await icon(FaCheckCircle, "#" + GOLD),
    dot:      await icon(FaCircle, "#" + GOLD),
    server:   await icon(FaServer, "#" + CYAN),
    play:     await icon(FaPlay, "#" + GOLD),
    mobile:   await icon(FaMobileAlt, "#" + CYAN),
    upload:   await icon(FaCloudUploadAlt, "#" + GOLD),
  };

  // Tiny reusable: footer label (page #, project tag)
  const addFooter = (slide, pageNum, total, theme = "light") => {
    const color = theme === "dark" ? CREAM : MUTED;
    slide.addText("E4CA · BUILDING WITH CLAUDE CODE", {
      x: 0.5, y: 5.25, w: 6, h: 0.3, fontSize: 9, fontFace: "Calibri",
      color, charSpacing: 4, margin: 0
    });
    slide.addText(`${pageNum} / ${total}`, {
      x: 8.7, y: 5.25, w: 0.8, h: 0.3, fontSize: 9, fontFace: "Calibri",
      color, align: "right", margin: 0
    });
  };

  // Reusable: small chip with icon + label
  const chip = (slide, x, y, w, label, ico) => {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h: 0.4, fill: { color: WHITE }, line: { color: RULE, width: 0.75 },
      rectRadius: 0.05
    });
    slide.addImage({ data: ico, x: x + 0.12, y: y + 0.08, w: 0.24, h: 0.24 });
    slide.addText(label, {
      x: x + 0.42, y, w: w - 0.5, h: 0.4, fontSize: 11, fontFace: "Calibri",
      color: INK, valign: "middle", margin: 0
    });
  };

  const TOTAL = 12;

  // ==================================================================
  // SLIDE 1 — TITLE (dark)
  // ==================================================================
  {
    const s = pres.addSlide();
    s.background = { color: NAVY };

    // Subtle accent block top-left
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 0.3, h: 5.625, fill: { color: GOLD }, line: { color: GOLD, width: 0 }
    });

    s.addText("A CASE STUDY", {
      x: 0.8, y: 0.9, w: 8, h: 0.35, fontSize: 11, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 8, margin: 0
    });

    s.addText("Shipping a live web app", {
      x: 0.8, y: 1.35, w: 8.5, h: 0.9, fontSize: 44, fontFace: "Georgia",
      color: CREAM, bold: true, margin: 0
    });
    s.addText("without writing a single line of code.", {
      x: 0.8, y: 2.25, w: 8.5, h: 0.9, fontSize: 44, fontFace: "Georgia",
      italic: true, color: CYAN, margin: 0
    });

    s.addText("How an AI Product Manager built E4 Chess Academy using Claude Code, Figma Make, Vercel, Supabase & WhatsApp AI — start to live in days, not months.", {
      x: 0.8, y: 3.45, w: 8.4, h: 1.0, fontSize: 14, fontFace: "Calibri",
      color: CREAM, margin: 0
    });

    // Bottom byline
    s.addImage({ data: ic.chess, x: 0.8, y: 4.85, w: 0.28, h: 0.28 });
    s.addText("Jay  ·  AI Product Manager  ·  e4chessacademy.com", {
      x: 1.2, y: 4.83, w: 7, h: 0.32, fontSize: 11, fontFace: "Calibri",
      color: CREAM, valign: "middle", margin: 0
    });
  }

  // ==================================================================
  // SLIDE 2 — WHO I AM (light)
  // ==================================================================
  {
    const s = pres.addSlide();
    s.background = { color: CREAM };

    s.addText("WHO'S TALKING", {
      x: 0.6, y: 0.55, w: 5, h: 0.3, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 6, margin: 0
    });
    s.addText("A product manager who can't code.", {
      x: 0.6, y: 0.9, w: 9, h: 0.9, fontSize: 32, fontFace: "Georgia",
      color: NAVY, bold: true, margin: 0
    });

    // Left column — about
    s.addText("My day job is writing specs, mocking flows, and handing them to engineers. I don't ship code — I describe what should exist.", {
      x: 0.6, y: 1.9, w: 5.4, h: 1.0, fontSize: 14, fontFace: "Calibri",
      color: INK, margin: 0, paraSpaceAfter: 6
    });
    s.addText("So when my friend asked me to build a website for his chess academy, the honest answer used to be: \"I'll find a developer.\"", {
      x: 0.6, y: 2.9, w: 5.4, h: 1.1, fontSize: 14, fontFace: "Calibri",
      italic: true, color: MUTED, margin: 0
    });

    // Right column — card
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.3, y: 1.9, w: 3.1, h: 2.7, fill: { color: WHITE },
      line: { color: RULE, width: 0.75 }, shadow: makeShadow()
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.3, y: 1.9, w: 0.08, h: 2.7, fill: { color: GOLD }, line: { color: GOLD, width: 0 }
    });
    s.addImage({ data: ic.bulb, x: 6.55, y: 2.05, w: 0.32, h: 0.32 });
    s.addText("THE PROMISE OF AI", {
      x: 6.95, y: 2.0, w: 2.4, h: 0.4, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 5, valign: "middle", margin: 0
    });
    s.addText("Today I can describe what I want to Claude Code the same way I'd describe it to a developer — and watch it land in production.", {
      x: 6.55, y: 2.55, w: 2.7, h: 1.5, fontSize: 13, fontFace: "Calibri",
      color: INK, margin: 0
    });
    s.addText("The role didn't change. The hand-off did.", {
      x: 6.55, y: 4.15, w: 2.7, h: 0.4, fontSize: 12, fontFace: "Calibri",
      bold: true, color: NAVY, margin: 0
    });

    addFooter(s, 2, TOTAL);
  }

  // ==================================================================
  // SLIDE 3 — THE SHIFT (light, two-column compare)
  // ==================================================================
  {
    const s = pres.addSlide();
    s.background = { color: CREAM };

    s.addText("THE SHIFT", {
      x: 0.6, y: 0.55, w: 4, h: 0.3, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 6, margin: 0
    });
    s.addText("Same brief. New hand-off.", {
      x: 0.6, y: 0.9, w: 9, h: 0.7, fontSize: 30, fontFace: "Georgia",
      color: NAVY, bold: true, margin: 0
    });

    // OLD WAY card
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 1.85, w: 4.25, h: 2.95, fill: { color: WHITE },
      line: { color: RULE, width: 0.75 }, shadow: makeShadow()
    });
    s.addText("THE OLD WAY", {
      x: 0.85, y: 2.0, w: 3.8, h: 0.3, fontSize: 10, fontFace: "Calibri",
      color: MUTED, bold: true, charSpacing: 5, margin: 0
    });
    s.addText("PM → Dev → Wait", {
      x: 0.85, y: 2.35, w: 3.8, h: 0.5, fontSize: 18, fontFace: "Georgia",
      color: NAVY, bold: true, margin: 0
    });
    s.addText([
      { text: "Write a spec",                                          options: { bullet: true, breakLine: true } },
      { text: "Find / brief a developer",                              options: { bullet: true, breakLine: true } },
      { text: "Wait for sprint cycles",                                options: { bullet: true, breakLine: true } },
      { text: "Negotiate every tweak",                                 options: { bullet: true, breakLine: true } },
      { text: "Hope it ships before the brief changes",                options: { bullet: true } },
    ], {
      x: 0.85, y: 2.95, w: 3.8, h: 1.75, fontSize: 12, fontFace: "Calibri",
      color: INK, paraSpaceAfter: 4, margin: 0
    });

    // Arrow between
    s.addImage({ data: ic.arrow, x: 4.92, y: 3.15, w: 0.4, h: 0.4 });

    // NEW WAY card
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.45, y: 1.85, w: 4.0, h: 2.95, fill: { color: NAVY },
      line: { color: NAVY, width: 0 }, shadow: makeShadow()
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.45, y: 1.85, w: 0.08, h: 2.95, fill: { color: GOLD }, line: { color: GOLD, width: 0 }
    });
    s.addText("THE NEW WAY", {
      x: 5.7, y: 2.0, w: 3.6, h: 0.3, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 5, margin: 0
    });
    s.addText("PM → AI → Live", {
      x: 5.7, y: 2.35, w: 3.6, h: 0.5, fontSize: 18, fontFace: "Georgia",
      color: CREAM, bold: true, margin: 0
    });
    s.addText([
      { text: "Describe the screen in plain English",                  options: { bullet: true, breakLine: true } },
      { text: "Drop a screenshot for the vibe",                        options: { bullet: true, breakLine: true } },
      { text: "Claude Code writes the codebase",                       options: { bullet: true, breakLine: true } },
      { text: "Git → GitHub → Vercel deploys it",                      options: { bullet: true, breakLine: true } },
      { text: "Live URL the same afternoon",                           options: { bullet: true } },
    ], {
      x: 5.7, y: 2.95, w: 3.6, h: 1.75, fontSize: 12, fontFace: "Calibri",
      color: CREAM, paraSpaceAfter: 4, margin: 0
    });

    addFooter(s, 3, TOTAL);
  }

  // ==================================================================
  // SLIDE 4 — THE PROJECT (dark)
  // ==================================================================
  {
    const s = pres.addSlide();
    s.background = { color: NAVY };

    // Right side big stat block
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.0, y: 0, w: 4.0, h: 5.625, fill: { color: NAVY2 }, line: { color: NAVY2, width: 0 }
    });
    s.addImage({ data: ic.chess, x: 6.55, y: 0.9, w: 0.5, h: 0.5 });
    s.addText("E4 CHESS ACADEMY", {
      x: 7.1, y: 0.95, w: 3, h: 0.4, fontSize: 11, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 5, valign: "middle", margin: 0
    });
    s.addText("Where champions begin their first move.", {
      x: 6.55, y: 1.6, w: 3.2, h: 1.4, fontSize: 20, fontFace: "Georgia",
      italic: true, color: CREAM, margin: 0
    });
    s.addText("e4chessacademy.com", {
      x: 6.55, y: 3.1, w: 3.2, h: 0.4, fontSize: 13, fontFace: "Consolas",
      color: CYAN, margin: 0
    });
    s.addText("Online chess coaching for kids 5+, taught by FIDE-titled coaches — from anywhere in the world.", {
      x: 6.55, y: 3.55, w: 3.2, h: 1.5, fontSize: 12, fontFace: "Calibri",
      color: CREAM, margin: 0
    });

    // Left content
    s.addText("THE PROJECT", {
      x: 0.6, y: 0.6, w: 4, h: 0.3, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 6, margin: 0
    });
    s.addText("A real business.", {
      x: 0.6, y: 0.95, w: 5.2, h: 0.7, fontSize: 34, fontFace: "Georgia",
      color: CREAM, bold: true, margin: 0
    });
    s.addText("A real domain. A real deadline.", {
      x: 0.6, y: 1.6, w: 5.2, h: 0.7, fontSize: 26, fontFace: "Georgia",
      italic: true, color: CYAN, margin: 0
    });

    s.addText("My friend runs a chess coaching business. He needed a credible landing experience for parents — beginner, intermediate and advanced course pages, a way to capture interest, and a way to reply fast.", {
      x: 0.6, y: 2.55, w: 5.2, h: 1.5, fontSize: 13, fontFace: "Calibri",
      color: CREAM, margin: 0
    });

    // Mini stat row
    const stats = [
      ["3", "Course pages"],
      ["1", "Production domain"],
      ["0", "Lines of code by me"],
    ];
    stats.forEach((st, i) => {
      const x = 0.6 + i * 1.8;
      s.addText(st[0], {
        x, y: 4.05, w: 1.6, h: 0.7, fontSize: 44, fontFace: "Georgia",
        color: GOLD, bold: true, margin: 0
      });
      s.addText(st[1], {
        x, y: 4.7, w: 1.7, h: 0.35, fontSize: 11, fontFace: "Calibri",
        color: CREAM, margin: 0
      });
    });

    addFooter(s, 4, TOTAL, "dark");
  }

  // ==================================================================
  // SLIDE 5 — THE WORKFLOW (light, 6-step grid)
  // ==================================================================
  {
    const s = pres.addSlide();
    s.background = { color: CREAM };

    s.addText("THE WORKFLOW", {
      x: 0.6, y: 0.5, w: 4, h: 0.3, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 6, margin: 0
    });
    s.addText("Six steps. No code.", {
      x: 0.6, y: 0.85, w: 9, h: 0.65, fontSize: 30, fontFace: "Georgia",
      color: NAVY, bold: true, margin: 0
    });
    s.addText("Each step is a prompt to a different tool. The PM stays the PM — the tools do the lifting.", {
      x: 0.6, y: 1.5, w: 8.5, h: 0.4, fontSize: 13, fontFace: "Calibri",
      italic: true, color: MUTED, margin: 0
    });

    const steps = [
      { n: "01", t: "Design",   d: "Figma Make + screenshot trick",  ico: ic.palette },
      { n: "02", t: "Build",    d: "Hand the design to Claude Code", ico: ic.code },
      { n: "03", t: "Ship",     d: "GitHub → Vercel, free & instant", ico: ic.rocket },
      { n: "04", t: "Brand",    d: "Domain from GoDaddy / Hostinger", ico: ic.globe },
      { n: "05", t: "Engage",   d: "AI-agentic WhatsApp integration", ico: ic.whatsapp },
      { n: "06", t: "Capture",  d: "Email + free Supabase database",  ico: ic.database },
    ];

    const gx0 = 0.6, gy0 = 2.05, cw = 2.93, ch = 1.4, gap = 0.12;
    steps.forEach((st, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = gx0 + col * (cw + gap);
      const y = gy0 + row * (ch + gap);

      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cw, h: ch, fill: { color: WHITE },
        line: { color: RULE, width: 0.75 }, shadow: makeShadow()
      });
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 0.08, h: ch, fill: { color: GOLD }, line: { color: GOLD, width: 0 }
      });
      s.addText(st.n, {
        x: x + 0.25, y: y + 0.12, w: 0.6, h: 0.3, fontSize: 10, fontFace: "Calibri",
        color: GOLD, bold: true, charSpacing: 3, margin: 0
      });
      s.addImage({ data: st.ico, x: x + cw - 0.55, y: y + 0.15, w: 0.35, h: 0.35 });
      s.addText(st.t, {
        x: x + 0.25, y: y + 0.45, w: cw - 0.4, h: 0.4, fontSize: 18, fontFace: "Georgia",
        color: NAVY, bold: true, margin: 0
      });
      s.addText(st.d, {
        x: x + 0.25, y: y + 0.88, w: cw - 0.4, h: 0.45, fontSize: 11, fontFace: "Calibri",
        color: MUTED, margin: 0
      });
    });

    addFooter(s, 5, TOTAL);
  }

  // ==================================================================
  // SLIDE 6 — STEP 1 DESIGN (light)
  // ==================================================================
  {
    const s = pres.addSlide();
    s.background = { color: CREAM };

    // Step badge
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 0.55, w: 1.0, h: 0.4, fill: { color: NAVY }, line: { color: NAVY, width: 0 },
      rectRadius: 0.05
    });
    s.addText("STEP 01", {
      x: 0.6, y: 0.55, w: 1.0, h: 0.4, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 4, align: "center", valign: "middle", margin: 0
    });

    s.addText("Design without a designer.", {
      x: 0.6, y: 1.05, w: 9, h: 0.7, fontSize: 30, fontFace: "Georgia",
      color: NAVY, bold: true, margin: 0
    });

    // LEFT — the method
    s.addText("THE METHOD", {
      x: 0.6, y: 1.9, w: 5, h: 0.3, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 5, margin: 0
    });

    const lefts = [
      { ico: ic.figma,  t: "Start in Figma Make (or any AI design tool)",
        d: "Type a prompt that describes the page — hero, sections, mood." },
      { ico: ic.camera, t: "Steal the vibe with a screenshot",
        d: "I loved Whisperflow's fonts and warm tone — I screenshotted it and told the AI to match that aesthetic." },
      { ico: ic.bolt,   t: "Iterate in minutes, not days",
        d: "Re-prompt until the home page, course pages and sections feel right." },
    ];
    lefts.forEach((row, i) => {
      const y = 2.25 + i * 0.95;
      s.addImage({ data: row.ico, x: 0.6, y: y + 0.05, w: 0.34, h: 0.34 });
      s.addText(row.t, {
        x: 1.05, y, w: 4.6, h: 0.4, fontSize: 13, fontFace: "Calibri",
        bold: true, color: NAVY, margin: 0
      });
      s.addText(row.d, {
        x: 1.05, y: y + 0.4, w: 4.6, h: 0.55, fontSize: 11, fontFace: "Calibri",
        color: MUTED, margin: 0
      });
    });

    // RIGHT — the trick / pull-quote card
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.0, y: 1.9, w: 3.4, h: 3.0, fill: { color: NAVY }, line: { color: NAVY, width: 0 },
      shadow: makeShadow()
    });
    s.addText("THE SCREENSHOT TRICK", {
      x: 6.25, y: 2.05, w: 3.0, h: 0.3, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 5, margin: 0
    });
    s.addText("“Match the font and warm palette of this screenshot.”", {
      x: 6.25, y: 2.45, w: 3.0, h: 1.4, fontSize: 18, fontFace: "Georgia",
      italic: true, color: CREAM, margin: 0
    });
    s.addText("That single prompt gave E4CA its cream + navy + gold identity — no Pantone deck, no brand workshop.", {
      x: 6.25, y: 4.0, w: 3.0, h: 0.85, fontSize: 11, fontFace: "Calibri",
      color: CYAN, margin: 0
    });

    addFooter(s, 6, TOTAL);
  }

  // ==================================================================
  // SLIDE 7 — STEP 2 CLAUDE CODE (light)
  // ==================================================================
  {
    const s = pres.addSlide();
    s.background = { color: CREAM };

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 0.55, w: 1.0, h: 0.4, fill: { color: NAVY }, line: { color: NAVY, width: 0 },
      rectRadius: 0.05
    });
    s.addText("STEP 02", {
      x: 0.6, y: 0.55, w: 1.0, h: 0.4, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 4, align: "center", valign: "middle", margin: 0
    });

    s.addText("Hand the design to Claude Code.", {
      x: 0.6, y: 1.05, w: 9, h: 0.7, fontSize: 30, fontFace: "Georgia",
      color: NAVY, bold: true, margin: 0
    });
    s.addText("Same brief I'd give a developer — written in English, dropped into Claude Code in the terminal.", {
      x: 0.6, y: 1.75, w: 9, h: 0.4, fontSize: 14, fontFace: "Calibri",
      italic: true, color: MUTED, margin: 0
    });

    // Mock terminal card on the right
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.55, y: 2.25, w: 3.95, h: 2.65, fill: { color: NAVY }, line: { color: NAVY, width: 0 },
      shadow: makeShadow()
    });
    // 3 dots
    ["FF5F56", "FFBD2E", "27C93F"].forEach((c, i) => {
      s.addShape(pres.shapes.OVAL, {
        x: 5.7 + i * 0.22, y: 2.4, w: 0.14, h: 0.14, fill: { color: c }, line: { color: c, width: 0 }
      });
    });
    s.addText("claude-code  ~/e4ca", {
      x: 6.5, y: 2.36, w: 2.9, h: 0.2, fontSize: 9, fontFace: "Consolas",
      color: CREAM, margin: 0
    });
    s.addText([
      { text: "> claude",                                          options: { color: GOLD,  breakLine: true } },
      { text: "Build a landing page for a chess academy.",         options: { color: CREAM, breakLine: true } },
      { text: "Match the attached design. Three course pages.",   options: { color: CREAM, breakLine: true } },
      { text: "Mobile-first. Cream + navy + gold palette.",       options: { color: CREAM, breakLine: true } },
      { text: " ",                                                 options: { color: CREAM, breakLine: true } },
      { text: "✓ index.html",                                      options: { color: CYAN,  breakLine: true } },
      { text: "✓ beginner.html  intermediate.html  advanced.html", options: { color: CYAN,  breakLine: true } },
      { text: "✓ /images /supabase",                               options: { color: CYAN } },
    ], {
      x: 5.75, y: 2.7, w: 3.6, h: 2.0, fontSize: 11, fontFace: "Consolas",
      margin: 0
    });

    // LEFT — what I actually did
    s.addText("WHAT I HANDED OVER", {
      x: 0.6, y: 2.25, w: 4, h: 0.3, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 5, margin: 0
    });

    const items = [
      "The Figma Make screens (as images)",
      "The screenshot I matched the vibe to",
      "Plain-English copy for each section",
      "A list of pages and what each should do",
    ];
    items.forEach((it, i) => {
      const y = 2.6 + i * 0.45;
      s.addImage({ data: ic.check, x: 0.6, y: y + 0.05, w: 0.22, h: 0.22 });
      s.addText(it, {
        x: 0.92, y, w: 4.4, h: 0.4, fontSize: 13, fontFace: "Calibri",
        color: INK, valign: "middle", margin: 0
      });
    });

    s.addText("Claude Code returned a working multi-page site I could open in the browser.", {
      x: 0.6, y: 4.5, w: 4.8, h: 0.5, fontSize: 12, fontFace: "Calibri",
      italic: true, color: NAVY, bold: true, margin: 0
    });

    addFooter(s, 7, TOTAL);
  }

  // ==================================================================
  // SLIDE 8 — STEP 3 GITHUB + VERCEL (light)
  // ==================================================================
  {
    const s = pres.addSlide();
    s.background = { color: CREAM };

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 0.55, w: 1.0, h: 0.4, fill: { color: NAVY }, line: { color: NAVY, width: 0 },
      rectRadius: 0.05
    });
    s.addText("STEP 03", {
      x: 0.6, y: 0.55, w: 1.0, h: 0.4, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 4, align: "center", valign: "middle", margin: 0
    });

    s.addText("Local code to a live URL.", {
      x: 0.6, y: 1.05, w: 9, h: 0.7, fontSize: 30, fontFace: "Georgia",
      color: NAVY, bold: true, margin: 0
    });

    // Pipeline visualization
    const stages = [
      { ico: ic.code,   t: "Claude Code",  d: "writes the site locally" },
      { ico: ic.github, t: "GitHub",       d: "stores every version" },
      { ico: ic.upload, t: "Vercel",       d: "deploys on every push" },
      { ico: ic.play,   t: "Live URL",     d: "free, HTTPS, instant" },
    ];
    const sx0 = 0.6, sy = 2.15, sw = 2.0, sh = 2.0, gap = 0.25;
    stages.forEach((st, i) => {
      const x = sx0 + i * (sw + gap);
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: sy, w: sw, h: sh, fill: { color: WHITE },
        line: { color: RULE, width: 0.75 }, shadow: makeShadow()
      });
      s.addImage({ data: st.ico, x: x + sw/2 - 0.25, y: sy + 0.25, w: 0.5, h: 0.5 });
      s.addText(st.t, {
        x: x + 0.1, y: sy + 0.9, w: sw - 0.2, h: 0.4, fontSize: 16, fontFace: "Georgia",
        bold: true, color: NAVY, align: "center", margin: 0
      });
      s.addText(st.d, {
        x: x + 0.1, y: sy + 1.3, w: sw - 0.2, h: 0.6, fontSize: 11, fontFace: "Calibri",
        color: MUTED, align: "center", margin: 0
      });
      if (i < stages.length - 1) {
        s.addImage({
          data: ic.arrow,
          x: x + sw + 0.02, y: sy + sh/2 - 0.13, w: 0.22, h: 0.22
        });
      }
    });

    // Bottom note
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 4.4, w: 8.85, h: 0.6, fill: { color: WHITE },
      line: { color: RULE, width: 0.75 }
    });
    s.addImage({ data: ic.bolt, x: 0.78, y: 4.51, w: 0.32, h: 0.32 });
    s.addText("Once Git + GitHub + Vercel are wired once, every Claude Code change is one push away from being live.", {
      x: 1.2, y: 4.4, w: 8.1, h: 0.6, fontSize: 12, fontFace: "Calibri",
      color: INK, valign: "middle", margin: 0
    });

    addFooter(s, 8, TOTAL);
  }

  // ==================================================================
  // SLIDE 9 — STEP 4 DOMAIN (light)
  // ==================================================================
  {
    const s = pres.addSlide();
    s.background = { color: CREAM };

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 0.55, w: 1.0, h: 0.4, fill: { color: NAVY }, line: { color: NAVY, width: 0 },
      rectRadius: 0.05
    });
    s.addText("STEP 04", {
      x: 0.6, y: 0.55, w: 1.0, h: 0.4, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 4, align: "center", valign: "middle", margin: 0
    });

    s.addText("Give it a name people can type.", {
      x: 0.6, y: 1.05, w: 9, h: 0.7, fontSize: 30, fontFace: "Georgia",
      color: NAVY, bold: true, margin: 0
    });

    // Left — copy
    s.addText("A free Vercel URL is great for testing — terrible on a business card. A custom domain makes the site feel like a real business.", {
      x: 0.6, y: 1.95, w: 5.2, h: 1.0, fontSize: 14, fontFace: "Calibri",
      color: INK, margin: 0
    });

    s.addText("WHERE I BOUGHT", {
      x: 0.6, y: 3.05, w: 5, h: 0.3, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 5, margin: 0
    });

    const regs = [
      { name: "GoDaddy",   d: "Familiar, easy DNS UI" },
      { name: "Hostinger", d: "Cheaper renewals, fast support" },
    ];
    regs.forEach((r, i) => {
      const y = 3.4 + i * 0.5;
      s.addImage({ data: ic.dot, x: 0.6, y: y + 0.1, w: 0.14, h: 0.14 });
      s.addText(r.name, {
        x: 0.85, y, w: 1.5, h: 0.4, fontSize: 13, fontFace: "Calibri",
        bold: true, color: NAVY, valign: "middle", margin: 0
      });
      s.addText(r.d, {
        x: 2.3, y, w: 3.5, h: 0.4, fontSize: 12, fontFace: "Calibri",
        color: MUTED, valign: "middle", margin: 0
      });
    });

    // Right — domain card
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.05, y: 1.95, w: 3.4, h: 3.0, fill: { color: WHITE },
      line: { color: RULE, width: 0.75 }, shadow: makeShadow()
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.05, y: 1.95, w: 3.4, h: 0.55, fill: { color: NAVY }, line: { color: NAVY, width: 0 }
    });
    ["FF5F56", "FFBD2E", "27C93F"].forEach((c, i) => {
      s.addShape(pres.shapes.OVAL, {
        x: 6.2 + i * 0.22, y: 2.13, w: 0.14, h: 0.14, fill: { color: c }, line: { color: c, width: 0 }
      });
    });
    s.addImage({ data: ic.globe, x: 6.25, y: 2.75, w: 0.4, h: 0.4 });
    s.addText("e4chessacademy.com", {
      x: 6.25, y: 3.25, w: 3.0, h: 0.55, fontSize: 18, fontFace: "Consolas",
      bold: true, color: NAVY, margin: 0
    });
    s.addText("Point the A / CNAME record at Vercel.\nClaude Code can even walk you through the DNS values.", {
      x: 6.25, y: 3.85, w: 3.0, h: 0.95, fontSize: 11, fontFace: "Calibri",
      color: MUTED, margin: 0
    });

    addFooter(s, 9, TOTAL);
  }

  // ==================================================================
  // SLIDE 10 — STEP 5 WHATSAPP (light)
  // ==================================================================
  {
    const s = pres.addSlide();
    s.background = { color: CREAM };

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 0.55, w: 1.0, h: 0.4, fill: { color: NAVY }, line: { color: NAVY, width: 0 },
      rectRadius: 0.05
    });
    s.addText("STEP 05", {
      x: 0.6, y: 0.55, w: 1.0, h: 0.4, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 4, align: "center", valign: "middle", margin: 0
    });

    s.addText("An AI agent in WhatsApp.", {
      x: 0.6, y: 1.05, w: 9, h: 0.7, fontSize: 30, fontFace: "Georgia",
      color: NAVY, bold: true, margin: 0
    });
    s.addText("Parents already live in WhatsApp. So the academy should answer there — 24/7, in the parent's tone.", {
      x: 0.6, y: 1.75, w: 9, h: 0.4, fontSize: 13, fontFace: "Calibri",
      italic: true, color: MUTED, margin: 0
    });

    // LEFT — bullets
    s.addText("WHAT IT DOES", {
      x: 0.6, y: 2.25, w: 5, h: 0.3, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 5, margin: 0
    });
    const features = [
      { t: "Replies to course questions",      d: "Beginner vs advanced, age groups, schedule." },
      { t: "Qualifies interest",                d: "Asks the right questions before passing on." },
      { t: "Hands off to a human cleanly",      d: "Logs the conversation, pings the coach." },
    ];
    features.forEach((f, i) => {
      const y = 2.65 + i * 0.7;
      s.addImage({ data: ic.whatsapp, x: 0.6, y: y + 0.05, w: 0.3, h: 0.3 });
      s.addText(f.t, {
        x: 1.0, y, w: 4.4, h: 0.35, fontSize: 13, fontFace: "Calibri",
        bold: true, color: NAVY, margin: 0
      });
      s.addText(f.d, {
        x: 1.0, y: y + 0.35, w: 4.4, h: 0.35, fontSize: 11, fontFace: "Calibri",
        color: MUTED, margin: 0
      });
    });

    // RIGHT — mock chat
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 6.0, y: 2.15, w: 3.45, h: 2.85, fill: { color: WHITE },
      line: { color: RULE, width: 0.75 }, shadow: makeShadow(), rectRadius: 0.08
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.0, y: 2.15, w: 3.45, h: 0.5, fill: { color: "075E54" }, line: { color: "075E54", width: 0 }
    });
    s.addImage({ data: ic.whatsapp, x: 6.15, y: 2.27, w: 0.26, h: 0.26 });
    s.addText("E4 Chess Academy  ·  online", {
      x: 6.5, y: 2.18, w: 2.9, h: 0.45, fontSize: 11, fontFace: "Calibri",
      color: CREAM, valign: "middle", bold: true, margin: 0
    });

    // user bubble
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 6.85, y: 2.85, w: 2.45, h: 0.45, fill: { color: "DCF8C6" }, line: { color: "DCF8C6", width: 0 },
      rectRadius: 0.08
    });
    s.addText("Do you teach 7-year-olds?", {
      x: 6.95, y: 2.85, w: 2.3, h: 0.45, fontSize: 10, fontFace: "Calibri",
      color: INK, valign: "middle", margin: 0
    });
    // bot bubble
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 6.15, y: 3.4, w: 2.8, h: 0.85, fill: { color: CREAM2 }, line: { color: CREAM2, width: 0 },
      rectRadius: 0.08
    });
    s.addText("Yes! Our Beginner track starts at 5. Would you like me to share the schedule and fees?", {
      x: 6.25, y: 3.42, w: 2.6, h: 0.82, fontSize: 10, fontFace: "Calibri",
      color: INK, margin: 0
    });
    // user bubble 2
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 7.55, y: 4.35, w: 1.75, h: 0.45, fill: { color: "DCF8C6" }, line: { color: "DCF8C6", width: 0 },
      rectRadius: 0.08
    });
    s.addText("Yes please ✓", {
      x: 7.65, y: 4.35, w: 1.6, h: 0.45, fontSize: 10, fontFace: "Calibri",
      color: INK, valign: "middle", margin: 0
    });

    addFooter(s, 10, TOTAL);
  }

  // ==================================================================
  // SLIDE 11 — STEP 6 EMAIL + DATABASE (light, two cards)
  // ==================================================================
  {
    const s = pres.addSlide();
    s.background = { color: CREAM };

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 0.55, w: 1.0, h: 0.4, fill: { color: NAVY }, line: { color: NAVY, width: 0 },
      rectRadius: 0.05
    });
    s.addText("STEP 06", {
      x: 0.6, y: 0.55, w: 1.0, h: 0.4, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 4, align: "center", valign: "middle", margin: 0
    });

    s.addText("Capture every lead. For free.", {
      x: 0.6, y: 1.05, w: 9, h: 0.7, fontSize: 30, fontFace: "Georgia",
      color: NAVY, bold: true, margin: 0
    });
    s.addText("Two integrations Claude Code wired in for me — and I never opened a backend dashboard.", {
      x: 0.6, y: 1.75, w: 9, h: 0.4, fontSize: 13, fontFace: "Calibri",
      italic: true, color: MUTED, margin: 0
    });

    // EMAIL card
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 2.3, w: 4.3, h: 2.7, fill: { color: WHITE },
      line: { color: RULE, width: 0.75 }, shadow: makeShadow()
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 2.3, w: 0.08, h: 2.7, fill: { color: CYAN }, line: { color: CYAN, width: 0 }
    });
    s.addImage({ data: ic.envelope, x: 0.85, y: 2.5, w: 0.4, h: 0.4 });
    s.addText("EMAIL NOTIFICATIONS", {
      x: 1.35, y: 2.5, w: 3.4, h: 0.4, fontSize: 10, fontFace: "Calibri",
      color: CYAN, bold: true, charSpacing: 5, valign: "middle", margin: 0
    });
    s.addText("New query → straight to inbox", {
      x: 0.85, y: 3.0, w: 3.9, h: 0.45, fontSize: 16, fontFace: "Georgia",
      bold: true, color: NAVY, margin: 0
    });
    s.addText("A parent submits the contact form on any course page. Their details land in the working email within seconds — no manual export, no dashboard to check.", {
      x: 0.85, y: 3.5, w: 3.9, h: 1.45, fontSize: 11, fontFace: "Calibri",
      color: INK, margin: 0
    });

    // DATABASE card
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.15, y: 2.3, w: 4.3, h: 2.7, fill: { color: WHITE },
      line: { color: RULE, width: 0.75 }, shadow: makeShadow()
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.15, y: 2.3, w: 0.08, h: 2.7, fill: { color: GOLD }, line: { color: GOLD, width: 0 }
    });
    s.addImage({ data: ic.database, x: 5.4, y: 2.5, w: 0.4, h: 0.4 });
    s.addText("FREE DATABASE", {
      x: 5.9, y: 2.5, w: 3.4, h: 0.4, fontSize: 10, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 5, valign: "middle", margin: 0
    });
    s.addText("Every lead, stored safely", {
      x: 5.4, y: 3.0, w: 3.9, h: 0.45, fontSize: 16, fontFace: "Georgia",
      bold: true, color: NAVY, margin: 0
    });
    s.addText("Supabase holds every submission so we can follow up, segment by interest level, and never lose a parent who reached out.", {
      x: 5.4, y: 3.5, w: 3.9, h: 1.45, fontSize: 11, fontFace: "Calibri",
      color: INK, margin: 0
    });

    addFooter(s, 11, TOTAL);
  }

  // ==================================================================
  // SLIDE 12 — TAKEAWAY (dark, closing)
  // ==================================================================
  {
    const s = pres.addSlide();
    s.background = { color: NAVY };

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 0.3, h: 5.625, fill: { color: GOLD }, line: { color: GOLD, width: 0 }
    });

    s.addText("THE TAKEAWAY", {
      x: 0.8, y: 0.85, w: 8, h: 0.35, fontSize: 11, fontFace: "Calibri",
      color: GOLD, bold: true, charSpacing: 8, margin: 0
    });

    s.addText("The bottleneck moved.", {
      x: 0.8, y: 1.3, w: 9, h: 0.85, fontSize: 40, fontFace: "Georgia",
      color: CREAM, bold: true, margin: 0
    });
    s.addText("It used to be the developer.", {
      x: 0.8, y: 2.15, w: 9, h: 0.65, fontSize: 26, fontFace: "Georgia",
      italic: true, color: CYAN, margin: 0
    });
    s.addText("Now it's the clarity of the brief.", {
      x: 0.8, y: 2.75, w: 9, h: 0.65, fontSize: 26, fontFace: "Georgia",
      italic: true, color: CYAN, margin: 0
    });

    // Three takeaways
    const taks = [
      { t: "Stay a PM",       d: "Describe outcomes, not syntax." },
      { t: "Use real tools",  d: "Figma Make · Claude Code · Vercel · Supabase." },
      { t: "Ship the same day", d: "Idea in the morning, live URL by evening." },
    ];
    taks.forEach((t, i) => {
      const x = 0.8 + i * 3.0;
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: 3.75, w: 2.85, h: 1.05, fill: { color: NAVY2 }, line: { color: NAVY2, width: 0 }
      });
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: 3.75, w: 0.06, h: 1.05, fill: { color: GOLD }, line: { color: GOLD, width: 0 }
      });
      s.addText(t.t, {
        x: x + 0.18, y: 3.82, w: 2.6, h: 0.4, fontSize: 14, fontFace: "Georgia",
        bold: true, color: CREAM, margin: 0
      });
      s.addText(t.d, {
        x: x + 0.18, y: 4.2, w: 2.6, h: 0.65, fontSize: 11, fontFace: "Calibri",
        color: CREAM, margin: 0
      });
    });

    s.addText("Live site → e4chessacademy.com", {
      x: 0.8, y: 5.05, w: 9, h: 0.3, fontSize: 11, fontFace: "Consolas",
      color: GOLD, margin: 0
    });

    s.addText(`${TOTAL} / ${TOTAL}`, {
      x: 8.7, y: 5.25, w: 0.8, h: 0.3, fontSize: 9, fontFace: "Calibri",
      color: CREAM, align: "right", margin: 0
    });
  }

  await pres.writeFile({ fileName: "/Users/jay/Documents/E4CA/deck/E4CA-Claude-Code-Case-Study.pptx" });
  console.log("WROTE /Users/jay/Documents/E4CA/deck/E4CA-Claude-Code-Case-Study.pptx");
})();
