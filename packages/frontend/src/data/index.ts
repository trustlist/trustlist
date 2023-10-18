import { TrustScoreInfo, TrustScoreKey } from '@/types/local'

export enum TrustScoreKeyEnum {
    LP = 'LP',
    LO = 'LO',
    CB = 'CB',
    GV = 'GV',
}

export const trustScores: Record<TrustScoreKey, TrustScoreInfo> = {
    [TrustScoreKeyEnum.LP]: {
        title: 'Legit Posting Score',
        description:
            "Percentage of the member's listings that have resulted in successful deals.",
        isRevealed: true,
        score: 0,
    },
    [TrustScoreKeyEnum.LO]: {
        title: 'Legit Offer Score',
        description:
            "The member's record for successfully completing deals after their offer has been accepted.",
        isRevealed: true,
        score: 0,
    },
    [TrustScoreKeyEnum.CB]: {
        title: 'Community Building Score',
        description:
            "The member's record for submitting reviews of their deals.",
        isRevealed: true,
        score: 0,
    },
    [TrustScoreKeyEnum.GV]: {
        title: 'Good Vibes Score',
        description:
            'Percentage of all possible points awarded to this member for being friendly, communicative, and respectful.',
        isRevealed: true,
        score: 0,
    },
}

export const listingCategories = {
    devconnect: ['available', 'wanted', 'digital asset', 'souvenir'],
    'for sale': [
        'antiques',
        'appliances',
        'auto parts',
        'baby',
        'beauty',
        'bikes',
        'boats',
        'books',
        'cars/trucks',
        'clothes',
        'electronics',
        'farm/garden',
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
    ],
    housing: [
        'apts/houses',
        'swap',
        'wanted',
        'commercial',
        'parking/storage',
        'rooms/shared',
        'sublets/temporary',
        'vacation rentals',
    ],
}
