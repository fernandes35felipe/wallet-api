import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesController } from './expenses.controller';
import { Expenses } from './expenses.entity';
import { ExpensesService } from './expenses.service';

@Module({
  controllers: [ExpensesController],
  imports: [TypeOrmModule.forFeature([Expenses])],
  providers: [ExpensesService],
})
export class ExpensesModule {}