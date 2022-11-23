import {
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomService } from '../modules/room/room.service';

interface ConnectRoomMsg {
  roomId: string;
}

interface Message {
  roomId: string;
  data: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class EventsGateway implements OnGatewayInit, OnGatewayDisconnect {
  private logger: Logger = new Logger('Events Gateway');

  constructor(private roomService: RoomService) {}

  @WebSocketServer() wss: Server;

  afterInit(server: any): void {
    this.logger.log('Events Gateway init');
  }

  @SubscribeMessage('connectRoom')
  handleRoomConnection(client: Socket, msg: ConnectRoomMsg): void {
    client.join(msg.roomId);
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(client: Socket, msg: any) {
    this.wss.to(msg.roomId).emit('chatMessage', {
      userName: msg.userName,
      message: msg.message,
      sendingTime: msg.sendingTime,
    });
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, msg: Message): void {
    this.wss.to(msg.roomId).emit('msgToClient', msg.data);
  }

  @SubscribeMessage('syncVideo')
  handleVideoSynchronize(client: Socket, msg: any) {
    this.wss.to(msg.roomId).emit('syncVideo', {
      currentTimePlayed: msg.currentTimePlayed,
      sendTime: msg.sendTime,
    });
  }

  @SubscribeMessage('pauseVideo')
  handleVideoPause(cliet: Socket, msg: any) {
    this.wss.to(msg.roomId).emit('pauseVideo', {
      currentTimePlayed: msg.currentTimePlayed,
    });
  }

  @SubscribeMessage('changeVideo')
  async handleChangeVideo(client: Socket, msg: any) {
    try {
      await this.roomService.changeVideo({
        roomId: msg.roomId,
        videoLink: msg.videoLink,
      });
      this.wss.in(msg.roomId).emit('changeVideo', { videoLink: msg.videoLink });
    } catch (e) {
      console.log(e.message);
    }
  }

  @SubscribeMessage('playVideo')
  handleVideoPlay(client: Socket, msg: any) {
    this.wss.to(msg.roomId).emit('playVideo');
  }

  handleDisconnect(client: any): any {
    this.wss.emit('pauseVideo');
  }

  @SubscribeMessage('getPlaylist')
  async handleGetPlaylist(client: Socket, msg: any) {
    const playlist = await this.roomService.getPlaylist(msg.roomId);
    this.wss.to(msg.roomId).emit('getPlaylist', { playlist });
  }

  @SubscribeMessage('addVideoToPlaylist')
  async handleAddVideoToPlaylist(client: Socket, msg: any) {
    const updatedPlaylist = await this.roomService.addVideoToPlaylist(
      msg.roomId,
      msg.videoLink,
    );

    this.wss
      .in(msg.roomId)
      .emit('addVideoToPlaylist', { playlist: updatedPlaylist });
  }

  @SubscribeMessage('playVideoFromPlaylist')
  async handlePlayVideoFromPlaylist(client: Socket, msg: any) {
    const room = await this.roomService.playVideoFromPlaylist(
      msg.roomId,
      msg.videoId,
    );

    this.wss.in(msg.roomId).emit('playVideoFromPlaylist', { room });
  }

  @SubscribeMessage('deleteVideoFromPlaylist')
  async handleDeleteVideoFromPlaylist(client: Socket, msg: any) {
    const updatedPlaylist = await this.roomService.deleteVideoFromPlaylist(
      msg.roomId,
      msg.videoId,
    );
    this.wss
      .in(msg.roomId)
      .emit('deleteVideoFromPlaylist', { playlist: updatedPlaylist });
  }
}
