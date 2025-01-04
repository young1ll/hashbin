import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

import { isArgon2, isBcrypt, isMD5, isSHA1, isSHA256 } from '../utils';

type HashValueType =
  | 'argon2' // HashType.Argon2
  | 'bcrypt' // HashType.Bcrypt
  | 'sha1'
  | 'sha256'
  | 'md5';

interface IsHashedOptions extends ValidationOptions {
  type?: HashValueType;
}

export function IsHashed({ type, ...validationOptions }: IsHashedOptions = {}): PropertyDecorator {
  return function (object, propertyKey) {
    registerDecorator({
      name: 'isHashed',
      target: object.constructor,
      propertyName: propertyKey.toString(),
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          if (typeof value !== 'string') {
            return false;
          }

          if (!type) {
            return isBcrypt(value) || isArgon2(value);
          }

          return mapValidationByHashType(type, value);
        },

        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be hashed`;
        },
      },
    });
  };
}

function mapValidationByHashType(type: HashValueType, value: string): boolean {
  return {
    ['bcrypt']: isBcrypt(value),
    ['argon2']: isArgon2(value),
    ['md5']: isMD5(value),
    ['sha1']: isSHA1(value),
    ['sha256']: isSHA256(value),
    default: false,
  }[type];
}
