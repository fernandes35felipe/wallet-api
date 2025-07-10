import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EntriesModule } from './entries/entries.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url:
        process.env.MONGODB_URI ||
        'mongodb+srv://admin:<db_password>@cluster0.ojl4sve.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    EntriesModule,
    ExpensesModule,
    AuthModule,
    GroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
