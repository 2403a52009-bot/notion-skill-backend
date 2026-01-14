const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");
const express = require("express");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

const DATABASE_ID = "2e7f8b78034980df850dc0ded1ccdec7";
const NOTION_TOKEN = process.env.NOTION_TOKEN;

if (!NOTION_TOKEN) {
  throw new Error("NOTION_TOKEN is missing");
}

app.get("/skills", async (req, res) => {
  const response = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: "{}"
    }
  );

  const data = await response.json();
  const skills = {};

  data.results.forEach(page => {
    const props = page.properties;

    const skill = props.Skill?.select?.name;
    const scored = props.Scored?.number;
    const full = props["Full Marks"]?.number;

    if (!skill || scored == null || full == null) return;

    if (!skills[skill]) {
      skills[skill] = { scored: 0, full: 0 };
    }

    skills[skill].scored += scored;
    skills[skill].full += full;
  });

  res.json(skills);
});

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}/skills`);
});
