import { IsString, MinLength, MaxLength } from 'class-validator'

export class UserDto {
  @IsString()
  username: string

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string
}
