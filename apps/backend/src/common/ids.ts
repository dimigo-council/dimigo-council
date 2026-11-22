import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { z } from 'zod';

/**
 * The largest value of a PostgreSQL `integer` column. Activities, tasks,
 * inquiries, surveys and departments use integer ids, and PostgreSQL rejects a
 * larger number in a query with an error instead of finding no row.
 */
export const MAX_ROW_ID = 2_147_483_647;

/** An integer row id in a JSON body. */
export const rowId = z.number().int().positive().max(MAX_ROW_ID);

/** An integer row id in a query string. */
export const queryRowId = z.coerce.number().int().positive().max(MAX_ROW_ID);

/** Parses an integer row id route parameter such as `/activities/:id`. */
@Injectable()
export class ParseRowIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = /^\d+$/.test(value) ? Number(value) : NaN;
    if (!Number.isInteger(id) || id < 1 || id > MAX_ROW_ID)
      throw new BadRequestException(
        `Validation failed (an id from 1 to ${MAX_ROW_ID} is expected)`,
      );
    return id;
  }
}
