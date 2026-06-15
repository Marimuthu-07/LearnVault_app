import fs from "fs";
import path from "path";
import { User, Topic, Difficulty, Status } from "../src/types";

// Database storage location
const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.resolve(DATA_DIR, "learnvault_db.json");

// Define schema interfaces
interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> hashedPassword
  topics: Topic[];
}

// Initial default database structure
const DEFAULT_DB: DatabaseSchema = {
  users: [],
  passwords: {},
  topics: []
};

// Safe read / write utilities with directory creation
function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
  }
}

function readDb(): DatabaseSchema {
  initDb();
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read database file, resetting to empty", err);
    return { ...DEFAULT_DB };
  }
}

function writeDb(data: DatabaseSchema): void {
  initDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write database file", err);
  }
}

// User model operations
export const UserModel = {
  async findById(id: string): Promise<User | null> {
    const db = readDb();
    const user = db.users.find((u) => u.id === id);
    return user || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const db = readDb();
    const user = db.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    return user || null;
  },

  async create(userData: Omit<User, "id" | "streak" | "createdAt">, passwordHash: string): Promise<User> {
    const db = readDb();
    
    // Check for duplicates
    if (db.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error("Email already registered");
    }
    if (db.users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
      throw new Error("Username already taken");
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 11),
      username: userData.username,
      email: userData.email,
      streak: 1, // Start with streak of 1 day!
      lastActiveDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.passwords[newUser.id] = passwordHash;
    writeDb(db);

    return newUser;
  },

  async getPasswordHash(userId: string): Promise<string | null> {
    const db = readDb();
    return db.passwords[userId] || null;
  },

  async updateStreak(userId: string): Promise<User | null> {
    const db = readDb();
    const userIndex = db.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return null;

    const user = db.users[userIndex];
    const today = new Date().toISOString().split("T")[0];
    
    if (!user.lastActiveDate) {
      user.streak = 1;
      user.lastActiveDate = today;
    } else {
      const lastActive = new Date(user.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Active yesterday, increment streak!
        user.streak += 1;
        user.lastActiveDate = today;
      } else if (diffDays > 1) {
        // Missed high days, reset streak to 1
        user.streak = 1;
        user.lastActiveDate = today;
      }
      // If diffDays is 0, user already revised today, leave streak as is
    }

    db.users[userIndex] = user;
    writeDb(db);
    return user;
  }
};

// Topic model operations
export const TopicModel = {
  async findByUserId(userId: string): Promise<Topic[]> {
    const db = readDb();
    return db.topics.filter((t) => t.userId === userId);
  },

  async findById(id: string): Promise<Topic | null> {
    const db = readDb();
    const topic = db.topics.find((t) => t.id === id);
    return topic || null;
  },

  async create(topicData: Omit<Topic, "id" | "createdAt" | "updatedAt">): Promise<Topic> {
    const db = readDb();
    
    const newTopic: Topic = {
      id: Math.random().toString(36).substring(2, 11),
      userId: topicData.userId,
      title: topicData.title,
      category: topicData.category,
      difficulty: topicData.difficulty,
      notes: topicData.notes,
      tags: topicData.tags,
      dateLearned: topicData.dateLearned,
      revisionDate: topicData.revisionDate,
      status: topicData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.topics.push(newTopic);
    writeDb(db);

    return newTopic;
  },

  async update(id: string, userId: string, updateData: Partial<Omit<Topic, "id" | "userId" | "createdAt" | "updatedAt">>): Promise<Topic | null> {
    const db = readDb();
    const topicIndex = db.topics.findIndex((t) => t.id === id && t.userId === userId);
    if (topicIndex === -1) return null;

    const existingTopic = db.topics[topicIndex];
    const updatedTopic: Topic = {
      ...existingTopic,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    db.topics[topicIndex] = updatedTopic;
    writeDb(db);

    return updatedTopic;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const db = readDb();
    const originalLength = db.topics.length;
    db.topics = db.topics.filter((t) => !(t.id === id && t.userId === userId));
    
    if (db.topics.length !== originalLength) {
      writeDb(db);
      return true;
    }
    return false;
  }
};
