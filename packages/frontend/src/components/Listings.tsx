import { useContext, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { EyeOff } from 'lucide-react'
import './listings.css'
import useTrustlist from "@/hooks/useTrustlist"
import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'
import Interface from '../contexts/interface'
import { Link } from 'react-router-dom'
import { TrustScoreKeyEnum } from '@/data'

type Props = {
  section: string
  category: string
}

type Listing = {
  _id: string
  epoch: number | undefined
  section: string
  title: string
  amount: string
  amountType: string
  description: string
  scoreString: string
  dealOpened: boolean
  posterDealClosed: boolean
  responderDealClosed: boolean
}

export default observer(({ section, category }: Props) => {
  const { calcScoreFromUserData } = useTrustlist()
  const app = useContext(Trustlist)
  const user = useContext(User)
  const ui = useContext(Interface)
  const trustScoreKeys = Object.keys(TrustScoreKeyEnum) as (keyof typeof TrustScoreKeyEnum)[]
  let listingClass = 'listing-item'

  useEffect(() => {
    const loadData = async () => {
      await app.loadSelectedCategory(section, category)
    }
    loadData()
  }, [section, category])

  let listings = []
  if (section === 'for sale') {
    listings = app.forSaleByCategory.get(category)
  } else if (section === 'DevConnect') {
    listings = app.DevConnectByCategory.get(category)
  } else if (section === 'housing') {
    listings = app.housingByCategory.get(category)
  } else if (section === 'jobs') {
    listings = app.jobsByCategory.get(category)
  } else {
    listings = app.servicesByCategory.get(category)
  }
  
  return (
    <div className="listings">
      {category === '' ? 
        <div className="message">choose a category...</div>
      : null}
      {category !== '' && (!listings || listings.length < 1) ? 
        <div className="message">no listings here yet!</div>
      : null}
      {listings
        ? listings
          .slice()
          .reverse()
          .map((listing: Listing) => {
            const scores = JSON.parse(listing.scoreString)
            {listing.epoch != user.userState?.sync.calcCurrentEpoch()
              ? (listingClass = 'listing-expired')
              : null
            }
            return (
              <Link to={`/listings/${listing._id}`}>
                <div
                  className={listingClass}
                  key={listing._id}
                >
                  {!ui.isMobile ? <div className="thumbnail">TL</div> : null}
                  <div>
                    {!ui.isMobile ? 
                      <div className="listing-title">{listing.title.slice(0, 50)}</div>
                    : 
                      <div className="listing-title">{listing.title.slice(0, 25)}</div>
                    }
                    {listing.posterDealClosed && listing.responderDealClosed ? 
                      <div style={{ display: 'flex' }}>
                        <div className='listing-amount' style={{ textDecoration: 'line-through'}}>${listing.amount}</div>
                        <div className="complete">deal completed</div>
                      </div>
                    : null}
                    {listing.dealOpened && !listing.posterDealClosed ? 
                      <div style={{ display: 'flex' }}>
                        <div className='listing-amount' style={{ textDecoration: 'line-through' }}>${listing.amount}</div>
                        <div className="accepted">offer accepted</div>
                      </div>
                    : null}
                    {!listing.dealOpened ? 
                      <div className='listing-amount'>${listing.amount}</div>
                    : null}
                    {listingClass === 'listing-item' ? 
                      <div className="listing-description">{listing.description}</div>
                    : 
                      <div style={{ marginRight: '200px', color: 'black' }}>EXPIRED</div>
                    }
                  </div>
                  <div className="score-container">
                    {trustScoreKeys.map((key) => {
                      const matchingEntry = Object.entries(scores).filter(([scoreName]) => scoreName === key)[0]
                      const revealed = matchingEntry !== undefined;
                      const initiated = matchingEntry ? Number(matchingEntry[1]) >> 23 : 0
                      const value = revealed 
                        ? initiated === 0 
                          ? 'n/a' : calcScoreFromUserData(Number(matchingEntry[1]))
                        : <EyeOff color='blue' size={20} strokeWidth={2.3}/>
                      return (
                        <div className="score-item"key={key}>{value}</div>
                      )  
                    })}
                  </div>
                </div>
              </Link>
            )
          })
        : null}
    </div>
  )
})
