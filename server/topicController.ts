import { Response } from "express";
import { TopicModel, UserModel } from "./db";
import { AuthenticatedRequest } from "./middleware";
import { Difficulty, Status, Topic, DashboardStats } from "../src/types";

// Helper to assign vibrant dark-mode-ready colors to categories
const CATEGORY_COLORS: Record<string, string> = {
  "Computer Science": "#8B5CF6", // Purple
  "Mathematics": "#3B82F6",      // Blue
  "Science": "#10B981",          // Emerald
  "Languages": "#F59E0B",        // Amber
  "Engineering": "#EC4899",      // Pink
  "Business & Finance": "#14B8A6",// Teal
  "Design & Arts": "#6366F1",    // Indigo
  "Humanities": "#EF4444",       // Red
  "General": "#6B7280"           // Gray
};

export async function getTopics(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    let topics = await TopicModel.findByUserId(userId);

    const { search, category, status, sortBy } = req.query as {
      search?: string;
      category?: string;
      status?: string;
      sortBy?: string;
    };

    // 1. Search filter
    if (search) {
      const q = search.toLowerCase();
      topics = topics.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // 2. Category filter
    if (category && category !== "all") {
      topics = topics.filter((t) => t.category === category);
    }

    // 3. Status filter
    if (status && status !== "all") {
      topics = topics.filter((t) => t.status === status);
    }

    // 4. Sort
    if (sortBy === "oldest") {
      topics.sort((a, b) => new Date(a.dateLearned).getTime() - new Date(b.dateLearned).getTime());
    } else if (sortBy === "revision") {
      topics.sort((a, b) => new Date(a.revisionDate).getTime() - new Date(b.revisionDate).getTime());
    } else {
      // Default: newest
      topics.sort((a, b) => new Date(b.dateLearned).getTime() - new Date(a.dateLearned).getTime());
    }

    res.status(200).json({ topics });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch topics" });
  }
}

export async function getTopicById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const topic = await TopicModel.findById(id);
    if (!topic || topic.userId !== userId) {
      res.status(404).json({ error: "Topic not found" });
      return;
    }

    res.status(200).json({ topic });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch topic" });
  }
}

export async function createTopic(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { title, category, difficulty, notes, tags, dateLearned, revisionDate, status } = req.body;

    if (!title || !category || !difficulty || !status) {
      res.status(400).json({ error: "Title, category, difficulty, and status are required fields" });
      return;
    }

    const topic = await TopicModel.create({
      userId,
      title,
      category: category || "General",
      difficulty: difficulty as Difficulty,
      notes: notes || "",
      tags: Array.isArray(tags) ? tags : [],
      dateLearned: dateLearned || new Date().toISOString().split("T")[0],
      revisionDate: revisionDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: status as Status
    });

    // Automatically trigger active streak update for learning acts
    await UserModel.updateStreak(userId);

    res.status(201).json({ topic });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create topic" });
  }
}

export async function updateTopic(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const updateData = req.body;

    const topic = await TopicModel.findById(id);
    if (!topic || topic.userId !== userId) {
      res.status(404).json({ error: "Topic not found or unauthorized" });
      return;
    }

    const updated = await TopicModel.update(id, userId, {
      ...updateData,
      // Ensure arrays/enums are in shape
      tags: Array.isArray(updateData.tags) ? updateData.tags : undefined
    });

    res.status(200).json({ topic: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update topic" });
  }
}

export async function deleteTopic(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const success = await TopicModel.delete(id, userId);
    if (!success) {
      res.status(404).json({ error: "Topic not found or unauthorized" });
      return;
    }

    res.status(200).json({ message: "Topic deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete topic" });
  }
}

export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const user = await UserModel.findById(userId);
    const topics = await TopicModel.findByUserId(userId);

    // Count states
    const totalTopics = topics.length;
    const completedCount = topics.filter((t) => t.status === Status.Completed).length;
    const revisingCount = topics.filter((t) => t.status === Status.Revising).length;
    const pendingCount = topics.filter((t) => t.status === Status.Pending).length;

    // Difficulty counts
    const easyCount = topics.filter((t) => t.difficulty === Difficulty.Easy).length;
    const mediumCount = topics.filter((t) => t.difficulty === Difficulty.Medium).length;
    const hardCount = topics.filter((t) => t.difficulty === Difficulty.Hard).length;

    // Progress percentage
    const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    // Category distribution calculations
    const categoriesMap: Record<string, number> = {};
    topics.forEach((t) => {
      categoriesMap[t.category] = (categoriesMap[t.category] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoriesMap).map(([name, count]) => {
      return {
        name,
        value: count,
        color: CATEGORY_COLORS[name] || "#10B981"
      };
    }).sort((a, b) => b.value - a.value);

    // If zero categories, add an empty placeholder
    if (categoryDistribution.length === 0) {
      categoryDistribution.push({ name: "General", value: 0, color: "#6B7280" });
    }

    // Weekly activity calculation (last 7 days count)
    const daysName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyActivity = Array.from({ length: 7 }).map((_, i) => {
      // Get date of i days ago
      const date = new Date();
      date.setDate(date.getDate() - (6 - i)); // 0 represents 6 days ago, 6 is today
      const dateStr = date.toISOString().split("T")[0];
      const dayName = daysName[date.getDay()];
      
      // Count topics learned/updated on this date
      const count = topics.filter((t) => {
        const learnedDate = t.dateLearned ? t.dateLearned.split("T")[0] : "";
        const createdDate = t.createdAt ? t.createdAt.split("T")[0] : "";
        return learnedDate === dateStr || createdDate === dateStr;
      }).length;

      return {
        day: dayName,
        count
      };
    });

    // Recent 4 topics
    const recentTopics = [...topics]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);

    const stats: DashboardStats = {
      totalTopics,
      completedCount,
      revisingCount,
      pendingCount,
      difficultyDistribution: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount
      },
      streak: user?.streak || 0,
      recentTopics,
      progressPercent,
      categoryDistribution,
      weeklyActivity
    };

    res.status(200).json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to calculate stats" });
  }
}
