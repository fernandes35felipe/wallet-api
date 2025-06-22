import {Controller, Get, Post, Put, Delete, Param, Body,Request, HttpCode, HttpStatus, HttpException,UseGuards, ForbiddenException } from '@nestjs/common';
import { CreateGroupDto } from './dto/createGroup.dto';
import { GroupsService } from './groups.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService,
        private authService: AuthService,
        ){}

    @Get()
    findAll(){
        return this.groupsService.findAll()
    }

    @Get('/tag')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('tagname') tagname: string){
        const group =  this.groupsService.findByTag(tagname)

        if(!group){
            throw new HttpException(`Usuário não encontrado`, HttpStatus.NOT_FOUND)
        }
        return group
    }

    @Get('/user/:id')
    @UseGuards(JwtAuthGuard)
    findUserGroups(@Param('id') id: string){
        return this.groupsService.findUserGroups(Number(id))
    }

    @UseGuards(JwtAuthGuard)
    @Get(':groupId/members') 
    async getGroupMembers(@Param('groupId') groupId: string, @Request() req: any) {
        const isMember = (await this.groupsService.findUserGroups(req.user.id)).some(g => g.id === Number(groupId));
        if (!isMember) {
            throw new ForbiddenException('Você não tem permissão para visualizar os membros deste grupo.');
        }
        return this.groupsService.getGroupMembers(Number(groupId));
    }


    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createGroupDto: CreateGroupDto, @Request() req: any){
        createGroupDto.userId = req.user.id;
        return this.groupsService.create(createGroupDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updatedGroup: any, @Request() req: any){
        const isAdmin = await this.groupsService.isUserGroupAdmin(req.user.id, Number(id));
        if (!isAdmin) {
            throw new ForbiddenException('Você não tem permissão de administrador para editar este grupo.');
        }
        return this.groupsService.update(Number(id), updatedGroup)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: string, @Request() req: any){
        const isAdmin = await this.groupsService.isUserGroupAdmin(req.user.id, Number(id));
        if (!isAdmin) {
            throw new ForbiddenException('Você não tem permissão de administrador para excluir este grupo.');
        }
        return this.groupsService.delete(Number(id))
    }

    @UseGuards(JwtAuthGuard)
    @Post(':groupId/add-users')
    async addUsersToGroup(@Param('groupId') groupId: string, @Body('userEmails') userEmails: string[], @Request() req: any) {
        const isAdmin = await this.groupsService.isUserGroupAdmin(req.user.id, Number(groupId));
        if (!isAdmin) {
            throw new ForbiddenException('Você não tem permissão de administrador para adicionar usuários a este grupo.');
        }
        return this.groupsService.addUsersToGroup(Number(groupId), userEmails);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':groupId/remove-user/:userIdToRemove')
    async removeUserFromGroup(@Param('groupId') groupId: string, @Param('userIdToRemove') userIdToRemove: string, @Request() req: any) {
        const isAdmin = await this.groupsService.isUserGroupAdmin(req.user.id, Number(groupId));
        if (!isAdmin) {
            throw new ForbiddenException('Você não tem permissão de administrador para remover usuários deste grupo.');
        }
        return this.groupsService.removeUserFromGroup(Number(groupId), Number(userIdToRemove));
    }

    @UseGuards(JwtAuthGuard)
    @Put(':groupId/update-admin-status/:userIdToUpdate') 
    async updateUserGroupAdminStatus(@Param('groupId') groupId: string, @Param('userIdToUpdate') userIdToUpdate: string, @Body('isAdmin') isAdminStatus: boolean, @Request() req: any) {
        const isAdmin = await this.groupsService.isUserGroupAdmin(req.user.id, Number(groupId));
        if (!isAdmin) {
            throw new ForbiddenException('Você não tem permissão de administrador para alterar o status de admin.');
        }
        return this.groupsService.updateUserGroupAdminStatus(Number(groupId), Number(userIdToUpdate), isAdminStatus);
    }
}