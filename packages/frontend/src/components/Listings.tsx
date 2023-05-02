import React from 'react'
import { Link } from "react-router-dom";
import { observer } from 'mobx-react-lite'
import DetailModal from './DetailModal';
import './listings.css'

import Trustlist from '../contexts/Trustlist';
import User from '../contexts/User';
import Tooltip from './Tooltip';

type Props = {
  section: string;
  category: string;
}

type Listing = {
  _id: string;
  epoch: number | undefined;
  section: string;
  title: string;
  amount: string;
  amountType: string;
  description: string;
  pScore1: string;
  pScore2: string;
  pScore3: string;
  pScore4: string;
  offerAmount: string;
  dealOpened: boolean;
  dealClosed: boolean;
}

export default observer(({ section, category }: Props) => {
  
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)
  const [showDetail, setShowDetail] = React.useState<boolean>(false)
  const [detailData, setDetailData] = React.useState<any>()
  console.log(section, category)

  React.useEffect(() => {
    const loadData = async () => {
      await app.loadSelectedCategory(section, category)
    }
    loadData()
  }, [])

  let listings = []
  if (section === 'for sale') {
    listings = app.forSaleByCategory.get(category)
  } else if (section === 'housing') {
    listings = app.housingByCategory.get(category)
  } else if (section === 'jobs') {
    listings = app.jobsByCategory.get(category)
  } else {
    listings = app.servicesByCategory.get(category)
  }
  console.log(listings)

  return (
    <div className='listings'>
      {!listings || listings.length < 1 ? <div className='message'>no listings here yet!</div> : null}
      {listings ? 
        listings.slice().reverse().map((listing: Listing) => (
          <>
            {listing.epoch === user.userState?.sync.calcCurrentEpoch() ?
              <>
                <div 
                  className='listing-item' 
                  key={listing._id} 
                  onClick={() => {
                    setDetailData(listing)
                    setShowDetail(true)
                  }}
                >
                  <div className='thumbnail'>TL</div>
                  <div>
                    <div className='listing-title'>{listing.title}</div>
                        <div>${listing.amount}</div>
                        <div style={{marginRight: '200px'}}>{listing.description}</div>
                        <div style={{fontSize: '0.4rem', cursor: 'pointer'}} onClick={() => app.removeListing(listing._id)}>delete</div>
                  </div>
                  <div>
                    <div className='score-container'>
                      <div className='score-item'>
                        <Tooltip 
                          text='some text here'
                          content={Math.floor((Number(listing.pScore1) % 128) / (Number(listing.pScore1) >> 23) * 100)}
                        />
                      </div>
                      <div className='score-item'>
                        <Tooltip 
                          text='different text here'
                          content={Math.floor((Number(listing.pScore2) % 128) / (Number(listing.pScore2) >> 23) * 100)}
                        />    
                      </div>
                    </div>
                    <div className='score-container'>
                      <div className='score-item'>
                        <Tooltip
                          text='other text'
                          content={Math.floor((Number(listing.pScore3) % 128) / (Number(listing.pScore3) >> 23) * 100)}
                        />  
                      </div>
                      <div className='score-item'>
                        <Tooltip
                          text='differenter text'
                          content={Math.floor(((Number(listing.pScore4) % 128) / (Number(listing.pScore4) >> 23)) / 5 * 100)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {showDetail && <DetailModal listing={detailData} key={detailData._id} setShowDetail={setShowDetail} />}
              </> : 
              <>
                <div className='listing-expired' key={listing._id}>
                  <div className='thumbnail'>TL</div>
                  <div>
                    <div className='listing-title'>{listing.title}</div>
                        <div>reserve amount: ${listing.amount}</div>
                        <div style={{marginRight: '200px', color: 'black'}}>EXPIRED</div>
                        <div style={{fontSize: '0.4rem', cursor: 'pointer'}} onClick={() => app.removeListing(listing._id)}>delete</div>
                  </div>
                  <div>
                    <div className='score-container'>
                      <div className='score-item'>{Math.floor((Number(listing.pScore1) % 128) / (Number(listing.pScore1) >> 23) * 100)}</div>
                      <div className='score-item'>{Math.floor((Number(listing.pScore2) % 128) / (Number(listing.pScore2) >> 23) * 100)}</div>
                    </div>
                    <div className='score-container'>
                      <div className='score-item'>{Math.floor((Number(listing.pScore3) % 128) / (Number(listing.pScore3) >> 23) * 100)}</div>
                      <div className='score-item'>{Math.floor(((Number(listing.pScore4) % 128) / (Number(listing.pScore4) >> 23)) / 5 * 100)}</div>
                    </div>
                  </div>
                </div>
              </> }
          </>

        )) : null}
    </div>
  )
})