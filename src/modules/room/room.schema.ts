import mongoose from 'mongoose';

export const RoomSchema = new mongoose.Schema({
  key: String,
  currentVideoLink: { type: String, required: true },
  playList: [
    {
      videoLink: String,
      imgSrc: String,
      key: String,
      title: String,
      channelName: String,
    },
  ],
});

export interface Room extends mongoose.Document {
  key: string;
  currentVideoLink: string;
  playList: {
    videoLink: string;
    imgSrc: string;
    key: string;
    title: string;
    channelName: string;
  }[];
}
