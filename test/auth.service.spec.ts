import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from 'src/auth/auth.service'
import { JwtService } from '@nestjs/jwt'
import { UserRepository } from 'src/auth/repository/user.repository'
import { UserDto } from 'src/auth/dto/user.dto'
import * as bcrypt from 'bcryptjs'
import Redis from 'ioredis'
import { HttpException, HttpStatus } from '@nestjs/common'

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}))

describe('AuthService', () => {
  let authService: AuthService
  let userRepository: Partial<UserRepository>
  let jwtService: Partial<JwtService>
  let redisClient: Partial<Redis>

  beforeEach(async () => {
    userRepository = {
      findByUsername: jest.fn(),
      createUser: jest.fn(),
    }

    jwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
    }

    redisClient = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: 'REDIS_CLIENT', useValue: redisClient },
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(authService).toBeDefined()
  })

  describe('register', () => {
    it('should throw an error if user already exists', async () => {
      ;(userRepository.findByUsername as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'test',
        password: 'hashedPassword',
      })

      const userDto = new UserDto()
      userDto.username = 'test'
      userDto.password = 'password'

      await expect(authService.register(userDto)).rejects.toThrow(
        new HttpException('User already exists', HttpStatus.BAD_REQUEST),
      )
    })

    it('should register a user and return a JWT token', async () => {
      ;(userRepository.findByUsername as jest.Mock).mockResolvedValue(null)
      ;(userRepository.createUser as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'test',
        password: 'hashedPassword',
      })

      const userDto = new UserDto()
      userDto.username = 'test'
      userDto.password = 'password'

      const result = await authService.register(userDto)
      expect(result).toEqual({ access_token: 'test-token' })
      expect(redisClient.set).toHaveBeenCalledWith(
        'usertest',
        expect.any(String),
        'EX',
        3600,
      )
    })
  })

  describe('authenticate', () => {
    it('should throw an error if user is not found', async () => {
      ;(userRepository.findByUsername as jest.Mock).mockResolvedValue(null)
      ;(redisClient.get as jest.Mock).mockResolvedValue(null)

      const userDto = new UserDto()
      userDto.username = 'test'
      userDto.password = 'password'

      await expect(authService.authenticate(userDto)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      )
    })

    it('should return a JWT token if credentials are valid', async () => {
      ;(userRepository.findByUsername as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'test',
        password: 'hashedPassword',
      })
      ;(redisClient.get as jest.Mock).mockResolvedValue(null)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const userDto = new UserDto()
      userDto.username = 'test'
      userDto.password = 'password'

      const result = await authService.authenticate(userDto)

      expect(result).toEqual({ access_token: 'test-token' })
      expect(redisClient.set).toHaveBeenCalledWith(
        'usertest',
        expect.any(String),
        'EX',
        3600,
      )
    })
  })
})
