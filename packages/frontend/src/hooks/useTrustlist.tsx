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

    const makeOffer = async (offerData: any
        // epoch: any,
        // listingId: string,
        // listingTitle: string, // Why do we need this for the offer?
        // responderId: string,
        // offerAmount: string,
        // scoreString: string
    ) => {
        // TODO: /api/{listingId}/offers/new
        const data = await fetch(`${SERVER}/api/submitOffer`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
              ...offerData
                // epoch,
                // listingId,
                // listingTitle,
                // responderId,
                // offerAmount,
                // scoreString,
            }),
        }).then((r) => r.json())
        return data.message
    }

    const openDeal = async (dealData: any) => {
        // TODO: /api/{listingId}/offers/{offerId}/accept
        const data = await fetch(`${SERVER}/api/dealOpen`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
              ...dealData
                // id,
                // offerAmount,
                // responderId,
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

    const calcScoreFromUserData = (data: number) => {
        if (data === 0) return 0
        const score = Math.floor(((data % 128) / (data >> 23)) * 100)
        return score
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

    return { createNewListing, makeOffer, openDeal, closeDeal, addReview, getOffers, getDeals, getUserActivity, calcScoreFromUserData }
}

export default useTrustlist;
