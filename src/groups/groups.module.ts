import { forwardRef, Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Groups } from './groups.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { Users } from 'src/users/users.entity';
import { UserGroup } from 'src/user_group/user_group.entity';
import { UsersModule } from 'src/users/users.module'; 

@Module({
  imports: [TypeOrmModule.forFeature([Groups, UserGroup]), forwardRef(()=> AuthModule), UsersModule], 
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}