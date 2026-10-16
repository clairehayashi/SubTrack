import { z } from 'zod'
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success)
      return res
        .status(400)
        .json({
          error: result.error.issues
            .map((i) => `${i.path.join('.') || 'Request'}: ${i.message}`)
            .join('; ')
        })
    req.body = result.data
    next()
  }
}
export function validId(req, res, next) {
  if (!z.string().uuid().safeParse(req.params.id).success)
    return res.status(400).json({ error: 'Invalid record ID.' })
  next()
}
