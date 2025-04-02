import { Test, TestingModule } from '@nestjs/testing'
import { ArticleService } from 'src/articles/articles.service'
import { ArticleRepository } from 'src/articles/repository/article.repository'
import { Redis } from 'ioredis'
import { HttpException, HttpStatus } from '@nestjs/common'
import { create } from 'domain'

describe('ArticleService', () => {
  let service: ArticleService
  let articleRepository: jest.Mocked<ArticleRepository>
  let redisClient: jest.Mocked<Redis>

  beforeEach(async () => {
    const mockArticleRepository = {
      createArticle: jest.fn(),
      findAll: jest.fn(),
      findOneById: jest.fn(),
      updateArticle: jest.fn(),
      remove: jest.fn(),
    }

    const mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: ArticleRepository, useValue: mockArticleRepository },
        { provide: 'REDIS_CLIENT', useValue: mockRedisClient },
      ],
    }).compile()

    service = module.get<ArticleService>(ArticleService)
    articleRepository = module.get<ArticleRepository>(
      ArticleRepository,
    ) as jest.Mocked<ArticleRepository>
    redisClient = module.get<Redis>('REDIS_CLIENT') as jest.Mocked<Redis>
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should successfully create an article', async () => {
      const articleDto = {
        title: 'Тестовая статья',
        content: 'Тестовое содержимое',
        author: 'Тестовый автор',
        createdAt: new Date(),
      }

      const mockCreatedArticle = { ...articleDto, id: 1 }

      articleRepository.createArticle.mockResolvedValue(mockCreatedArticle)

      const result = await service.create(articleDto)
      expect(result).toEqual(mockCreatedArticle)
      expect(articleRepository.createArticle).toHaveBeenCalledWith(
        articleDto.title,
        articleDto.content,
        articleDto.author,
      )
    })

    it('should throw an error if article creation failed', async () => {
      const articleDto = {
        title: 'Тестовая статья',
        content: 'Тестовое содержимое',
        author: 'Тестовый автор',
      }

      articleRepository.createArticle.mockRejectedValue(
        new HttpException(
          'Error creating article',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      )

      await expect(service.create(articleDto)).rejects.toThrowError(
        new HttpException(
          'Error creating article',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      )
    })
  })

  describe('findAll', () => {
    it('should return articles from cache if they exist', async () => {
      const cachedArticles = JSON.stringify({
        articles: [{ id: 1, title: 'Тестовая статья' }],
      })
      redisClient.get.mockResolvedValue(cachedArticles)

      const result = await service.findAll({ page: 1 })
      expect(result).toEqual({
        articles: [{ id: 1, title: 'Тестовая статья' }],
      })
      expect(redisClient.get).toHaveBeenCalledWith('articles')
    })

    it('should load and cache articles if they are not in cache', async () => {
      const mockArticles = {
        data: [
          {
            id: 1,
            title: 'Статья 1',
            content: 'Содержимое статьи 1',
            author: 'Автор 1',
            createdAt: new Date(),
          },
        ],
        total: 1,
        articlesPerPage: 1,
        currentPage: 1,
        totalPages: 1,
      }
      redisClient.get.mockResolvedValue(null)
      articleRepository.findAll.mockResolvedValue(mockArticles)

      const result = await service.findAll({ page: 1 })
      expect(result).toEqual(mockArticles)
      expect(redisClient.set).toHaveBeenCalledWith(
        'articles',
        JSON.stringify({ articles: mockArticles.data }),
        'EX',
        3600,
      )
    })

    it('should load articles from database if Redis is not working', async () => {
      const mockArticleList = {
        data: [
          {
            id: 1,
            title: 'Тестовая статья',
            content: 'Содержимое статьи 1',
            author: 'Автор 1',
            createdAt: new Date(),
          },
        ],
        total: 1,
        articlesPerPage: 5,
        currentPage: 1,
        totalPages: 1,
      }

      articleRepository.findAll.mockResolvedValue(mockArticleList)

      const result = await service.findAll({ page: 1 })

      expect(result).toEqual(mockArticleList)
      expect(redisClient.get).toHaveBeenCalled()
      expect(redisClient.get).toHaveBeenCalledWith('articles')
      expect(articleRepository.findAll).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should return article from cache if it exists', async () => {
      const cachedArticles = JSON.stringify([
        { id: 1, title: 'Тестовая статья' },
      ])
      redisClient.get.mockResolvedValue(cachedArticles)

      const result = await service.findOne(1)
      expect(result).toEqual({ id: 1, title: 'Тестовая статья' })
    })

    it('should return article from repository if it is not in cache', async () => {
      redisClient.get.mockResolvedValue(null)
      const mockArticle = {
        id: 1,
        title: 'Тестовая статья',
        content: 'Тестовое содержимое',
        author: 'Тестовый автор',
        createdAt: new Date(),
      }
      articleRepository.findOneById.mockResolvedValue(mockArticle)

      const result = await service.findOne(1)
      expect(result).toEqual(mockArticle)
      expect(articleRepository.findOneById).toHaveBeenCalledWith(1)
    })

    it('should throw an error if article is not found', async () => {
      articleRepository.findOneById.mockResolvedValue(null)

      await expect(service.findOne(1)).rejects.toThrowError(
        new HttpException('Article not found', HttpStatus.NOT_FOUND),
      )
    })
  })

  describe('update', () => {
    it('should update article and return updated data', async () => {
      const articleDto = {
        title: 'Обновленная статья',
        content: 'Обновленное содержимое',
        author: 'Обновленный автор',
        createdAt: new Date(),
      }

      const mockUpdatedArticle = {
        id: 1,
        ...articleDto,
      }

      redisClient.get.mockResolvedValue(
        JSON.stringify([{ id: 1, title: 'Тестовая статья' }]),
      )

      articleRepository.updateArticle.mockResolvedValue(mockUpdatedArticle)

      const result = await service.update(1, articleDto)

      expect(result).toEqual(mockUpdatedArticle)

      expect(articleRepository.updateArticle).toHaveBeenCalledWith(
        1,
        articleDto.title,
        articleDto.content,
        articleDto.author,
      )

      const updatedArticles = [
        {
          id: 1,
          title: 'Обновленная статья',
          content: 'Обновленное содержимое',
          author: 'Обновленный автор',
        },
      ]
      expect(redisClient.set).toHaveBeenCalledWith(
        'articles',
        JSON.stringify(updatedArticles),
        'EX',
        3600,
      )
    })

    it('should throw an error if article update failed', async () => {
      const articleDto = {
        title: 'Обновленная статья',
        content: 'Обновленное содержимое',
        author: 'Обновленный автор',
      }

      articleRepository.updateArticle.mockRejectedValue(
        new HttpException(
          'Error updating article',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      )

      await expect(service.update(1, articleDto)).rejects.toThrowError(
        new HttpException(
          'Error updating article',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      )
    })
  })

  describe('remove', () => {
    it('should remove article and update cache', async () => {
      redisClient.get.mockResolvedValue(
        JSON.stringify([{ id: 1, title: 'Тестовая статья' }]),
      )

      articleRepository.remove.mockResolvedValue(true)

      const result = await service.remove(1)

      expect(result).toBe(true)

      expect(articleRepository.remove).toHaveBeenCalledWith(1)

      expect(redisClient.set).toHaveBeenCalledWith(
        'articles',
        JSON.stringify([]),
        'EX',
        3600,
      )
    })

    it('should throw an error if article removal failed', async () => {
      articleRepository.remove.mockRejectedValue(
        new HttpException(
          'Error removing article',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      )

      await expect(service.remove(1)).rejects.toThrowError(
        new HttpException(
          'Error removing article',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      )
    })
  })
})
