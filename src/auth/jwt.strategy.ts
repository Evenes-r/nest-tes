import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserRepository } from './repository/user.repository'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key',
    })
  }

  async validate(payload: any) {
    const user = await this.userRepository.findByUsername(payload.username)

    if (!user) {
      throw new HttpException(
        'User not found or access forbidden',
        HttpStatus.FORBIDDEN,
      )
    }
    return user
  }
}
