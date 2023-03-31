const express = require("express");
const cron = require("node-cron");
const teams = require("./Collections/teams");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const collectionService = require("./Collections/Service");
const Teams = require("./Collections/Model");
const cheerio = require("cheerio");
require("dotenv").config();
const app = express();
mongoose.set("strictQuery", true);
const PORT = process.env.PORT;

const createTeam = async (team) => {
  if (
    (await Teams.findOne({ teamName: team.teamName, phase: team.phase })) ==
    null
  ) {
    collectionService.createRecord(team);
  } else {
    await Teams.findOneAndUpdate(
      {
        teamName: team.teamName,
        phase: team.phase,
      },
      team,
      {
        new: true,
        runValidators: true,
      }
    );
  }
};

const scrapeData = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    const data = [];
    for (let j = 1396; j <= 1406; j = j + 10) {
      if (j == 1396) {
        for (let i = 1883; i <= 1884; i++) {
          await page.goto(
            `https://baschet.ro/liga-nationala-de-baschet-masculin/clasament?faza=${j}&grupa=${i}`
          );
          const html = await page.evaluate(() => document.body.innerHTML);
          const $ = await cheerio.load(html);
          const phase = "1";
          let group;
          if (i === 1883) {
            group = "A";
          } else {
            group = "B";
          }
          $(".tab-pane.fade.active.show > table > tbody > tr").each(
            (i, element) => {
              const ranking = $(element)
                .find("td.place")
                .text()
                .replace(".", " ")
                .trim();
              const teamName = $(
                $($(element).find("td.team")).find("img")
              ).attr("alt");
              const smallTeamName = $($(element).find("td.team"))
                .find("img")
                .attr("alt")
                .toLowerCase()
                .replace(" ", "")
                .replace(" ", "")
                .replace("-", "")
                .replace(/["]/g, "")
                .replace("constanța", "")
                .replace(" ", "");
              const teamLink = $($($(element).find("td.team")).find("a")).attr(
                "href"
              );
              const matchesPlayed = $(element).find("td:nth-child(3)").text();
              const winnedMatches = $(element).find("td:nth-child(4)").text();
              const lostMatches = $(element).find("td:nth-child(5)").text();
              const pts = $(element).find("td:nth-child(7)").text();
              const team = {
                phase,
                group,
                ranking,
                teamName,
                smallTeamName,
                teamLink,
                matchesPlayed,
                winnedMatches,
                lostMatches,
                pts,
              };
              data.push(team);
              createTeam(team);
            }
          );
        }
      } else if (j == 1406) {
        for (let i = 1893; i <= 1894; i++) {
          await page.goto(
            `https://baschet.ro/liga-nationala-de-baschet-masculin/clasament?faza=${j}&grupa=${i}`
          );
          const html = await page.evaluate(() => document.body.innerHTML);
          const $ = await cheerio.load(html);
          const phase = "2";
          if (i === 1893) {
            group = "1-10";
          } else {
            group = "11-19";
          }
          $(".tab-pane.fade.active.show > table > tbody > tr").each(
            (i, element) => {
              const ranking = $(element)
                .find("td.place")
                .text()
                .replace(".", " ")
                .trim();
              const teamName = $(
                $($(element).find("td.team")).find("img")
              ).attr("alt");
              const smallTeamName = $($(element).find("td.team"))
                .find("img")
                .attr("alt")
                .toLowerCase()
                .replace(" ", "")
                .replace(" ", "")
                .replace("-", "")
                .replace(/["]/g, "")
                .replace("constanța", "")
                .replace(" ", "");
              const teamLink = $($($(element).find("td.team")).find("a")).attr(
                "href"
              );
              const matchesPlayed = $(element).find("td:nth-child(3)").text();
              const winnedMatches = $(element).find("td:nth-child(4)").text();
              const lostMatches = $(element).find("td:nth-child(5)").text();
              const pts = $(element).find("td:nth-child(7)").text();
              const team = {
                phase,
                group,
                ranking,
                teamName,
                smallTeamName,
                teamLink,
                matchesPlayed,
                winnedMatches,
                lostMatches,
                pts,
              };
              data.push(team);
              createTeam(team);
            }
          );
        }
      }
    }
    // console.log(data);
    return data;
  } catch (err) {
    console.error(err);
  }
};

async function main() {
  await scrapeData();
}

const initRoutes = () => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    next();
  });
  app.use(express.json());
  app.use("/api/v1/teams", teams);
};

const startServer = () => {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
};

const database = () => {
  mongoose.connect(process.env.MONGO_URI, () =>
    console.log("Connected to Database")
  );
};

app.get("/", (req, res) => {
  res.send("Standings");
});

const startApp = () => {
  startServer();
  database();
  initRoutes();
};
main();

cron.schedule("0 1 * * *", main, {});

startApp();
