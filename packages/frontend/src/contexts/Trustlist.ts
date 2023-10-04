import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { SERVER } from '../config'

class Trustlist {
    scoreNames: string[] = []
    listingScoreDescriptions: string[] = []
    scoreDescriptions: string[] = []
    sections: string[] = []
    categoriesBySection = new Map()
    listingsById = new Map()
    forSaleByCategory = new Map()
    jobsByCategory = new Map()
    servicesByCategory = new Map()
    housingByCategory = new Map()
    offersByListingId = new Map()
    memberActiveDeals = []
    memberActiveListings = []
    memberActiveOffers = []

    constructor() {
        makeAutoObservable(this)
        this.load()
    }

    async load() {
        this.scoreNames = ['LP', 'LO', 'CB', 'GV']
        this.scoreDescriptions = [
            "Legit Posting score: percentage of member's listings that have resulted in completed deals.",
            "Legit Offer score: member's record for completing deals after their offer has been accepted.",
            "Community Building score: member's record for submitting reviews of the deals they have been involved in.",
            'Good Vibes score : percentage of all possible points others have awarded this member for being friendly, communicative, and respectful.',
        ]
        this.categoriesBySection.set('DevConnect!', ['available', 'wanted'])
        this.categoriesBySection.set('for sale', [
            'antiques',
            'appliances',
            'auto parts',
            'baby',
            'beauty',
            'bikes',
            'boats',
            'books',
            'cars+trucks',
            'clothes',
            'electronics',
            'farm+garden',
            'furniture',
            'household',
            'jewelry',
            'materials',
            'sporting',
            'tickets',
            'tools',
            'toys',
            'trailers',
            'video',
            'wanted',
        ])
        this.categoriesBySection.set('housing', [
            'apts/houses',
            'swap',
            'wanted',
            'commercial',
            'parking/storage',
            'rooms/shared',
            'sublets/temporary',
            'vacation rentals',
        ])
        this.categoriesBySection.set('jobs', [
            'accounting',
            'admin',
            'arch/eng',
            'art/design',
            'biotech',
            'business',
            'customer service',
            'education',
            'etc/misc',
            'food/bev',
            'government',
            'legal',
            'maufacturing',
            'marketing',
            'medical',
            'nonprofit',
            'real estate',
            'retail',
            'sales',
            'salon/spa',
            'software',
            'technical',
            'tv/film',
            'writing/editing',
        ])
        this.categoriesBySection.set('services', [
            'automotive',
            'beauty',
            'cell/mobile',
            'computer',
            'creative',
            'event',
            'financial',
            'health',
            'household',
            'labor',
            'legal',
            'lessons',
            'pet',
            'real estate',
            'skilled trade',
            'travel',
        ])
        this.categoriesBySection.forEach((value, key) => {
            this.sections.push(key)
        })
    }

    async createNewListing(
        epoch: any,
        section: string,
        category: string,
        title: string,
        amount: string,
        amountType: string,
        description: string,
        posterId: string,
        scoreString: string
    ) {
        const data = await fetch(`${SERVER}/api/addListing`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                epoch,
                section,
                category,
                title,
                amount,
                amountType,
                description,
                posterId,
                scoreString,
            }),
        }).then((r) => r.json())
        return data.message
    }

    async submitOffer(
        epoch: any,
        listingId: string,
        listingTitle: string,
        responderId: string,
        offerAmount: string,
        scoreString: string
    ) {
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

    async dealOpen(id: string, offerAmount: string, responderId: string) {
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

    async dealClose(id: string, member: string) {
        const data = await fetch(`${SERVER}/api/dealClose`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                id,
                member,
            }),
        }).then((r) => r.json())
        return data.message
    }

    async submitReview(id: string, member: string, review: string) {
        const data = await fetch(`${SERVER}/api/submitReview`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                id,
                member,
                review,
            }),
        }).then((r) => r.json())
        return data.message
    }

    async loadSelectedCategory(section: string, category: string) {
        const listings = await fetch(`${SERVER}/api/loadListings`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                section,
                category,
            }),
        }).then((r) => r.json())
        this.ingestListings(listings, section, category)
    }

    async ingestListings(_listings: string, section: string, category: string) {
        const listings = [_listings].flat()
        if (section === 'for sale') {
            this.forSaleByCategory.set(category, listings)
        } else if (section === 'housing') {
            this.housingByCategory.set(category, listings)
        } else if (section === 'jobs') {
            this.jobsByCategory.set(category, listings)
        } else {
            this.servicesByCategory.set(category, listings)
        }
    }

    async loadOffers(id: string) {
        const data = await fetch(`${SERVER}/api/loadOffers/${id}`).then((r) =>
            r.json()
        )
        this.offersByListingId.set(id, data)
    }

    async loadDealById(id: string) {
        const data = await fetch(`${SERVER}/api/loadDeal/${id}`).then((r) =>
            r.json()
        )
        this.listingsById.set(id, data)
    }

    async loadMemberActivity(epochKeys: string[]) {
        const { deals, listings, offers } = await fetch(
            `${SERVER}/api/loadActivity`,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    epochKeys,
                }),
            }
        ).then((r) => r.json())
        this.memberActiveDeals = deals
        this.memberActiveListings = listings
        this.memberActiveOffers = offers
    }

    calcScoreFromUserData(data: number) {
        if (data === 0) return 0
        const score = Math.floor(((data % 128) / (data >> 23)) * 100)
        return score
    }

    calcScoresFromDB(data: {}) {
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
}

export default createContext(new Trustlist())
