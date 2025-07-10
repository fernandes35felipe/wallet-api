import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Users } from 'src/users/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Users) private UserRepository: MongoRepository<Users>,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.UserRepository.findOne({
      where: { email: email },
    });
    if (!user || !bcrypt.compareSync(pass, user.password)) {
      throw new ForbiddenException({
        message: 'Houve um problema com o login, verifique suas credenciais.',
      });
    }

    return user;
  }

  async login(user: any) {
    const payload = {
      id: user._id.toHexString(),
      email: user.email,
      name: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }
}
