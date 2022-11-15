import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RoomModule } from '../modules/room/room.module';

@Module({
  imports: [RoomModule],
  providers: [EventsGateway],
})
export class EventsModule {}
