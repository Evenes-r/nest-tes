// articles.service.ts

import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ArticleList, ArticleRepository } from './repository/article.repository'
import { ArticleDto } from './dto/article.dto'
import Redis from 'ioredis'
import { Article } from './entity/article.entity'

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async create(articleDto: ArticleDto) {
    return await this.articleRepository.createArticle(
      articleDto.title,
      articleDto.content,
      articleDto.author,
    )
  }

  async findAll({
    author,
    page,
    order = 'ASC',
  }: {
    author?: string
    page: number
    order?: 'ASC' | 'DESC'
  }) {
    const cacheKey = 'articles'

    const cachedArticles = await this.redisClient.get(cacheKey)

    if (cachedArticles && cachedArticles !== '[]') {
      return JSON.parse(cachedArticles)
    }

    const articleList = await this.articleRepository.findAll({
      author,
      page,
      order,
    })

    await this.redisClient.set(
      cacheKey,
      JSON.stringify(articleList?.data),
      'EX',
      3600,
    )

    return articleList
  }

  async findOne(id: number) {
    let articles = []

    const cacheKey = 'articles'

    const cachedArticles = await this.redisClient.get(cacheKey)

    if (cachedArticles && cachedArticles !== '[]') {
      articles = JSON.parse(cachedArticles)
      const article = articles.find((article: Article) => article.id === id)

      if (article) {
        return article
      }
    }

    const article = await this.articleRepository.findOneById(id)

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND)
    }

    return article
  }

  async update(id: number, articleDto: ArticleDto) {
    const cacheKey = 'articles'

    const cachedArticles = await this.redisClient.get(cacheKey)

    if (cachedArticles && cachedArticles !== '[]') {
      const articles = JSON.parse(cachedArticles)

      const articleIndex = articles.findIndex(
        (article: any) => article.id === id,
      )

      if (articleIndex !== -1) {
        articles[articleIndex] = {
          ...articles[articleIndex],
          title: articleDto.title,
          content: articleDto.content,
          author: articleDto.author,
        }

        await this.redisClient.set(
          cacheKey,
          JSON.stringify(articles),
          'EX',
          3600,
        )
      }
    }

    return await this.articleRepository.updateArticle(
      id,
      articleDto.title,
      articleDto.content,
      articleDto.author,
    )
  }

  async remove(id: number) {
    const cacheKey = 'articles'

    const cachedArticles = await this.redisClient.get(cacheKey)

    if (cachedArticles && cachedArticles !== '[]') {
      const articles = JSON.parse(cachedArticles)

      const articleIndex = articles.findIndex(
        (article: any) => article.id === id,
      )

      if (articleIndex !== -1) {
        articles.splice(articleIndex, 1)

        await this.redisClient.set(
          cacheKey,
          JSON.stringify(articles),
          'EX',
          3600,
        )
      }
    }

    return await this.articleRepository.remove(id)
  }
}
