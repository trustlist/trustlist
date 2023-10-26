import { NewListingResponse } from '@/pages/NewListing'
import { SERVER } from '../config'

const useTrustlist = () => {
    const createNewListing = async (
        newListing: NewListingResponse
    ) => {
        // TODO: /api/listings/new
        const data = await fetch(`${SERVER}/api/addListing`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                ...newListing
                // epoch,
                // section,
                // category,
                // title,
                // amount,
                // amountType,
                // description,
                // posterId,
                // scoreString,
            }),
        }).then((r) => r.json())
        return data.message
    }

    const makeOffer = async (
        epoch: any,
        listingId: string,
        listingTitle: string, // Why do we need this for the offer?
        responderId: string,
        offerAmount: string,
        scoreString: string
    ) => {
        // TODO: /api/{listingId}/offers/new
        const data = await fetch(`${SERVER}/api/submitOffer`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                epoch,
                listingId,
                listingTitle,
                responderId,
                offerAmount,
                scoreString,
            }),
        }).then((r) => r.json())
        return data.message
    }

    const openDeal = async (id: string, offerAmount: string, responderId: string) => {
        // TODO: /api/{listingId}/offers/{offerId}/accept
        const data = await fetch(`${SERVER}/api/dealOpen`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                id,
                offerAmount,
                responderId,
            }),
        }).then((r) => r.json())
        return data.message
    }


    const closeDeal = async (listingId: string, member: string) => {
        // Is this the dealId or the listingId?
        // TODO: /api/listings/{listingId}/close
        const data = await fetch(`${SERVER}/api/dealClose`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                id: listingId,
                member,
            }),
        }).then((r) => r.json())
        return data.message
    }

    const addReview = async (listingId: string, member: string, review: string) => {
        // TODO: /api/listings/{listingId}/reviews/new
        const data = await fetch(`${SERVER}/api/submitReview`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                id: listingId,
                member,
                review,
            }),
        }).then((r) => r.json())
        return data.message
    }

    const getOffers = async (listingId: string) => {
        // TODO: Should be /api/{listingId}/offers
        const data = await fetch(`${SERVER}/api/loadOffers/${listingId}`).then((r) =>
            r.json()
        )
        return { listingId, data };
    }

    const getDeals = async (listingId: string) => {
        // TODO: Should be /api/{listingId}/deals
        const data = await fetch(`${SERVER}/api/loadDeal/${listingId}`).then((r) =>
            r.json()
        )
        return { listingId, data }
    }

    const getUserActivity = async (userEpochKeys: string[]) => {
        const { deals, listings, offers } = await fetch(
            `${SERVER}/api/loadActivity`,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    epochKeys: userEpochKeys,
                }),
            }
        ).then((r) => r.json())
        return { user: userEpochKeys, deals, listings, offers }
    }

    // TODO: Could the two following fns be one? Core score calc is the same, only diff is what's passed to them
    // For current user related actions (dashboard, createListings)
    const calcScoreFromUserData = (data: number) => {
        if (data === 0) return 'n/a'
        const score = Math.floor(((data % 128) / (data >> 23)) * 100)
        return score
    }

    // TODO: Find out a way to transform the data coming from the contract to be more suitable for a database

    // LP: [X, X] - posted x , completed x
    // CV: [X, X]
    // GB: [X, X]

    // LP: {
    //     created: 0,
    //     completed: 0
    // }

    // score = created / completed * 100

    // For showing listings
    const calcScoresFromDB = (data: {}) => {
        const scores: Number[] = []
        const dataValues = Object.values(data)
        for (let i = 0; i < dataValues.length; i++) {
            if (dataValues[i] === 'X') {
                scores.push(9999999)
            } else if (dataValues[i] === 0) {
                scores.push(0)
            } else {
                const score = Math.floor(
                    ((Number(dataValues[i]) % 128) /
                        (Number(dataValues[i]) >> 23)) *
                    100
                )
                scores.push(score)
            }
        }
        return scores
    }

    // const loadSelectedCategory = async(section: string, category: string) => {
    //     const listings = await fetch(`${SERVER}/api/loadListings`, {
    //         method: 'POST',
    //         headers: {
    //             'content-type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             section,
    //             category,
    //         }),
    //     }).then((r) => r.json())
    //     this.ingestListings(listings, section, category)
    // }

    // const ingestListings = async(_listings: string, section: string, category: string) => {
    //     const listings = [_listings].flat()
    //     if (section === 'for sale') {
    //         this.forSaleByCategory.set(category, listings)
    //     } else if (section === 'housing') {
    //         this.housingByCategory.set(category, listings)
    //     } else if (section === 'jobs') {
    //         this.jobsByCategory.set(category, listings)
    //     } else {
    //         this.servicesByCategory.set(category, listings)
    //     }
    // }

    return { createNewListing, makeOffer, openDeal, closeDeal, addReview, getOffers, getDeals, getUserActivity, calcScoreFromUserData, calcScoresFromDB }
}

export default useTrustlist;
