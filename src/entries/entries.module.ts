import { Module } from '@nestjs/common';
import { Entries } from './entries.entity';
import { EntriesService } from './entries.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntriesController } from './entries.controller';
import { GroupsModule } from 'src/groups/groups.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Entries]),
    GroupsModule 
  ],
  providers: [EntriesService],
  controllers: [EntriesController],
})
export class EntriesModule {}