import { History } from "../models/History.model.js";

const MODULES = ["summarizer", "translator", "tts", "transcriber", "headlines", "social", "seo"];

export const createHistoryEntry = async (userId, { module, title, input, output, metadata }) => {
  if (!MODULES.includes(module)) {
    const error = new Error(`Invalid module '${module}'. Must be one of: ${MODULES.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  return History.create({ user: userId, module, title, input, output, metadata });
};

export const listHistoryForUser = async (userId, { module, search, page = 1, limit = 20 }) => {
  const query = { user: userId };
  if (module && module !== "all") query.module = module;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { output: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [entries, total] = await Promise.all([
    History.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    History.countDocuments(query),
  ]);

  return { entries, total, page: Number(page), limit: Number(limit) };
};

// Deletes ONLY if the entry belongs to this user — this is the enforcement
// point that guarantees user isolation (never trust a client-supplied
// ownership check; the query itself must filter by user).
export const deleteHistoryEntry = async (userId, entryId) => {
  const deleted = await History.findOneAndDelete({ _id: entryId, user: userId });
  if (!deleted) {
    const error = new Error("Entry not found.");
    error.statusCode = 404;
    throw error;
  }
  return deleted;
};

export const clearHistoryForUser = async (userId) => {
  return History.deleteMany({ user: userId });
};
