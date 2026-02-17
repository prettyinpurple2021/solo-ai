import * as extraSchema from '../../src/db/extra_schema';
import * as sharedSchema from '../../lib/shared/db/schema';

export const schema = {
  ...sharedSchema,
  ...extraSchema,
};

export * from '../../src/db/extra_schema';
export * from '../../lib/shared/db/schema';
