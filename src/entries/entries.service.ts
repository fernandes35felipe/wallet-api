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
    
    async findAll(user: any, groupId?: number){ 
        const queryBuilder = this.entryRepository.createQueryBuilder('entry')
            .select(['entry.name', 'entry.id', 'entry.date', 'entry.value', 'entry.description', 'entry.recurrent', 'entry.recurrence_time', 'entry.font', 'entry.user_id', 'entry.group_id'])
            .where('entry.user_id = :userId', { userId: user.id });

        if (groupId !== undefined && groupId !== null) { 
            queryBuilder.andWhere('entry.group_id = :groupId', { groupId: groupId });
        }

        const entries = await queryBuilder
            .orderBy('entry.date', 'DESC')
            .getMany();

        if(entries.length > 0){
            return entries
        }
        else{
            throw new HttpException(`Não foram encontrados ganhos para esse usuário no grupo selecionado`, HttpStatus.NOT_FOUND)
        }
    }

    findOne(id: number){
        return this.entryRepository.findOneBy({id: id});
    }

    async create(createEntryDto: CreateEntryDto){
        const entry = this.entryRepository.create({...createEntryDto})

        return this.entryRepository.save(entry)
    }

    async update(id: number, updatedUser: any){
         const user = await this.entryRepository.findOneBy({id: id})

         if(!user){
            throw new NotFoundException(`Entrada não encontrada`)
        }

        return this.entryRepository.update(id, updatedUser)
    }

    async delete(id: number){
        try {
            return await this.entryRepository.delete(id);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }
}