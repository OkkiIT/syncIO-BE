import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomModule } from './modules/room/room.module';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    RoomModule,
    EventsModule,
    MongooseModule.forRoot('mongodb://localhost/sync-vids'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
