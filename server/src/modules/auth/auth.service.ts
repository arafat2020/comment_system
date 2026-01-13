import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from './user.model';
import { LoginDto, RegisterDto } from './auth.dto';

export class AuthService {
    private readonly saltRounds = 10;
    private readonly jwtSecret = process.env.JWT_SECRET || 'supersecret';

    async register(registerDto: RegisterDto): Promise<{ user: IUser; token: string }> {
        const existingUser = await User.findOne({ $or: [{ email: registerDto.email }, { username: registerDto.username }] });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, this.saltRounds);

        const newUser = new User({
            username: registerDto.username,
            email: registerDto.email,
            passwordHash: hashedPassword,
            avatarUrl: registerDto.avatarUrl,
        });

        await newUser.save();

        const token = this.generateToken(newUser);
        return { user: newUser, token };
    }

    async login(loginDto: LoginDto): Promise<{ user: IUser; token: string }> {
        const user = await User.findOne({ email: loginDto.email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user);
        return { user, token };
    }

    private generateToken(user: IUser): string {
        return jwt.sign({ id: user._id, username: user.username }, this.jwtSecret, { expiresIn: '7d' });
    }

    async findById(userId: string): Promise<IUser> {
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) throw new Error('User not found');
        return user;
    }
}
