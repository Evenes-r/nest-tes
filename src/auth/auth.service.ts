import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { UserDto } from './dto/user.dto'
import { UserRepository } from './repository/user.repository'
import Redis from 'ioredis'

interface User {
  id: number
  username: string
  password: string
}
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async register(data: UserDto): Promise<{ access_token: string }> {
    const existingUser = await this.userRepository.findByUsername(data.username)

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST)
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await this.userRepository.createUser(
      data.username,
      hashedPassword,
    )

    console.log(user)
    const cacheKey = 'user' + data.username

    await this.redisClient.set(
      cacheKey,
      JSON.stringify({ id: user.id, username: user.username }),
      'EX',
      3600,
    )

    return this.generateJwt(user)
  }

  async authenticate(data: UserDto): Promise<{ access_token: string }> {
    let user
    const cacheKey = 'user' + data.username

    const hashedUser = await this.redisClient.get(cacheKey)

    if (hashedUser) {
      user = JSON.parse(hashedUser)
    } else {
      user = await this.userRepository.findByUsername(data.username)
    }

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
    }
    console.log(user)
    await this.redisClient.set(
      cacheKey,
      JSON.stringify({ id: user.id, username: user.username }),
      'EX',
      3600,
    )

    return this.generateJwt(user)
  }

  private generateJwt(user: User) {
    const payload = { username: user.username, password: user.password }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
