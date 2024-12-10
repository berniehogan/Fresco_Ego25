import { z } from 'zod';
import {
  entityAttributesProperty,
  entityPrimaryKeyProperty,
} from '~/lib/shared-consts';

const ZNcEntity = z.object({
  [entityPrimaryKeyProperty]: z.string().readonly(),
  type: z.string().optional(),
  [entityAttributesProperty]: z.record(z.string(), z.any()),
});

export const ZNcNode = ZNcEntity.extend({
  type: z.string(),
  stageId: z.string().optional(),
  promptIDs: z.array(z.string()).optional(),
  displayVariable: z.string().optional(),
});

export const ZNcEdge = ZNcEntity.extend({
  type: z.string(),
  from: z.string(),
  to: z.string(),
});

// Always use this instead of ~/lib/shared-consts. Main difference is that ego is not optional.
export const ZNcNetwork = z.object({
  nodes: z.array(ZNcNode),
  edges: z.array(ZNcEdge),
  ego: ZNcEntity,
});

export type NcNetwork = z.infer<typeof ZNcNetwork>;
