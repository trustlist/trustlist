import { useContext, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../components/memberDashboardModal.css'
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
                  <p className='text-[12px]'>
                    Members will see two Trustscore categories: <i>current</i> and <i>provable</i>. Current 
                    scores are a representation of the data the member has accumulated since joining, including 
                    the current epoch. Changes made to the member's on-chain data in the current epoch can be seen 
                    here in the Dashboard, but cannot be proven with UniRep's zero-knowlege circuits until that 
                    epoch has ended. <i>Provable</i> scores are updated with these changes when the member transitions 
                    to the new epoch, and these are the scores that display the member's reputation on their listings 
                    or offers.
                  </p>
                  <p className='text-[12px]'>
                    Trustlist members accumulate on-chain reputation data as follows:
                    <li>Legitimate Posting (LP) - 1 "Initiated" point for posting a listing / 1 "Completed" point after closing the deal on that listing</li>
                    <li>Legitimate Offer (LO) - 1 "Initiated" when their offer is accepted / 1 "Completed" point for closing the deal on that offer</li>
                    <li>Community Building (CB) - 1 "Initiated" point for closing a deal / 1 "Completed" point for completeing a review for that deal</li>
                    <li>Good Vibes (GV) - 1 "Initiated" point for receiving a review / 1-5 "GV" ponts given by the other party in that review</li>
                  </p>
                  <p className='text-[12px]'>
                    Trustcores are calculated with the formula <i>(completed / initiated) * 100</i>. For example:
                    <li>if a member has posted 4 listings and only closed a deal on one of them, their LP Score will be 25%</li>
                    <li>if a member has participated in 2 deals and returned to complete reviews for both, their CB Score will be 100%</li>
                    <li>if a member has not collected any (provable) data for a scoring metric, their score for will appear as 'N/A"</li>
                  </p>
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