import mongoose from "mongoose";

export const RoomSchema = new mongoose.Schema({
  key: String,
  currentVideoLink: { type: String, required: true }
});

export interface Room extends mongoose.Document {
  key: String;
  currentVideoLink: String;
}