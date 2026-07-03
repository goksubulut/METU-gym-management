import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Ucu global JWT korumasından muaf tutar.
 * 2 Temmuz kararı gereği varsayılan "her şey korumalı"dır; yalnızca
 * login/register/refresh, health ve genel katalog okumaları @Public olur.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
