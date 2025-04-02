// article.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common'
import { Article } from './entity/article.entity'
import { ArticleDto } from './dto/article.dto'
import { ArticleService } from './articles.service'
import { JwtAuthGuard } from 'src/auth/auth.guard'

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  create(@Body() createArticleDto: ArticleDto) {
    return this.articleService.create(createArticleDto)
  }

  @Get()
  getAll(
    @Query('author') author: string,
    @Query('page') page: number = 1,
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
  ) {
    return this.articleService.findAll({ author, page, order })
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.findOne(id)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: ArticleDto,
  ) {
    return this.articleService.update(id, updateArticleDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.remove(id)
  }
}
