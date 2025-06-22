import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesController } from './expenses.controller';
import { Expenses } from './expenses.entity';
import { ExpensesService } from './expenses.service';
import { GroupsModule } from 'src/groups/groups.module';


@Module({
  controllers: [ExpensesController],
  imports: [TypeOrmModule.forFeature([Expenses]), GroupsModule],
  providers: [ExpensesService],
})
export class ExpensesModule {}