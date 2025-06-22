import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EntriesModule } from './entries/entries.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AuthModule } from './auth/auth.module';
import { Users } from './users/users.entity';
import { GroupsModule } from './groups/groups.module'; 

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot(
      {
        type: 'postgres',
        host: process.env.BD_HOST,
        port: Number(process.env.BD_PORT),
        username: process.env.BD_USER,
        password: process.env.BD_PWD,
        database: process.env.BD_NAME,
        autoLoadEntities: true,
        synchronize: true,
        ssl: false
      }
    ),
    EntriesModule,
    ExpensesModule,
    AuthModule,
    GroupsModule 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}