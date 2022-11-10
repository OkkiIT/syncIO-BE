import {
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

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
export class EventsGateway implements OnGatewayInit, OnGatewayDisconnect {
  private logger: Logger = new Logger('Events Gateway');
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

  @SubscribeMessage('playVideo')
  handleVideoPlay(client: Socket, msg: any) {
    this.wss.to(msg.roomId).emit('playVideo');
  }

  handleDisconnect(client: any): any {
    this.wss.emit('pauseVideo');
  }
}
