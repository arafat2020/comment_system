import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(280)
    content!: string;

    imageUrl?: string;
}
