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
    
        async findAll(user){
            const expenses = await this.expensesRepository.createQueryBuilder('name',)
            .select(['name', 'id', 'date', 'value', 'description', 'recurrent', 'recurrence_time', 'font', 'user'])
            .where({user: user.id})
            .orderBy('date', 'DESC')
            .getMany();

            if(expenses.length > 0){
                return expenses
           }
            else{
                throw new HttpException(`Não foram encontrados gastos para esse usuário`, HttpStatus.NOT_FOUND)
            }
        }

        findOne(id){
            return this.expensesRepository.findOneBy({id: id});
        }

        async create(createEntryDto: CreateExpenseDto){

            const course = this.expensesRepository.create({...createEntryDto})
    
            return this.expensesRepository.save(course)
        }

        async update(id, updatedUser){
             const user = await this.expensesRepository.findOneBy({id: id})

             if(!user){
                throw new NotFoundException(`Usuario não encontrado`)
            }

            return this.expensesRepository.update(id, updatedUser)
        }

        async delete(id){
            try {
                return await this.expensesRepository.delete(id);
            } catch (error) {
                throw new NotFoundException(error.message);
            }
        }
}
