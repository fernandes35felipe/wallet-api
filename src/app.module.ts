import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EntriesModule } from './entries/entries.module';
import { ExpensesModule } from './expenses/expenses.module';
import { UsersService } from './users/users.service';
import { AuthModule } from './auth/auth.module';
import { Users } from './users/users.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forRoot(
    {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'inf34dx*',
    database: 'wallet',
    autoLoadEntities: true,
    synchronize: true
  }
  ), EntriesModule, ExpensesModule, AuthModule, ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
