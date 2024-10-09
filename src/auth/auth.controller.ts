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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: Record<string, any>,
  ): Promise<WebResponse<{ access_token: string }>> {
    const result = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );
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
