import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/createExpense.dto';
import { Expenses } from './expenses.entity';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expenses) 
        private readonly expensesRepository: Repository<Expenses>
        ){}
    
    async findAll(user: any, groupId?: number){
        const queryBuilder = this.expensesRepository.createQueryBuilder('expense')
            .select(['expense.name', 'expense.id', 'expense.date', 'expense.value', 'expense.description', 'expense.recurrent', 'expense.recurrence_time', 'expense.font', 'expense.user_id', 'expense.group_id'])
            .where('expense.user_id = :userId', { userId: user.id });

        if (groupId !== undefined && groupId !== null) {
            queryBuilder.andWhere('expense.group_id = :groupId', { groupId: groupId });
        }

        const expenses = await queryBuilder
            .orderBy('expense.date', 'DESC')
            .getMany();

        if(expenses.length > 0){
            return expenses
        }
        else{
            throw new HttpException(`Não foram encontrados gastos para esse usuário no grupo selecionado`, HttpStatus.NOT_FOUND)
        }
    }

    findOne(id: number){
        return this.expensesRepository.findOneBy({id: id});
    }

    async create(createExpenseDto: CreateExpenseDto){
        try{
            const expense = this.expensesRepository.create({...createExpenseDto})
            this.expensesRepository.save(expense)


            if(createExpenseDto.recurrence_time > 1){
                for(let i = 0; i < createExpenseDto.recurrence_time; i ++){
                    let recurrenceMonth = Number(createExpenseDto.date.substring(5, 7))+1
                    let recurrenceYear = Number(createExpenseDto.date.substring(0, 4))

                    if(recurrenceMonth > 12){
                        recurrenceMonth = recurrenceMonth-12
                        recurrenceYear = recurrenceYear+1
                    }

                    createExpenseDto.date = recurrenceYear + '-' + recurrenceMonth.toString().padStart(2, '0') + '-'+ createExpenseDto.date.substring(8, 10)
                   
                    const recurrenceExpense = this.expensesRepository.create({...createExpenseDto})
                    this.expensesRepository.save(recurrenceExpense)
                }
            }

            return expense
        }catch(error){
            throw new HttpException('Internal Server Error',HttpStatus.INTERNAL_SERVER_ERROR)        
        }
    }

    async update(id: number, updatedExpense: any){
       const expense = await this.expensesRepository.findOneBy({id: id})
         if(!expense){
            throw new NotFoundException(`Gasto não encontrado`)
        }

        return this.expensesRepository.update(id, updatedExpense)
    }

    async delete(id: number){
        try {
            return await this.expensesRepository.delete(id);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }
}