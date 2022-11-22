import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Room } from './room.schema';
import { Request, Response } from 'express';
import { userNames } from '../../mocks/userNames';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel('Room')
    private readonly roomModel: Model<Room>,
    private readonly httpService: HttpService,
  ) {}

  async findRoom({ query, req, res }) {
    const { key } = query;
    const { userName } = req.cookies;
    const generatedUserName = this.generateUserName();
    const room = await this.roomModel.findOne({ key });
    if (!userName) {
      res.cookie('userName', this.generateUserName());
      return res.send({ room, userName: generatedUserName });
    }
    return res.send({ room, userName });
  }

  async insertRoom(body, res: Response) {
    const { videoLink } = body;
    const newRoom = new this.roomModel({ currentVideoLink: videoLink });
    newRoom.key = newRoom.id;
    newRoom.save();
    res.cookie('roomId', newRoom.key);
    res.cookie('userName', this.generateUserName());
    return res.send({ key: newRoom.key });
  }

  private generateUserName() {
    return userNames[Math.floor(Math.random() * userNames.length)];
  }

  async changeVideo({ roomId, videoLink }) {
    const updatedRoom = await this.roomModel.findOneAndUpdate(
      { key: roomId },
      { currentVideoLink: videoLink },
    );
    if (!updatedRoom) throw new Error('Something went wrong');
  }

  async addVideoToPlaylist(roomId: string, videoLink: string) {
    const videoIdRegExp = /v=([\s\S]+?)&/;
    const videoId = videoLink.match(videoIdRegExp)[1];
    const videoPreviewImgLink = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const room = await this.roomModel.findOne({ key: roomId });
    const {
      data: { title: videoTitle, author_name: channelName },
    } = await this.httpService.axiosRef.get(
      `https://noembed.com/embed?dataType=json&url=${videoLink}`,
    );
    const { data } = await this.httpService.axiosRef.get(
      `https://noembed.com/embed?dataType=json&url=${videoLink}`,
    );
    console.log(data);
    room.playList.push({
      videoLink,
      imgSrc: videoPreviewImgLink,
      key: videoId,
      title: videoTitle,
      channelName,
    });
    await room.save();
    console.log(room.playList[room.playList.length - 1]);
    return room.playList;
  }

  async getPlaylist(roomId: string) {
    const room = await this.roomModel.findOne({ key: roomId });
    return room.playList;
  }

  async playVideoFromPlaylist(roomId: string, videoId: string) {
    const room = await this.roomModel.findOne({ key: roomId });
    const video = room.playList.find((item) => item.key === videoId);
    room.currentVideoLink = video.videoLink;
    room.playList = room.playList.filter((item) => item.key !== videoId);
    await room.save();
    return room;
  }

  async deleteVideoFromPlaylist(roomId: string, videoId: string) {
    const room = await this.roomModel.findOne({ key: roomId });
    room.playList = room.playList.filter((item) => item.key !== videoId);
    await room.save();
    return room.playList;
  }
}
