import { IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty()
    content!: string;

    @IsNotEmpty()
    @IsMongoId()
    postId!: string;

    @IsOptional()
    @IsMongoId()
    parentCommentId?: string;
}
