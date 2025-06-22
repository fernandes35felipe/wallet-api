import { Controller, Get, Post, Put, Delete, Param, HttpException, HttpStatus, Body, Request, UseGuards, Query } from '@nestjs/common';
import { CreateEntryDto } from './dto/createEntry.dto';
import { EntriesService } from './entries.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GroupsService } from 'src/groups/groups.service';

@Controller('entries')
export class EntriesController {
    constructor(
        private readonly entriesService: EntriesService,
        private readonly groupsService: GroupsService
    ){}

    @UseGuards(JwtAuthGuard)
    @Get('/user/:id')
    async findAll(@Param('id') userId: string, @Request() req: any, @Query('groupId') groupId?: string){
        if (Number(userId) !== req.user.id) {
            throw new HttpException('Acesso não autorizado.', HttpStatus.FORBIDDEN);
        }
        return this.entriesService.findAll(req.user, groupId ? Number(groupId) : undefined);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') entryId: string, @Request() req: any){
        const entry = await this.entriesService.findOne(Number(entryId));

        if(!entry){
            throw new HttpException(`Entrada não encontrada`, HttpStatus.NOT_FOUND);
        }

        if (entry.user_id !== req.user.id) {
            if (entry.group_id) {
                const userGroups = await this.groupsService.findUserGroups(req.user.id);
                const isMemberOfGroup = userGroups.some(group => group.id === entry.group_id);
                if (!isMemberOfGroup) {
                    throw new HttpException('Acesso não autorizado ao grupo desta entrada.', HttpStatus.FORBIDDEN);
                }
            } else {
                throw new HttpException('Acesso não autorizado a esta entrada.', HttpStatus.FORBIDDEN);
            }
        }
        return entry;
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() entry: any, @Request() req: any){
        entry.user_id = req.user.id;

        if (!entry.group_id) { 
            throw new HttpException('Lançamento deve estar vinculado a um grupo.', HttpStatus.BAD_REQUEST);
        }

        const userGroups = await this.groupsService.findUserGroups(req.user.id);
        const isMemberOfGroup = userGroups.some(group => group.id === entry.group_id);
        if (!isMemberOfGroup) {
            throw new HttpException('Você não tem permissão para adicionar entradas a este grupo.', HttpStatus.FORBIDDEN);
        }
        return this.entriesService.create(entry);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Param('id') entryId: string, @Body() updatedEntry: any, @Request() req: any){
        const existingEntry = await this.entriesService.findOne(Number(entryId));
        if (!existingEntry) {
            throw new HttpException('Entrada não encontrada.', HttpStatus.NOT_FOUND);
        }

        if (!updatedEntry.group_id) {
            throw new HttpException('Lançamento deve estar vinculado a um grupo.', HttpStatus.BAD_REQUEST);
        }

        if (updatedEntry.group_id !== existingEntry.group_id) {
            const userGroups = await this.groupsService.findUserGroups(req.user.id);
            const isMemberOfNewGroup = userGroups.some(group => group.id === updatedEntry.group_id);
            if (!isMemberOfNewGroup) {
                throw new HttpException('Você não tem permissão para mover entradas para este novo grupo.', HttpStatus.FORBIDDEN);
            }
        }

        if (existingEntry.user_id !== req.user.id) {
            const userGroups = await this.groupsService.findUserGroups(req.user.id);
            const isMemberOfOriginalGroup = userGroups.some(group => group.id === existingEntry.group_id);
             if (!isMemberOfOriginalGroup) {
                throw new HttpException('Você não tem permissão para editar esta entrada.', HttpStatus.FORBIDDEN);
            }
        }

        return this.entriesService.update(Number(entryId), updatedEntry);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') entryId: string, @Request() req: any){
        const existingEntry = await this.entriesService.findOne(Number(entryId));
        if (!existingEntry) {
            throw new HttpException('Entrada não encontrada.', HttpStatus.NOT_FOUND);
        }

        if (existingEntry.user_id !== req.user.id) {
            const userGroups = await this.groupsService.findUserGroups(req.user.id);
            const isMemberOfGroup = userGroups.some(group => group.id === existingEntry.group_id);
            if (!isMemberOfGroup) {
                throw new HttpException('Você não tem permissão para excluir entradas deste grupo.', HttpStatus.FORBIDDEN);
            }
        }
        return this.entriesService.delete(Number(entryId));
    }
}