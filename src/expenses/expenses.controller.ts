import { Controller, Get, Post, Put, Delete, Param, HttpException, HttpStatus, Body, Request, UseGuards, Query } from '@nestjs/common'; 
import { CreateExpenseDto } from './dto/createExpense.dto';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GroupsService } from 'src/groups/groups.service';

@Controller('expenses')
export class ExpensesController {
    constructor(
        private readonly expensesService: ExpensesService,
        private readonly groupsService: GroupsService
    ){}

    @UseGuards(JwtAuthGuard)
    @Get('/user/:id')
    async findAll(@Param('id') userId: string, @Request() req: any, @Query('groupId') groupId?: string){ 
        if (Number(userId) !== req.user.id) {
            throw new HttpException('Acesso não autorizado.', HttpStatus.FORBIDDEN);
        }
        return this.expensesService.findAll(req.user, groupId ? Number(groupId) : undefined); 
    }


    @UseGuards(JwtAuthGuard) 
    @Get(':id')
    async findOne(@Param('id') expenseId: string, @Request() req: any){
        const expense = await this.expensesService.findOne(Number(expenseId));
    
        if(!expense){
            throw new HttpException(`Gasto não encontrado`, HttpStatus.NOT_FOUND)
        }

        if (expense.group_id) {
            const userGroups = await this.groupsService.findUserGroups(req.user.id);
            const isMemberOfGroup = userGroups.some(group => group.id === expense.group_id);
            if (!isMemberOfGroup) {
                throw new HttpException('Acesso não autorizado ao grupo desta despesa.', HttpStatus.FORBIDDEN);
            }
        } else if (expense.user_id !== req.user.id) {
                        throw new HttpException('Acesso não autorizado a esta despesa.', HttpStatus.FORBIDDEN);
        }
        
        return expense;
    }
    
    @UseGuards(JwtAuthGuard) 
    @Post()
    async create(@Body() expense: any, @Request() req: any){
        expense.user_id = req.user.id; 

        if (expense.group_id) {
            const userGroups = await this.groupsService.findUserGroups(req.user.id);
            const isMemberOfGroup = userGroups.some(group => group.id === expense.group_id);
            if (!isMemberOfGroup) {
                throw new HttpException('Você não tem permissão para adicionar despesas a este grupo.', HttpStatus.FORBIDDEN);
            }
        }
        return this.expensesService.create(expense);
    }
    
    @UseGuards(JwtAuthGuard) 
    @Put(':id')
    async update(@Param('id') expenseId: string, @Body() updatedExpense: any, @Request() req: any){
        const existingExpense = await this.expensesService.findOne(Number(expenseId));
        if (!existingExpense) {
            throw new HttpException('Gasto não encontrado.', HttpStatus.NOT_FOUND);
        }

        if (existingExpense.group_id) {
            const userGroups = await this.groupsService.findUserGroups(req.user.id);
            const isMemberOfExistingGroup = userGroups.some(group => group.id === existingExpense.group_id);
            if (!isMemberOfExistingGroup) {
                throw new HttpException('Você não tem permissão para editar despesas neste grupo.', HttpStatus.FORBIDDEN);
            }
        } else if (existingExpense.user_id !== req.user.id) {
            throw new HttpException('Você não tem permissão para editar esta despesa.', HttpStatus.FORBIDDEN);
        }

        if (updatedExpense.group_id && updatedExpense.group_id !== existingExpense.group_id) {
            const userGroups = await this.groupsService.findUserGroups(req.user.id);
            const isMemberOfNewGroup = userGroups.some(group => group.id === updatedExpense.group_id);
            if (!isMemberOfNewGroup) {
                throw new HttpException('Você não tem permissão para mover despesas para este novo grupo.', HttpStatus.FORBIDDEN);
            }
        }

        return this.expensesService.update(Number(expenseId), updatedExpense);
    }
    
    @UseGuards(JwtAuthGuard) 
    @Delete(':id')
    async delete(@Param('id') expenseId: string, @Request() req: any){
        const existingExpense = await this.expensesService.findOne(Number(expenseId));
        if (!existingExpense) {
            throw new HttpException('Gasto não encontrado.', HttpStatus.NOT_FOUND);
        }

        if (existingExpense.group_id) {
            const userGroups = await this.groupsService.findUserGroups(req.user.id);
            const isMemberOfGroup = userGroups.some(group => group.id === existingExpense.group_id);
            if (!isMemberOfGroup) {
                throw new HttpException('Você não tem permissão para excluir despesas deste grupo.', HttpStatus.FORBIDDEN);
            }
        } else if (existingExpense.user_id !== req.user.id) {
            throw new HttpException('Você não tem permissão para excluir esta despesa.', HttpStatus.FORBIDDEN);
        }
        return this.expensesService.delete(Number(expenseId));
    }
}