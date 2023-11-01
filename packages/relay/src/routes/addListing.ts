import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import { Prover } from '@unirep/circuits'

export default (
    app: Express,
    prover: Prover,
    db: DB,
    synchronizer: Synchronizer
) => {
    app.post('/api/addListing', async (req, res) => {
        const {
            epoch,
            section,
            category,
            title,
            amount,
            amountType,
            description,
            contact,
            posterId,
            scoreString,
        } = req.body
        console.log(
            epoch,
            section,
            category,
            title,
            amount,
            amountType,
            description,
            contact,
            posterId,
            scoreString
        )
        try {
            const {
                epoch,
                section,
                category,
                title,
                amount,
                amountType,
                description,
                contact,
                posterId,
                scoreString,
            } = req.body
            // console.log(epoch, section, category, title, amount, amountType, description, posterId, scoreString)
            await db.create('Listings', {
                epoch,
                section,
                category,
                title,
                amount,
                amountType,
                description,
                contact,
                posterId,
                scoreString,
                responderId: '',
                offerAmount: '',
                dealOpened: false,
                posterDealClosed: false,
                responderDealClosed: false,
                posterReview: '',
                responderReview: '',
            })
            res.json({ message: 'listing added!' })
        } catch (error: any) {
            res.status(500).json({ message: error })
        }
    })
}
