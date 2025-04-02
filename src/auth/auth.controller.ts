import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserDto } from './dto/user.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  register(@Body() data: UserDto) {
    return this.authService.register(data)
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  login(@Body() data: UserDto) {
    return this.authService.authenticate(data)
  }
}
