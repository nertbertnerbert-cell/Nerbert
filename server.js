require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");


const {
  saveConversation,
  getRecentConversations,
  saveMemory,
  getMemories,
  createProject,
  getProjects
} = require("./memory");

const app = express();
const PORT = 3000;

const profilePath = path.join(__dirname, "profile.json");

let profile = {
  name: "Nerbert"
};

if (fs.existsSync(profilePath)) {
  try {
    profile = JSON.parse(
      fs.readFileSync(profilePath, "utf8")
    );
  } catch (error) {
    console.log("⚠️ Could not read profile.json");
  }
}

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(express.static(path.join(__dirname, "public")));
/* WEB SEARCH */

/* WEB SEARCH */

app.get("/api/search", async (req, res) => {

  const query = req.query.q;

  if (!query) {
    return res.status(400).json({
      error: "Search query is required."
    });
  }

  try {

    const url =
      "https://html.duckduckgo.com/html/?q=" +
      encodeURIComponent(query);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml"
      }
    });

    if (!response.ok) {
      throw new Error(
        "Search service returned HTTP " +
        response.status
      );
    }

    const html = await response.text();

    const results = [];

    const blocks =
      html.split('class="result results_links');

    for (let i = 1; i < blocks.length; i++) {

      const block = blocks[i];

      const titleMatch =
        block.match(
          /class="result__a"[^>]*>([\s\S]*?)<\/a>/
        );

      const urlMatch =
        block.match(
          /class="result__a"[^>]*href="([^"]+)"/
        );

      const descriptionMatch =
        block.match(
          /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/
        ) ||
        block.match(
          /class="result__snippet"[^>]*>([\s\S]*?)<\/div>/
        );

      if (titleMatch && urlMatch) {

        const clean = (text) =>
          text
            .replace(/<[^>]+>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .trim();

        results.push({
          title: clean(titleMatch[1]),
          url: urlMatch[1],
          description:
            descriptionMatch
              ? clean(descriptionMatch[1])
              : ""
        });

      }

      if (results.length >= 8) {
        break;
      }

    }

    res.json({
      query,
      results
    });

  } catch (error) {

    console.error("Search error:", error);

    res.status(500).json({
      error: "Web search failed.",
      details: error.message
    });

  }

});

/* SERVER START */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 NERBERT AI server running on port ${PORT}`);
});

  console.log("");
  console.log("🤖 NERBERT AI");
  console.log("━━━━━━━━━━━━━━━━━━━━");
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log("🧠 Memory: ONLINE");
  console.log("👤 Profile: ONLINE");
  console.log("🌦️ Weather: ONLINE");
  console.log("🌐 Web Search: ONLINE");
  console.log("📁 Projects: ONLINE");
  console.log("━━━━━━━━━━━━━━━━━━━━");


/* =========================
   NERBERT CORE API
========================= */

/* STATUS */

app.get("/api/status", (req, res) => {

  res.json({
    name: "NERBERT AI",
    status: "online",
    version: "1.0.0",
    memory: "online",
    ai: "local-mode"
  });

});


/* PROFILE */

app.get("/api/profile", (req, res) => {

  try {

    const profilePath =
      path.join(__dirname, "profile.json");

    if (!fs.existsSync(profilePath)) {
      return res.json({
        name: "Nerbert"
      });
    }

    const profile =
      JSON.parse(
        fs.readFileSync(profilePath, "utf8")
      );

    res.json(profile);

  } catch (error) {

    console.error("Profile error:", error);

    res.status(500).json({
      error: "Could not load profile."
    });

  }

});


/* WEATHER */

app.get("/api/weather", async (req, res) => {

  const city =
    req.query.city || "Lusaka";

  try {

    const response = await fetch(
      "https://wttr.in/" +
      encodeURIComponent(city) +
      "?format=j1"
    );

    if (!response.ok) {
      throw new Error(
        "Weather service returned " +
        response.status
      );
    }

    const data = await response.json();

    const current =
      data.current_condition?.[0];

    if (!current) {
      throw new Error(
        "No weather data returned."
      );
    }

    res.json({
      city,
      temperature:
        current.temp_C,
      feelsLike:
        current.FeelsLikeC,
      humidity:
        current.humidity,
      wind:
        current.windspeedKmph,
      description:
        current.weatherDesc?.[0]?.value || ""
    });

  } catch (error) {

    console.error(
      "Weather error:",
      error.message
    );

    res.status(500).json({
      error: "Weather request failed."
    });

  }

});


/* CHAT — LOCAL MODE */

app.post("/api/chat", async (req, res) => {

  const message =
    String(req.body?.message || "").trim();

  if (!message) {

    return res.status(400).json({
      error: "Message is required."
    });

  }

  try {

    let reply;

    const lower =
      message.toLowerCase();

    if (
      lower.includes("my name") ||
      lower.includes("what is my name")
    ) {

      reply =
        "Your name is Nerbert. 🧠";

    } else if (
      lower.includes("who are you")
    ) {

      reply =
        "I'm NERBERT AI, your personal assistant. 🤖";

    } else if (
      lower.includes("hello") ||
      lower.includes("hi")
    ) {

      reply =
        "Hello Nerbert! 👋 I'm here and running in Local Mode.";

    } else {

      reply =
        "I'm NERBERT AI. I'm currently running in Local Mode because the external AI service has no credits. I can still use my local tools such as memory, weather and web search. 🧠🌐";

    }

    res.json({
      reply,
      mode: "local"
    });

  } catch (error) {

    console.error(
      "Chat error:",
      error
    );

    res.status(500).json({
      error: "Local chat failed."
    });

  }

});
