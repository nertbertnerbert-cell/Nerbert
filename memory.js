const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const memoryFile = path.join(dataDir, "memory.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(memoryFile)) {
  fs.writeFileSync(
    memoryFile,
    JSON.stringify({
      conversations: [],
      memories: [],
      projects: []
    }, null, 2)
  );
}

function load() {
  return JSON.parse(fs.readFileSync(memoryFile, "utf8"));
}

function save(data) {
  fs.writeFileSync(
    memoryFile,
    JSON.stringify(data, null, 2)
  );
}

function saveConversation(role, message) {
  const data = load();

  data.conversations.push({
    role,
    message,
    created_at: new Date().toISOString()
  });

  save(data);
}

function getRecentConversations(limit = 20) {
  const data = load();

  return data.conversations.slice(-limit);
}

function saveMemory(category, content) {
  const data = load();

  data.memories.push({
    category,
    content,
    created_at: new Date().toISOString()
  });

  save(data);
}

function getMemories(limit = 50) {
  const data = load();

  return data.memories.slice(-limit).reverse();
}

function createProject(name, description = "") {
  const data = load();

  const project = {
    id: Date.now(),
    name,
    description,
    created_at: new Date().toISOString()
  };

  data.projects.push(project);

  save(data);

  return project;
}

function getProjects() {
  const data = load();

  return data.projects;
}

module.exports = {
  saveConversation,
  getRecentConversations,
  saveMemory,
  getMemories,
  createProject,
  getProjects
};
