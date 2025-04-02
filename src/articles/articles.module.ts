// article.module.ts

import { Module } from '@nestjs/common'
import { ArticleController } from './articles.controller'
import { ArticleService } from './articles.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Article } from './entity/article.entity'
import { AuthModule } from '../auth/auth.module'
import { ArticleRepository } from './repository/article.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Article, ArticleRepository]), AuthModule],
  controllers: [ArticleController],
  providers: [ArticleRepository, ArticleService],
})
export class ArticleModule {}
