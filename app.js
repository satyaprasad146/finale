const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

let intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log("DB Error:${e.message}");
    process.exit(1);
  }
};

intializeDBAndServer();

// API 1
app.get("/movies/", async (request, response) => {
  try {
    let query = `SELECT movie_name FROM movie`;
    let data = await db.all(query);
    let res = [];
    for (let each of data) {
      let objecta = {
        movieName: each.movie_name,
      };
      res.push(objecta);
    }
    response.send(res);
  } catch (e) {
    console.log(e.message);
  }
});

//API 2
app.post("/movies/", async (request, response) => {
  try {
    let newMovie = request.body;
    let { directorId, movieName, leadActor } = newMovie;
    let movieQuery = `INSERT INTO
                                movie(director_id,movie_name,lead_actor)
                                VALUES("${directorId}","${movieName}","${leadActor}")`;
    console.log(movieQuery);
    let sendMovie = await db.run(movieQuery);
    response.send("Movie Successfully Added");
  } catch (e) {
    console.log(e.message);
  }
});

//API 3
app.get("/movies/:movieId/", async (req, res) => {
  let { movieId } = req.params;
  let getQuery = `SELECT * FROM movie WHERE movie_id =${movieId}`;
  let data = await db.get(getQuery);
  console.log(data);
  let result = {
    movieId: data.movie_id,
    directorId: data.director_id,
    movieName: data.movie_name,
    leadActor: data.lead_actor,
  };
  res.send(result);
});

// API 4
app.put("/movies/:movieId/", async (req, res) => {
  let { movieId } = req.params;
  let modifyData = req.body;
  let { directorId, movieName, leadActor } = modifyData;
  let query = `UPDATE movie SET director_id = "${directorId}",
                                                    movie_name ="${movieName}",
                                                    lead_actor = "${leadActor}"
                                                WHERE movie_id = "${movieId}"`;
  let data = await db.run(query);
  res.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (req, res) => {
  let { movieId } = req.params;
  let query = `DELETE FROM movie WHERE movie_id=${movieId}`;
  let operation = await db.run(query);
  res.send("Movie Removed");
});

//API 6
app.get("/directors/", async (req, res) => {
  let query = `SELECT * FROM director`;
  let result = await db.all(query);
  let directorArray = [];
  for (let each of result) {
    let directorObject = {
      directorId: each.director_id,
      directorName: each.director_name,
    };
    directorArray.push(directorObject);
  }
  res.send(directorArray);
});

app.get("/directors/:directorId/movies/", async (req, res) => {
  let { directorId } = req.params;

  let query = `SELECT movie_name
                  FROM movie
                  WHERE director_id = ${directorId}`;
  let data = await db.all(query);
  let result = [];
  for (let each of data) {
    let objecta = { movieName: each.movie_name };
    result.push(objecta);
  }
  res.send(result);
});

module.exports = app;
