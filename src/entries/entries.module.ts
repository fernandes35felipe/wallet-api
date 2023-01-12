import { Module } from '@nestjs/common';
import { Entries } from './entries.entity';
import { EntriesService } from './entries.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntriesController } from './entries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Entries])],
  providers: [EntriesService],
  controllers: [EntriesController],
})
export class EntriesModule {}
