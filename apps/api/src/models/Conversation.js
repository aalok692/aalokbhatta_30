import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, index: true },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  providerConversationId: { type: String, default: "" }
}, { timestamps: true });

const visitorMessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
  sender: { type: String, enum: ["visitor", "admin"], required: true },
  body: { type: String, required: true, maxlength: 5000 },
  providerMessageId: { type: String, default: "" }
}, { timestamps: true });

export const Conversation = mongoose.model("Conversation", conversationSchema);
export const VisitorMessage = mongoose.model("VisitorMessage", visitorMessageSchema);
