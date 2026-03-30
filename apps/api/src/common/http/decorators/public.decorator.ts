import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/http.constants.js';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
