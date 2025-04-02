import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRepository } from './repository/user.repository'
import { User } from './entity/user.entity'
import { JwtAuthGuard } from './auth.guard'
import { JwtStrategy } from './jwt.strategy'
import { PassportModule } from '@nestjs/passport'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRepository]),
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '60m' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [UserRepository, AuthService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
