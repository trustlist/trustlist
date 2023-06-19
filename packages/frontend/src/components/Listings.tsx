import React from 'react'
import { observer } from 'mobx-react-lite'
import DetailModal from './DetailModal';
import Tooltip from './Tooltip';
import './listings.css'

import Trustlist from '../contexts/Trustlist';
import User from '../contexts/User';

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
}

export default observer(({ section, category }: Props) => {
  
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)
  const [showDetail, setShowDetail] = React.useState<boolean>(false)
  const [detailData, setDetailData] = React.useState<any>()

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
        listings.slice().reverse().map((listing: Listing) => {
          const score1 = app.calcScore(listing.pScore1)
          const score2 = app.calcScore(listing.pScore2)
          const score3 = app.calcScore(listing.pScore3)
          const score4 = app.calcScore(listing.pScore4)
          return (
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
                        <div className='listing-description'>{listing.description}</div>
                        <div style={{fontSize: '0.4rem'}} onClick={() => app.removeListing(listing._id)}>delete</div>
                  </div>
                  <div>
                    <div className='score-container'>
                      <div className='score-item'>
                        <Tooltip 
                          text="LP score: reflects the poster's ability/willingness to follow through on their listings and complete deals. "
                          content=
                          {score1 === 'X' ?
                            <img src={require('../../public/not_visible.svg')} alt="eye with slash"/>
                            :
                            score1 === 0 ? '...' : score1
                          }
                        />
                      </div>
                      <div className='score-item'>
                        <Tooltip 
                          text="CB score: reflects the member's commitment to community building by submitting timely reviews of their completed deals."
                          content=
                          {score2 === 'X' ?
                            <img src={require('../../public/not_visible.svg')} alt="eye with slash"/>
                            :
                            score2 === 0 ? '...' : score2
                          }
                        />    
                      </div>
                    </div>
                    <div className='score-container'>
                      <div className='score-item'>
                        <Tooltip
                          text="TD score: reflects the community's overall satisfaction in dealing with this member, as a percentage of how many members would choose to interact with them again."
                          content=
                          {score3 === 'X' ?
                            <img src={require('../../public/not_visible.svg')} alt="eye with slash"/>
                            :
                            score3 === 0 ? '...' : score3
                          }
                        />  
                      </div>
                      <div className='score-item'>
                        <Tooltip
                          text="Good Vibes score: reflects the communitiy's sentiments about this member's attitude and demeanor."
                          content=
                          {score4 === 'X' ?
                            <img src={require('../../public/not_visible.svg')} alt="eye with slash"/>
                            :
                            score4 === 0 ? '...' : score4
                          }
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
                        <div>${listing.amount}</div>
                        <div style={{marginRight: '200px', color: 'black'}}>EXPIRED</div>
                        <div style={{fontSize: '0.4rem', cursor: 'pointer'}} onClick={() => app.removeListing(listing._id)}>delete</div>
                  </div>
                  <div>
                    <div className='score-container'>
                      <div className='score-item'>
                        {score1 === 'X' ?
                          <img src={require('../../public/not_visible.svg')} alt="eye with slash"/>
                          :
                          score1 === 0 ? '...' : score1
                        }
                      </div>
                      <div className='score-item'>
                        {score2 === 'X' ?
                          <img src={require('../../public/not_visible.svg')} alt="eye with slash"/>
                          :
                          score2 === 0 ? '...' : score2
                        }
                      </div>
                    </div>
                    <div className='score-container'>
                    <div className='score-item'>
                        {score3 === 'X' ?
                          <img src={require('../../public/not_visible.svg')} alt="eye with slash"/>
                          :
                          score3 === 0 ? '...' : score3
                        }
                      </div>
                      <div className='score-item'>
                        {score4 === 'X' ?
                          <img src={require('../../public/not_visible.svg')} alt="eye with slash"/>
                          :
                          score4 === 0 ? '...' : score4
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </> }
          </>
          )
        }) : null}
    </div>
  )
})