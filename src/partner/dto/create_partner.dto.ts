export class CreatePartnerDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly phone_number: string;
  license_number?: string;
}
