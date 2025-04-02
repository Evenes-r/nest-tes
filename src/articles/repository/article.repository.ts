import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'
import { Article } from '../entity/article.entity'

export interface ArticleList {
  data: Article[]
  total: number
  articlesPerPage: number
  currentPage: number
  totalPages: number
}
@Injectable()
export class ArticleRepository {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async createArticle(
    title: string,
    content: string,
    author: string,
  ): Promise<Article> {
    const article = this.articleRepository.create({
      title,
      content,
      author,
    })

    if (!article) {
      throw new HttpException('Article not created', HttpStatus.BAD_REQUEST)
    }

    return await this.articleRepository.save(article)
  }

  async findAll({
    author,
    page,
    order = 'ASC',
  }: {
    author?: string
    page: number
    order?: 'ASC' | 'DESC'
  }): Promise<ArticleList | null> {
    const articlesPerPage = 5
    const skip = (page - 1) * articlesPerPage

    try {
      const queryBuilder = this.articleRepository.createQueryBuilder('article')

      if (author) {
        queryBuilder.andWhere('article.author LIKE :author', {
          author: `%${author}%`,
        })
      }

      queryBuilder.orderBy('article.createdAt', order)

      queryBuilder.skip(skip).take(articlesPerPage)

      const [data, total] = await queryBuilder.getManyAndCount()

      const totalPages = Math.ceil(total / articlesPerPage)

      return {
        data,
        total,
        articlesPerPage,
        currentPage: page,
        totalPages,
      }
    } catch {
      throw new HttpException(
        'Error fetching articles',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async findOneById(id: number): Promise<Article | null> {
    return await this.articleRepository.findOne({ where: { id } })
  }

  async updateArticle(
    id: number,
    title: string,
    content: string,
    author: string,
  ): Promise<Article> {
    const article = await this.findOneById(id)

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND)
    }

    article.title = title
    article.content = content
    article.author = author

    return this.articleRepository.save(article)
  }

  async remove(id: number): Promise<boolean> {
    const article = await this.findOneById(id)

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND)
    }

    const removeArticle = await this.articleRepository.delete(id)

    if (removeArticle) {
      return true
    }

    throw new HttpException(
      'Error deleting article',
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
  }
}
