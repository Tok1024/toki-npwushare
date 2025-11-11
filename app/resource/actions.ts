'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { resourceSchema } from '~/validations/resource'
import { getCourseResources } from '~/app/api/resource/route'

export const kunGetActions = async (params: z.infer<typeof resourceSchema>) => {
  const input = safeParseSchema(resourceSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const response = await getCourseResources(input)
  return response
}
