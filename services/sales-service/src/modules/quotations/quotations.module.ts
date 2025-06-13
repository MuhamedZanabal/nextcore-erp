import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationsService } from './services/quotations.service';
import { QuotationsController } from './controllers/quotations.controller';
import { Quotation } from './entities/quotation.entity';
import { QuotationLine } from './entities/quotation-line.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quotation, QuotationLine])],
  controllers: [QuotationsController],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationsModule {}