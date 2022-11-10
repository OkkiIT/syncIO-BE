import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Room } from './room.schema';
import { Request, Response } from 'express';
import { userNames } from '../../mocks/userNames';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel('Room')
    private readonly roomModel: Model<Room>,
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
}
