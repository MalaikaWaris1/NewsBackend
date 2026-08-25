import mongoose from "mongoose";

// One collection for all 7 modules rather than seven near-identical ones —
// they all share the same shape (a user, an input, an output, when it
// happened). `module` + `metadata` keep each module's specifics without
// needing a separate schema per tool.
const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      enum: [
        "summarizer",
        "translator",
        "tts",
        "transcriber",
        "headlines",
        "social",
        "seo",
      ],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    input: {
      type: String, // source text, or original filename for transcriber/tts
    },
    output: {
      type: String, // summary / translation / transcript / audioUrl / headline text / etc.
    },
    // Anything module-specific that doesn't fit input/output cleanly —
    // e.g. { platform: "linkedin", threadCount: 3 } for social,
    // { targetLang: "ur" } for translator, { seo: {...} } for SEO.
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

historySchema.index({ user: 1, createdAt: -1 });

export const History = mongoose.model("History", historySchema);
