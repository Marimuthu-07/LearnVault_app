/**
 * LearnVault Shared Type Definitions
 */

export enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard"
}

export enum Status {
  Completed = "Completed",
  Revising = "Revising",
  Pending = "Pending"
}

export interface User {
  id: string;
  username: string;
  email: string;
  streak: number;
  lastActiveDate?: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  userId: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  notes: string;
  tags: string[];
  dateLearned: string;
  revisionDate: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalTopics: number;
  completedCount: number;
  revisingCount: number;
  pendingCount: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  streak: number;
  recentTopics: Topic[];
  progressPercent: number;
  categoryDistribution: { name: string; value: number; color: string }[];
  weeklyActivity: { day: string; count: number }[];
}
