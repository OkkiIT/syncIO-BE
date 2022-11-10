import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { RoomService } from './room.service';
import { Response, Request } from 'express';

@Controller('api/room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getCurrentRoom(
    @Query() query,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.roomService.findRoom({ query, req, res });
  }

  @Post()
  async createRoom(@Body() body, @Res() res: Response) {
    return this.roomService.insertRoom(body, res);
  }
}
