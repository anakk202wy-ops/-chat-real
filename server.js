const express = require("express");
const http = require("http");
const crypto = require("crypto");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Demo-ready in-memory storage.
// For permanent messages after server restarts, replace this Map with a database.
const rooms = new Map();

app.use(express.static("public"));

function roomId() {
  return crypto.randomBytes(4).toString("hex");
}

function cleanText(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function getRoom(id) {
  if (!rooms.has(id)) {
    rooms.set(id, { messages: [], users: new Map() });
  }
  return rooms.get(id);
}

io.on("connection", (socket) => {
  socket.on("create-room", ({ name }, callback) => {
    const id = roomId();
    const room = getRoom(id);
    const username = cleanText(name, 30) || "Visitante";
    room.users.set(socket.id, username);
    socket.join(id);
    socket.data.roomId = id;
    socket.data.username = username;
    callback?.({ ok: true, roomId: id, username });
    io.to(id).emit("system", `${username} criou a sala.`);
    io.to(id).emit("presence", room.users.size);
  });

  socket.on("join-room", ({ roomId: id, name }, callback) => {
    id = cleanText(id, 20);
    const room = rooms.get(id);
    if (!room) return callback?.({ ok: false, error: "Essa sala não existe ou ainda não foi criada." });

    const username = cleanText(name, 30) || "Visitante";
    room.users.set(socket.id, username);
    socket.join(id);
    socket.data.roomId = id;
    socket.data.username = username;

    callback?.({ ok: true, roomId: id, username, messages: room.messages });
    socket.to(id).emit("system", `${username} entrou na sala.`);
    io.to(id).emit("presence", room.users.size);
  });

  socket.on("message", (raw) => {
    const id = socket.data.roomId;
    if (!id || !rooms.has(id)) return;

    const text = cleanText(raw);
    if (!text) return;

    const message = {
      id: crypto.randomUUID(),
      user: socket.data.username || "Visitante",
      text,
      time: new Date().toISOString()
    };

    const room = rooms.get(id);
    room.messages.push(message);
    if (room.messages.length > 200) room.messages.shift();

    io.to(id).emit("message", message);
  });

  socket.on("typing", (isTyping) => {
    const id = socket.data.roomId;
    if (id) socket.to(id).emit("typing", {
      user: socket.data.username || "Alguém",
      isTyping: Boolean(isTyping)
    });
  });

  socket.on("disconnect", () => {
    const id = socket.data.roomId;
    if (!id || !rooms.has(id)) return;
    const room = rooms.get(id);
    const username = room.users.get(socket.id);
    room.users.delete(socket.id);
    if (username) socket.to(id).emit("system", `${username} saiu da sala.`);
    io.to(id).emit("presence", room.users.size);

    // Keep empty rooms available so an invitation link can still work.
    // A production database should handle room persistence.
  });
});

server.listen(PORT, () => {
  console.log(`Chat Real rodando em http://localhost:${PORT}`);
});