import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [
	TypeOrmModule.forFeature([Users]),
	forwardRef(() => UsersModule),
	PassportModule,
	ConfigModule.forRoot({isGlobal: true,}),
	JwtModule.register({
		secret: jwtConstants.secret,
		signOptions: { expiresIn: '480m' },
	}),],
  providers: [AuthService,LocalStrategy,JwtStrategy,],
  exports: [AuthService,JwtModule],
})
export class AuthModule {}
