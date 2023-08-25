import { Express } from 'express'
import { Prover } from '@unirep/circuits'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (
    app: Express,
    prover: Prover,
    db: DB,
    synchronizer: Synchronizer
) => {
    app.post('/api/dealClose', async (req, res) => {
        try {
            const { id, member } = req.body
            if (member === 'poster') {
                await db.update('Listings', {
                    where: {
                        _id: id,
                    },
                    update: {
                        posterDealClosed: true,
                    },
                })
            } else {
                await db.update('Listings', {
                    where: {
                        _id: id,
                    },
                    update: {
                        responderDealClosed: true,
                    },
                })
            }
            res.json({
                message:
                    'success! please complete your review after both parties have confirmed this transaction as complete.',
            })
        } catch (error: any) {
            res.status(500).json({ message: error })
        }
    })
}
