import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class ArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsOptional()
  @IsString()
  author: string
}
