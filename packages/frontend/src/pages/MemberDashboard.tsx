import { useContext, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../components/memberDashboardModal.css'
import Tooltip from '@/components/Tooltip'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { InfoIcon } from 'lucide-react'

import Trustlist from '@/contexts/Trustlist'
import User from '../contexts/User'

type CurrentListing = {
  _id: string
  section: string
  category: string
  title: string
  amount: string
  offerAmount: string
  dealOpened: boolean
  posterDealClosed: boolean
  responderDealClosed: boolean
}

type CurrentOffer = {
  _id: string
  listingId: string
  listingTitle: string
  offerAmount: string
}

const MemberDashboardPage = observer(() => {
  const app = useContext(Trustlist)
  const user = useContext(User)
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      const epochKeys = [user.epochKey(0), user.epochKey(1), user.epochKey(2)]
      console.log(epochKeys)
      await app.loadMemberActivity(epochKeys)
    }
    loadData()
  }, [])
  const deals = app.memberActiveDeals
  const listings = app.memberActiveListings
  const offers = app.memberActiveOffers

  const transitionAlert = () => toast.promise(async () => {
    await user.transitionToCurrentEpoch()
  }, {
    pending: "Please wait a moment while you are tranistioned to the current epoch...",
    success: "Transition successful!  Your provable data has been updated and you can now participate in the current epoch.",
    error: "Failed to transition to the current epoch, please try again in a moment."
  });

  return (
    <div className='md:mt-3 md:border-t-2 md:border-t-muted'>
      <div className="dash-content">
        <div className="stats-container">
          <div>
            <div className='flex justify-center gap-3'>
              <Dialog>
                <DialogTrigger title='Learn about user data and scoring'>
                  <InfoIcon size={20} className='text-primary' />
                </DialogTrigger>
                <DialogContent>
                  <h4 className='text-xl font-semibold'>How are Trustlist scores used?</h4>
                  <li>reputation metrics</li>
                  <li>when data is received</li>
                  <li>current vs provable scores</li>
                  <li>transition</li>
                  {/* <p>Trustscores are the backbone of trustlist. There are 4 metrics that keep track of user actions.</p> */}
                  {/* {trustScoreKeys.map((key) => (
                    <div key={key}>
                      <h3 className='text-left text-lg'>{key} — {trustScoreInfo[key].title}</h3>
                      <p>{trustScoreInfo[key].description}</p>
                    </div>
                  ))} */}
                </DialogContent>
              </Dialog>
              <h3 className='py-3 text-lg font-semibold'>my latest trust scores:</h3>
            </div>
            {app.scoreDescriptions.map((desc, i) => {
              const initiated = user.data[i] ? Number(user.data[i] >> BigInt(23)) : 0
              const completed = user.data[i] ? Number(user.data[i] % BigInt(128)) : 0
              return (
                <div key={i}>
                  <div className="score-detail">
                    <div style={{ display: 'flex', justifyContent: 'space-between',}}>
                      {/* <Tooltip
                        text={desc}
                        content={
                          <img
                            src={require('../../public/info_icon.svg')}
                            alt="info icon"
                          />
                        }
                      /> */}
                      <div style={{ paddingLeft: '0.3rem', color: 'black'}}>
                        {app.scoreNames[i]}{' '}score:
                      </div>
                    </div>
                    <div className="stat">
                      {completed}/{initiated}
                    </div>
                    {initiated === 0 ? 
                      <div className="stat">n/a</div>
                    :
                      <div className="stat">{Math.floor((completed / initiated) * 100)}%</div>
                    }
                  </div>
                </div>
              )
            })}
          </div>

          <div className="transition">
            <div className="line"></div>
            <Button 
              onClick={async () => {
                try {
                  transitionAlert()
                } catch (error) {
                  throw new Error("Failed to transition to the new epoch")
                }
              }}
            >
              TRANSITION
            </Button>
            <div className="line"></div>
            <ToastContainer className='dash-toast' toastClassName='toast' position='top-center' autoClose={4000} />
          </div>

          <div>
            <div>
              <h3 className='pt-8 pb-3 text-lg font-semibold'>my provable trust scores:</h3>
            </div>
            {app.scoreDescriptions.map((desc, i) => {
              const initiated = user.provableData[i] ? Number( user.provableData[i] >> BigInt(23)) : 0
              const completed = user.provableData[i] ? Number(user.provableData[i] % BigInt(128)) : 0
              return (
                <div key={i}>
                  <div className="score-detail">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {/* <Tooltip
                        text={desc}
                        content={
                          <img
                            src={require('../../public/info_icon.svg')}
                            alt="info icon"
                          />
                        }
                      /> */}
                      <div style={{ paddingLeft:'0.3rem', color: 'black' }}>{app.scoreNames[i]}{' '}score:</div>
                    </div>
                    <div className="stat">
                      {completed}/{initiated}
                    </div>
                    {initiated === 0 ?
                      <div className="stat">
                        n/a
                      </div>
                    : 
                      <div className="stat">
                        {Math.floor((completed / initiated) * 100)}%
                      </div>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="activity-container">
          <h4>my deals</h4>
          <div className="scroll-container">
            {deals && deals.length > 0 ? 
              deals.map((deal: CurrentListing) => (
                <Link to={`/listings/${deal._id}`}>
                  <li key={deal._id} className='hover:text-primary hover:underline'>
                    {deal.posterDealClosed && deal.responderDealClosed ? 
                      <span style={{ color: 'red' }}>Complete -{' '}</span>
                    : 
                      <span style={{ color: 'green' }} >Pending -{' '}</span>
                    }
                    {deal.title} / ${deal.offerAmount}
                  </li>
                </Link>
              ))
            :
              <p>no open deals in this epoch</p>
            }
          </div>

          <h4>my listings</h4>
          <div className="scroll-container">
            {listings && listings.length > 0 ? 
              listings.map((listing: CurrentListing) => (
                <Link to={`/listings/${listing._id}`}>
                  <li key={listing._id} className='hover:text-primary hover:underline'>{listing.title} / ${listing.amount}</li>
                </Link>
              ))
            : 
              <p>no listings in this epoch</p>
            }
          </div>

          <h4>my offers</h4>
          <div className="scroll-container">
            {offers && offers.length > 0 ? 
              offers.map((offer: CurrentOffer) => (
                <li
                  key={offer._id}
                  className='hover:text-primary hover:underline cursor-pointer'
                  onClick={async () => {
                    await app.loadDealById(offer.listingId)
                    navigate(`/listings/${offer.listingId}`)
                  }}
                >
                  {offer.listingTitle} / ${offer.offerAmount}
                </li>
              ))
            : 
              <p>no offers in this epoch</p>
            }        
          </div>
        </div>

        <ToastContainer className='dash-toast' toastClassName='toast' position='top-center' autoClose={4000} />

      </div>
    </div>
  );
})

export default MemberDashboardPage