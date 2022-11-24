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
import {
  AddVideoToPlaylistMessage,
  BasicMessage,
  ChatMessage,
  DeleteVideoFromPlaylist,
  PauseVideoMessage,
  PlayVideoFromPlaylistMessage,
  SynchronizeVideoMessage,
} from '../types/socketMessages';

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
  handleRoomConnection(client: Socket, msg: BasicMessage): void {
    client.join(msg.roomId);
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(client: Socket, msg: ChatMessage): void {
    const { userName, message, sendTime, roomId } = msg;
    this.wss.to(roomId).emit('chatMessage', {
      userName,
      message,
      sendTime,
    });
  }

  @SubscribeMessage('syncVideo')
  handleVideoSynchronize(client: Socket, msg: SynchronizeVideoMessage) {
    const { currentTimePlayed, sendTime, roomId } = msg;
    this.wss.to(roomId).emit('syncVideo', {
      currentTimePlayed,
      sendTime,
    });
  }

  @SubscribeMessage('pauseVideo')
  handleVideoPause(cliet: Socket, msg: PauseVideoMessage) {
    const { roomId, currentTimePlayed } = msg;
    this.wss.to(roomId).emit('pauseVideo', {
      currentTimePlayed,
    });
  }

  @SubscribeMessage('playVideo')
  handleVideoPlay(client: Socket, msg: BasicMessage) {
    this.wss.to(msg.roomId).emit('playVideo');
  }

  handleDisconnect(client: any): any {
    this.wss.emit('pauseVideo');
  }

  @SubscribeMessage('getPlaylist')
  async handleGetPlaylist(client: Socket, msg: BasicMessage) {
    const playlist = await this.roomService.getPlaylist(msg.roomId);
    this.wss.to(msg.roomId).emit('getPlaylist', { playlist });
  }

  @SubscribeMessage('addVideoToPlaylist')
  async handleAddVideoToPlaylist(
    client: Socket,
    msg: AddVideoToPlaylistMessage,
  ) {
    const { roomId, videoLink } = msg;
    const updatedPlaylist = await this.roomService.addVideoToPlaylist(
      roomId,
      videoLink,
    );

    this.wss
      .in(roomId)
      .emit('addVideoToPlaylist', { playlist: updatedPlaylist });
  }

  @SubscribeMessage('playVideoFromPlaylist')
  async handlePlayVideoFromPlaylist(
    client: Socket,
    msg: PlayVideoFromPlaylistMessage,
  ) {
    const { roomId, videoId } = msg;
    const room = await this.roomService.playVideoFromPlaylist(roomId, videoId);

    this.wss.in(roomId).emit('playVideoFromPlaylist', { room });
  }

  @SubscribeMessage('deleteVideoFromPlaylist')
  async handleDeleteVideoFromPlaylist(
    client: Socket,
    msg: DeleteVideoFromPlaylist,
  ) {
    const { roomId, videoId } = msg;
    const updatedPlaylist = await this.roomService.deleteVideoFromPlaylist(
      roomId,
      videoId,
    );
    this.wss
      .in(roomId)
      .emit('deleteVideoFromPlaylist', { playlist: updatedPlaylist });
  }
}
