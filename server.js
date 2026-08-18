const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const musicDir = path.join(__dirname, "music");
const videoDir = path.join(__dirname, "videos");
const publicDir = path.join(__dirname, "public");

for (const dir of [musicDir, videoDir, publicDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

const musicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, musicDir);
  },

  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, Date.now() + "-" + safeName);
  }
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoDir);
  },

  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, Date.now() + "-" + safeName);
  }
});

const uploadMusic = multer({ storage: musicStorage });
const uploadVideo = multer({ storage: videoStorage });

app.get("/songs", (req, res) => {
  try {
    const files = fs.readdirSync(musicDir);

    const songs = files
      .filter(file => /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file))
      .map(file => ({
        name: file,
        url: "/music/" + encodeURIComponent(file)
      }));

    res.json(songs);
  } catch (error) {
    res.status(500).json({
      error: "Could not load music library"
    });
  }
});

app.get("/videos", (req, res) => {
  try {
    const files = fs.readdirSync(videoDir);

    const videos = files
      .filter(file => /\.(mp4|webm|mkv|mov|m4v|3gp)$/i.test(file))
      .map(file => ({
        name: file,
        url: "/videos/" + encodeURIComponent(file)
      }));

    res.json(videos);
  } catch (error) {
    res.status(500).json({
      error: "Could not load video library"
    });
  }
});

app.post("/upload", uploadMusic.single("song"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "No song uploaded"
    });
  }

  res.json({
    message: "Song uploaded successfully",
    song: req.file.filename
  });
});

app.post("/upload-video", uploadVideo.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "No video uploaded"
    });
  }

  res.json({
    message: "Video uploaded successfully",
    video: req.file.filename
  });
});

app.use("/music", express.static(musicDir));
app.use("/videos", express.static(videoDir));

app.get("/health", (req, res) => {
  res.json({
    app: "Nerbert Music",
    mode: "offline",
    status: "ready"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("================================");
  console.log("       NERBERT MUSIC");
  console.log("       MUSIC + VIDEO");
  console.log("       OFFLINE PLAYER");
  console.log("================================");
  console.log("");
  console.log("http://localhost:" + PORT);
  console.log("");
});
