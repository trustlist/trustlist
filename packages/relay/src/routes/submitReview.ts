import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.post('/api/SubmitReview', async (req, res) => {
    try {
      const { id, member} = req.body
      if (member === 'poster') {
        await db.update('Listings', {
          where: {
            _id: id,
          },
          update: {
            posterAttested: true,
          },
        }) 
      } else {
        await db.update('Listings', {
          where: {
            _id: id,
          },
          update: {
            responderAttested: true,
          },
        }) 
      }   
      res.json({ message: 'success!' })
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}