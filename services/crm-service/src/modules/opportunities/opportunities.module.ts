import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpportunitiesService } from './services/opportunities.service';
import { OpportunitiesController } from './controllers/opportunities.controller';
import { Opportunity } from './entities/opportunity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Opportunity])],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}