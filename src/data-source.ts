import * as dotenv from 'dotenv'
dotenv.config()

import { DataSource } from 'typeorm'
import { User } from './auth/entity/user.entity'
import { Article } from './articles/entity/article.entity'

export const AppDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION as 'postgres',
  host: process.env.TYPEORM_HOST,
  port: Number(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  entities: [User, Article],
  synchronize: false,
  migrations: ['dist/migrations/*.js'],
})

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!')
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err)
  })
