import { Inject, Injectable } from '@nestjs/common';
import { Variant } from './variant.entity';
import { CreateVariantDto } from './dto/create_variant.dto';

@Injectable()
export class VariantService {
  constructor(
    @Inject('VARIANT_REPOSITORY') private variantRepository: typeof Variant,
  ) {}
  async create(
    item_id: number,
    variantData: CreateVariantDto[],
    transaction: any,
  ) {
    // Use Sequelize's bulkCreate method to save multiple variants at once
    const mappedDto = variantData.map((variantDto) => ({
      ...variantDto,
      item_id: item_id,
    }));
    const newVariant = await this.variantRepository.bulkCreate(mappedDto, {
      transaction,
    });
    return newVariant;
  }
  async findByItemID(item_id: number): Promise<Variant[]> {
    const variants = await this.variantRepository.findAll({
      where: { item_id: item_id },
    });
    return variants;
  }
  async delete(id: number): Promise<boolean> {
    const result = await this.variantRepository.destroy({ where: { id } });
    return result > 0;
  }
}
