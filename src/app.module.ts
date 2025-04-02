import { Global, Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { AuthModule } from './auth/auth.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppDataSource } from './data-source'
import { ArticleModule } from './articles/articles.module'
import Redis from 'ioredis'
import { ConfigModule } from '@nestjs/config'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => AppDataSource.options,
    }),
    AuthModule,
    ArticleModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        })
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class AppModule {}
