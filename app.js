const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY 
    player_id`;
  const PlayersArray = await db.all(getPlayersQuery);
  response.send(PlayersArray);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createPlayerQuery = `
      INSERT INTO 
      cricket_team(player_name,jersey_number,role)
      VALUES('${playerName}',${jerseyNumber},'${role}')`;
  const dbResponse = await db.run(createPlayerQuery);
  const player_id = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE 
    player_id=${playerId} `;
  const Player = await db.get(getPlayerQuery);
  response.send(Player);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE 
    cricket_team
    SET 
    player_name='${playerName}',jersey_number=${jerseyNumber},role='${role}'
    WHERE 
    player_id=${playerId}`;
  const put = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM 
    cricket_team
    WHERE 
    player_id=${playerId}`;
  const del = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
