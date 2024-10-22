import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { WebResponse } from 'src/model/web.model';
import { AuthGuard } from './auth.guard';
import { NotificationGateway } from 'src/notification/notification.gateway';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: Record<string, any>,
  ): Promise<WebResponse<{ access_token: string }>> {
    const result = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );
    this.notificationGateway.joinGeneralRoom(result.user_id);
    return {
      status: 'success',
      code: 200,
      message: 'successfuly logged in',
      data: result,
    };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
