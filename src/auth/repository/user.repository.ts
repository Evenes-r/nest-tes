import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../entity/user.entity'

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } }).catch(() => {
      throw new HttpException(
        'Error finding user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    })
  }

  async createUser(username: string, password: string): Promise<User> {
    try {
      const user = this.userRepository.create({ username, password })
      return this.userRepository.save(user)
    } catch {
      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
