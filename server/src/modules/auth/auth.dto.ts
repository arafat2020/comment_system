import { IsEmail, IsNotEmpty, MinLength, IsOptional, MaxLength } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(20)
    username!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsNotEmpty()
    @MinLength(6)
    password!: string;

    @IsOptional()
    avatarUrl?: string;
}

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsNotEmpty()
    password!: string;
}
