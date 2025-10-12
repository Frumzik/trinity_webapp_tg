import { z } from 'zod'
export const InitDataSchema = z.object({ initData: z.string().min(10) })
export type InitDataDTO = z.infer<typeof InitDataSchema>
