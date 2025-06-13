import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignsService } from './services/campaigns.service';
import { CampaignsController } from './controllers/campaigns.controller';
import { Campaign } from './entities/campaign.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign])],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}