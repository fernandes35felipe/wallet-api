import { Controller, Get, Post, Put, Delete, Param, HttpException, HttpStatus, Body } from '@nestjs/common';
import { CreateExpenseDto } from './dto/createExpense.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService){}

    @Get('/user/:id')
    findAll(@Param() id){
        return this.expensesService.findAll(id)
    }

    @Get(':id')
    findOne(@Param('id') id){
        const expense =  this.expensesService.findOne(id)
    
        if(!expense){
            throw new HttpException(`Gasto não encontrado`, HttpStatus.NOT_FOUND)
        }
        
        return expense
    }

    
    @Post()
    create(@Body() expense){
        return this.expensesService.create(expense);
    }
    
    @Put(':id')
    update(@Param('id') id, @Body() updatedExpense){
        return this.expensesService.update(id, updatedExpense)
    }
    
    
    @Delete(':id')
    delete(@Param('id') id){
        return this.expensesService.delete(id)
    }
}
