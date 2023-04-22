import { createContext} from 'react'
import { makeAutoObservable } from 'mobx'
import { ZkIdentity, Strategy, hash1, stringifyBigInts } from '@unirep/utils'
import { UserState, schema } from '@unirep/core'
import { MemoryConnector } from 'anondb/web'
import { constructSchema } from 'anondb/types'
import { provider, UNIREP_ADDRESS, APP_ADDRESS, SERVER } from '../config'
import prover from './prover'
import poseidon from 'poseidon-lite'

class Trustlist {

  sections: string[] = []
  categoriesBySection = new Map()
  listingsById = new Map()
  forSaleByCategory = new Map()
  wantedByCategory = new Map()
  jobsByCategory = new Map()
  servicesByCategory = new Map()
  housingByCategory = new Map()
  activityByMemberId = new Map()

  constructor() {
    makeAutoObservable(this)
    this.load()
  }

  async load() {
    this.categoriesBySection.set('for sale', ['antiques', 'appliances', 'auto parts', 'baby', 'beauty', 'bikes', 'boats', 'books', 'cars+trucks', 'clothes', 'electronics', 'farm+garden', 'furniture', 'household', 'jewelry', 'materials', 'sporting', 'tickets', 'tools', 'toys', 'trailers', 'video', 'wanted'])
    this.categoriesBySection.set('housing', ['apts/houses', 'swap', 'wanted', 'commercial', 'parking/storage', 'rooms/shared', 'sublets/temporary', 'vacation rentals'])
    this.categoriesBySection.set('jobs', ['accounting', 'admin', 'arch/eng', 'art/design', 'biotech', 'business', 'customer service', 'education', 'etc/misc', 'food/bev', 'government', 'legal', 'maufacturing', 'marketing', 'medical', 'nonprofit', 'real estate', 'retail', 'sales', 'salon/spa', 'software', 'technical', 'tv/film', 'writing/editing'])
    this.categoriesBySection.set('services', ['automotive', 'beauty', 'cell/mobile', 'computer', 'creative', 'event', 'financial', 'health', 'household', 'labor', 'legal', 'lessons', 'pet', 'real estate', 'skilled trade', 'travel'])
    this.categoriesBySection.forEach((value, key) => {this.sections.push(key)})
    this.forSaleByCategory.set('antiques', [{_id: '54321', epoch: 28, section: 'for sale', title: 'Really old chair', amount: '200', amountType: 'one time', pScore1: '56', pScore2: '77', pScore3: '67', pScore4: "81", description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}, {_id: '12345', epoch: 10, section: 'for sale', title: 'Vintage Lamp', amount: '125', amountType: 'one time', pScore1: '44', pScore2: '87', pScore3: '66', pScore4: '99', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}])
    this.forSaleByCategory.set('appliances', [{_id: '67890', section: 'for sale', title: 'Refrigerator: like new', amount: '600', amountType: 'one time', pScore1: '34', pScore2: '90', pScore3: '97', pScore4: "55", description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}, {_id: '09876', section: 'for sale', title: 'Stacking washer/dryer combo', amount: '450', amountType: 'one time', pScore1: '52', pScore2: '56', pScore3: '33', pScore4: '78', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}])

  }

  async createNewListing(epoch: number | undefined, section: string, category: string, title: string, amount: string, amountType: string, description: string, posterId: string, pScore1: string, pScore2: string, pScore3: string, pScore4: string) {
    const data = await fetch(`${SERVER}/api/addListing`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        section,
        category,
        title,
        amount,
        amountType,
        description,
        posterId,
        pScore1,
        pScore2,
        pScore3,
        pScore4,
      })
    }).then(r => r.json())
    console.log(data.message)
  }

  async submitOffer(listingId: string, section: string, responderId: string, offerAmount: string, rScore1: string, rScore2: string, rScore3: string, rScore4: string) {
    console.log(listingId, section, responderId, offerAmount, rScore1, rScore2, rScore3, rScore4)
    const data = await fetch(`${SERVER}/api/submitOffer`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        listingId,
        section,
        responderId,
        offerAmount,
        rScore1,
        rScore2,
        rScore3,
        rScore4,
      })
    }).then(r => r.json())
    console.log(data.message)
  }

  async updateDeal(id: string, action: string) {
    const data = await fetch(`${SERVER}/api/updateDeal`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        id,
        action,
      })
    }).then(r => r.json())
    console.log(data.message)
  }

  async loadSelectedCategory(section: string, category: string) {
    const listings = await fetch(`${SERVER}/api/loadListings/${section}/${category}`).then((r) => r.json())
    console.log(listings)
    this.ingestListings(listings, section, category)
  }

  async ingestListings(_listings: string, section: string, category: string) {
    // console.log(_listings, section, category)
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

  async loadDealById(id: string) {
    const data = await fetch(`${SERVER}/api/loadDeal/${id}`).then((r) => r.json())
    this.listingsById.set(id, data)
  }


  async loadMemberActivity(epk1: string, epk2: string, epk3: string) {
    const data = await fetch(`${SERVER}/api/loadActivity`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        epk1,
        epk2,
        epk3,
      })
    }).then((r) => r.json())
    console.log(data)
    // this.activityByMemberId.set()
  }

  async removeListing(id: string) {
    const data = await fetch(`${SERVER}/api/removeListing/${id}`).then((r) => r.json())
  }

}

export default createContext(new Trustlist())