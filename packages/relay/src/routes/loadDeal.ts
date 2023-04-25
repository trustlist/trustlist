import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.get('/api/loadDeal/:id', async (req, res) => {
    try {
      const { id } = req.params
      const deal = await db.findOne('Listings', {
        where: {
          _id: id,
        },
      })
      console.log(deal)
      res.json(deal)
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}