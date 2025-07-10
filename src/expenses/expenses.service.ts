// STARTOFFILE src/expenses/expenses.service.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'; // Adicionar BadRequestException
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, In } from 'typeorm'; // MUDANÇA: MongoRepository
import { CreateExpenseDto } from './dto/createExpense.dto';
import { Expenses } from './expenses.entity';
import { ObjectId } from 'mongodb'; // Importar ObjectId

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expenses)
    private readonly expensesRepository: MongoRepository<Expenses>, // MUDANÇA: MongoRepository
  ) {}

  async findAll(user: any, groupId?: string) {
    // MUDANÇA: groupId é string
    if (!ObjectId.isValid(user.id)) {
      // ID do usuário do token
      throw new BadRequestException('ID de usuário inválido.');
    }
    const userObjectId = new ObjectId(user.id);

    const queryBuilder = this.expensesRepository
      .createQueryBuilder('expense')
      .where({ user_id: userObjectId }); // MUDANÇA: user_id é ObjectId

    if (groupId !== undefined && groupId !== null) {
      if (!ObjectId.isValid(groupId)) {
        // Validar groupId
        throw new BadRequestException('ID de grupo inválido.');
      }
      queryBuilder.andWhere({ group_id: new ObjectId(groupId) }); // MUDANÇA: group_id é ObjectId
    }

    const expenses = await queryBuilder
      .orderBy('date', 'DESC') // Ordenar por campo
      .getMany(); // MUDANÇA: getMany para MongoDB

    if (expenses.length > 0) {
      return expenses;
    } else {
      throw new HttpException(
        `Não foram encontrados gastos para esse usuário no grupo selecionado`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findOne(id: string) {
    // MUDANÇA: id é string
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('ID de gasto inválido.');
    }
    return this.expensesRepository.findOne({
      where: { _id: new ObjectId(id) },
    }); // MUDANÇA: _id
  }

  async create(createExpenseDto: CreateExpenseDto) {
    // createExpenseDto.group_id e user_id serão strings
    if (!ObjectId.isValid(createExpenseDto.user_id)) {
      throw new BadRequestException('ID de usuário inválido.');
    }
    if (!ObjectId.isValid(createExpenseDto.group_id)) {
      throw new BadRequestException('ID de grupo inválido.');
    }

    const expense = this.expensesRepository.create({
      ...createExpenseDto,
      user_id: new ObjectId(createExpenseDto.user_id), // Converte para ObjectId
      group_id: new ObjectId(createExpenseDto.group_id), // Converte para ObjectId
      value: Number(createExpenseDto.value), // Garante que value é number
    });

    try {
      const savedExpense = await this.expensesRepository.save(expense);

      if (createExpenseDto.recurrence_time > 1) {
        for (let i = 0; i < createExpenseDto.recurrence_time; i++) {
          let recurrenceMonth =
            Number(createExpenseDto.date.substring(5, 7)) + 1;
          let recurrenceYear = Number(createExpenseDto.date.substring(0, 4));

          if (recurrenceMonth > 12) {
            recurrenceMonth = recurrenceMonth - 12;
            recurrenceYear = recurrenceYear + 1;
          }

          // MUDANÇA: Converte user_id e group_id para ObjectId novamente para recorrência
          const recurrenceExpense = this.expensesRepository.create({
            ...createExpenseDto,
            date:
              recurrenceYear +
              '-' +
              recurrenceMonth.toString().padStart(2, '0') +
              '-' +
              createExpenseDto.date.substring(8, 10),
            user_id: new ObjectId(createExpenseDto.user_id),
            group_id: new ObjectId(createExpenseDto.group_id),
            value: Number(createExpenseDto.value),
          });
          await this.expensesRepository.save(recurrenceExpense);
        }
      }

      return savedExpense;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updatedExpense: any) {
    // MUDANÇA: id é string
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('ID de gasto inválido.');
    }
    const expenseObjectId = new ObjectId(id);

    const expense = await this.expensesRepository.findOneBy({
      _id: expenseObjectId,
    });

    if (!expense) {
      throw new NotFoundException(`Gasto não encontrado`);
    }

    if (updatedExpense.user_id && !ObjectId.isValid(updatedExpense.user_id)) {
      throw new BadRequestException('ID de usuário inválido na atualização.');
    }
    if (updatedExpense.group_id && !ObjectId.isValid(updatedExpense.group_id)) {
      throw new BadRequestException('ID de grupo inválido na atualização.');
    }
    if (updatedExpense.value) {
      updatedExpense.value = Number(updatedExpense.value);
    }
    if (updatedExpense.user_id) {
      updatedExpense.user_id = new ObjectId(updatedExpense.user_id);
    }
    if (updatedExpense.group_id) {
      updatedExpense.group_id = new ObjectId(updatedExpense.group_id);
    }

    await this.expensesRepository.updateOne(
      { _id: expenseObjectId },
      { $set: updatedExpense },
    );
    return { message: 'Gasto atualizado com sucesso!' };
  }

  async delete(id: string) {
    // MUDANÇA: id é string
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('ID de gasto inválido.');
    }
    try {
      const result = await this.expensesRepository.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Gasto com ID ${id} não encontrado.`);
      }
      return { message: 'Gasto excluído com sucesso.' };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
