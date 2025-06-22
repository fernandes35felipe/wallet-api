import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Users } from 'src/users/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
  private jwtService: JwtService,
  @InjectRepository(Users) private UserRepository: Repository<Users>,
    ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.UserRepository.findOne({
      select: ['id', 'name', 'password', 'email' ],
      where: {email: email}
    });
    if (!user || !bcrypt.compareSync(pass, user.password)) {
			throw new ForbiddenException({
				message: 'Houve um problema com o login, verifique suas credenciais.',
			});
    }
    else{
      this.login(user)
    }
		return user;
  }

  async login(user: any) {
    const payload = { id:user.id, email: user.email, name: user.name};
    const token = this.jwtService.sign(payload);
    return {
            access_token: token,
            user: payload
        };
  }
}
