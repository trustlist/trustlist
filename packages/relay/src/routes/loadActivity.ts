import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.post('/api/loadActivity', async (req, res) => {
    try {
      const { epoch, epk0, epk1, epk2 } = req.body
      const epk0DealsP = await db.findMany('Listings', {
        where: {
          epoch,
          dealOpened: true,
          posterId: epk0, 
        },
      })
      const epk1DealsP = await db.findMany('Listings', {
        where: {
          epoch,
          dealOpened: true,
          posterId: epk1, 
        },
      })
      const epk2DealsP = await db.findMany('Listings', {
        where: {
          epoch,
          dealOpened: true,
          posterId: epk2, 
        },
      })
      const epk0DealsR = await db.findMany('Listings', {
        where: {
          epoch,
          dealOpened: true,
          responderId: epk0, 
        },
      })
      const epk1DealsR = await db.findMany('Listings', {
        where: {
          epoch,
          dealOpened: true,
          responderId: epk1, 
        },
      })
      const epk2DealsR = await db.findMany('Listings', {
        where: {
          epoch,
          dealOpened: true,
          responderId: epk2, 
        },
      })
      const epk0Listings = await db.findMany('Listings', {
        where: {
          epoch,
          posterId: epk0, 
        },
      })
      const epk1Listings = await db.findMany('Listings', {
        where: {
          epoch,
          posterId: epk1, 
        },
      })
      const epk2Listings = await db.findMany('Listings', {
        where: {
          epoch,
          posterId: epk2, 
        },
      })
      const epk0offers = await db.findMany('Offers', {
        where: {
          epoch,
          responderId: epk0,
        },
      })
      const epk1offers = await db.findMany('Offers', {
        where: {
          epoch,
          responderId: epk1,
        },
      })
      const epk2offers = await db.findMany('Offers', {
        where: {
          epoch,
          responderId: epk2,
        },
      })
      const deals = [epk0DealsP, epk1DealsP, epk2DealsP, epk0DealsR, epk1DealsR, epk2DealsR].flat()
      const listings = [epk0Listings, epk1Listings, epk2Listings].flat()
      const offers = [epk0offers, epk1offers, epk2offers].flat()
      res.json({deals, listings, offers})
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}