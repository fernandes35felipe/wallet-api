import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEntryDto } from './dto/createEntry.dto';
import { Entries } from './entries.entity';


@Injectable()
export class EntriesService {
    constructor(
        @InjectRepository(Entries) 
        private readonly entryRepository: Repository<Entries>
        ){}
    
        async findAll(user){
            console.log(user.id)
            const entries = await this.entryRepository.createQueryBuilder('name',)
            .select(['name', 'id', 'date', 'value', 'description', 'recurrent', 'recurrence_time', 'font', 'user'])
            .where({user: user.id})
            .orderBy('date', 'DESC')
            .getMany();

            if(entries.length > 0){
                return entries
           }
            else{
                throw new HttpException(`Não foram encontrados ganhos para esse usuário`, HttpStatus.NOT_FOUND)
            }
        }

        findOne(id){
            return this.entryRepository.findOneBy({id: id});
        }

        async create(createEntryDto: CreateEntryDto){

            const course = this.entryRepository.create({...createEntryDto})
    
            return this.entryRepository.save(course)
        }

        async update(id, updatedUser){
             const user = await this.entryRepository.findOneBy({id: id})

             if(!user){
                throw new NotFoundException(`Usuario não encontrado`)
            }

            return this.entryRepository.update(id, updatedUser)
        }

        async delete(id){
            try {
                return await this.entryRepository.delete(id);
            } catch (error) {
                throw new NotFoundException(error.message);
            }
        }
    
}
