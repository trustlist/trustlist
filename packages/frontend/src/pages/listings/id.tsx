import { Button } from '@/components/ui/button';
import User from '@/contexts/User';
import useTrustlist from '@/hooks/useTrustlist';
import { TrustScoreKey } from '@/types/local';
import {  TrustScoreKeyEnum, trustScores } from '@/data';
import { cn } from '@/utils/cn';
import { getRandomEmoji } from '@/utils/emoji';
import Tooltip from '@/components/Tooltip';
import ReviewForm from '@/components/ReviewForm';
import { ArrowBigRight, InfoIcon, EyeOff, ChevronRight, Slash } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ListingProps {
  _id: string;
  title: string;
  description: string;
  amount: string;
  amountType: string;
  epoch: number;
  posterId: string;
  contact: string;
  scoreString: string;
  offerAmount: string;
  responderId: string;
  dealOpened: boolean;
  posterDealClosed: boolean;
  responderDealClosed: boolean;
  offers: {
    _id: string,
    responderId: string,
    status: string,
    epoch: number,
    offerAmount: string,
    scoreString: string,
    trustScores: {
      LP: string;
      GV: string;
      LO: string;
      CB: string;
    },
  }[],
  trustScores: {
    LP: number;
    GV: number;
    LO: number;
    CB: number;
  };
}

const ListingDetails: React.FC = () => {
  const { id } = useParams();
  const { calcScoreFromUserData, getDeals, getOffers, openDeal, closeDeal } = useTrustlist();
  const user = useContext(User)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);
  const [listingDetails, setListingDetails] = useState<ListingProps | null>(null);
  const trustScoreInfo = { ...trustScores };
  const memberKeys = [user.epochKey(0), user.epochKey(1), user.epochKey(2)]
  const posterScores = listingDetails ? JSON.parse(listingDetails.scoreString) : null
  const trustScoreKeys = Object.keys(TrustScoreKeyEnum) as (keyof typeof TrustScoreKeyEnum)[]

  const setBorderColor = (trustScoreKey: TrustScoreKey) => {
    switch (trustScoreKey) {
      case 'LP':
        return 'border-blue-500';
      case 'GV':
        return 'border-green-500';
      case 'LO':
        return 'border-violet-500';
      case 'CB':
        return 'border-red-500';
      default:
        return 'border-primary-500';
    }
  }

  const addTrustScoresToOffers = (offers: any[]) => {
    return offers.map(offer => {
      const trustScores = JSON.parse(offer.scoreString);
      return { ...offer, trustScores };
    });
  };

  useEffect(() => {
    const fetchListingDetails = async () => {
      const listingResponse = await getDeals(id as string);
      if (listingResponse.data) {
        const offersResponse = await getOffers(id as string)
        const offersWithTrustScores = addTrustScoresToOffers(offersResponse.data)
        const listingDetails = {
          ...listingResponse.data,
          offers: offersWithTrustScores
        }
        setListingDetails(listingDetails as any);
      }
      setLoading(false);
    };

    fetchListingDetails();
  }, [id]);

  if (loading) {
    return <p className='p-6'>Loading...</p>;
  }

  if (!listingDetails) {
    return <p className='p-6'>No listing details available.</p>;
  }

  const { _id, title, description, amount, offerAmount, posterId, contact, responderId, dealOpened, posterDealClosed, responderDealClosed, offers } = listingDetails;
  console.log({ ...listingDetails });

  const isListingExpired = listingDetails?.epoch !== user.userState?.sync.calcCurrentEpoch();

  const acceptOfferAlert = (newData: any) => toast.promise(async () => {
    await openDeal(newData)
    // + 1 to responder's initiated LO score
    await user.requestData({[1]: 1 << 23}, memberKeys.indexOf(posterId), newData.responderId)
  }, {
  pending: "Please wait a moment while your deal is created...",
  success: { render: 
              <div className="flex space-around gap-3">
                <div>
                  <div>Offer accepted! Your contact info will be shown to this member to enable your offline transaction.</div>
                  <div>Please complete your deal during this epoch to build your reputation.</div>
                </div>
                <button className="text-black font-lg border-1 border-white px-4 py-2"
                        onClick={() => navigate(`/deal/${_id}`)}>
                  Deal
                </button>
              </div>,
            closeButton: false },
  error: "There was a problem creating your deal, please try again"
});

  return (
    <main className="flex flex-col pb-10">
      <section className={cn('flex place-items-center md:justify-center border-b-4 border-b-primary', isListingExpired ? 'border-b-orange-600' : '')}>
        <Link to='/' className='text-card-foreground m-0'>
          <Button variant={'link'} size={'sm'} className='text-muted-foreground hover:text-foreground duration-300'>Home</Button>
        </Link>
        <ChevronRight size={14} className='text-muted-foreground' />
        <p className='p-3'>{listingDetails.title}</p>
      </section>

      <article className="md:container md:max-w-3xl">
        <header className='flex flex-col gap-3 container px-4 py-6 col-span-1 text-card-foreground'>
          {isListingExpired && <p className="text-xs text-orange-600 tracking-wider py-1 px-2 border border-orange-500 uppercase rounded-md self-start font-semibold">EXPIRED</p>}
          <h1 className="text-4xl font-medium break-words">{title}</h1>
          {dealOpened && !posterDealClosed 
            ? <div className='text-lg'>
                <p>deal pending...</p>
                {memberKeys.includes(responderId) ? <p>contact: {contact}</p> : null }
              </div>
            : null }
          {posterDealClosed && responderDealClosed 
            ? <p className='text-lg text-orange-600'>deal completed!</p>
            : null }
        
          {dealOpened
            ? <>
              <div className='flex gap-3'>
                <p className="text-card-foreground text-lg">${parseFloat(amount).toFixed(2)}</p>
                <ArrowBigRight />
                <p className='text-green-700 text-lg'>${parseFloat(offerAmount).toFixed(2)}</p>
              </div>

              <div className='flex gap-20'>
                <div>
                  {posterDealClosed ?
                    <div className="">✅</div>
                  :
                    <div className="">
                      {memberKeys.includes(posterId) ? 
                        <Button
                          style={{ backgroundColor: 'white', border: 'none', padding: '0 0', fontSize: '2rem' }}
                          onClick={async () => {
                            const message = await closeDeal(_id, 'poster')
                            if (responderDealClosed) {
                              // +1 to responder's completed LO score, +1 to responder's initiated CB score
                              await user.requestData(
                                {[1]: 1, [2]: 1 << 23},
                                memberKeys.indexOf(posterId) ?? 0,
                                responderId
                              )
                              // +1 to poster's completed LP score, +1 to poster's initiated CB score
                              await user.requestData(
                                {[0]: 1, [2]: 1 << 23},
                                memberKeys.indexOf(posterId) ?? 0,
                                ''
                              )
                            }
                            window.alert(message)
                            window.location.reload()
                          }}
                        >
                          ☑️
                        </Button>
                      :
                        <Button style={{ cursor: 'not-allowed', backgroundColor: 'white', border: 'none', padding: '0 0', fontSize: '2rem' }}>
                          ☑️
                        </Button>
                      }
                    </div>
                  }
                  <div>poster</div>
                </div>

                <div>
                  {responderDealClosed ? 
                    <div className="">✅</div>
                  :
                    <div className="">
                      {memberKeys.includes(responderId) 
                      ? <Button
                        style={{ backgroundColor: 'white', border: 'none', padding: '0 0', fontSize: '2rem' }}
                        onClick={async () => {
                          const message = await closeDeal(_id, 'responder')
                          if (posterDealClosed) {
                            // +1 to responder's completed LO score, +1 to responder's initiated CB score
                            await user.requestData(
                              {[1]: 1, [2]: 1 << 23},
                              memberKeys.indexOf(responderId) ?? 0,
                              ''
                            )
                            // +1 to poster's completed LP score, +1 to poster's initiated CB score
                            await user.requestData(
                              {[0]: 1, [2]: 1 << 23},
                              memberKeys.indexOf(responderId) ?? 0,
                              posterId
                            )
                          }
                          window.alert(message)
                          window.location.reload()
                          }}
                        >
                            ☑️
                        </Button>
                      :
                        <Button
                          style={{ cursor: 'not-allowed', backgroundColor: 'white', border: 'none', padding: '0 0', fontSize: '2rem' }}
                        >
                          ☑️
                        </Button>
                      }
                    </div>                 
                  }
                  <div>responder</div>
                </div>
              </div>
              </>
              
            : <p className="text-card-foreground text-lg">${parseFloat(amount).toFixed(2)}</p>}

          
          
          {dealOpened ? <div className={cn('mt-1 mb-8 border-b-2 border-b-primary', isListingExpired ? 'border-b-orange-600' : '')}></div> : null }
          <div className="flex gap-1 text-muted-foreground">
            <p>by</p>
            <p className='text-sm text-foreground text-ellipsis rounded-md bg-muted-foreground/10 px-1'>~{listingDetails.posterId.substring(0, 6)}...{listingDetails.posterId.slice(-6)}</p>
            <p>@ epoch #{listingDetails.epoch}</p>
          </div>
          <div className='flex gap-3 pb-2'>
            {trustScoreKeys.map((key) => {
              const matchingEntry = Object.entries(posterScores).filter(([scoreName]) => scoreName === key)[0]
              const revealed = matchingEntry !== undefined;
              const initiated = matchingEntry ? Number(matchingEntry[1]) >> 23 : 0
              const value = revealed 
                ? initiated === 0 
                  ? 'n/a' : calcScoreFromUserData(Number(matchingEntry[1]))
                : <EyeOff size={16} strokeWidth={3}/>
              return (
                <div className="flex">
                  <Tooltip
                    text={`${trustScoreInfo[key].title} : ${trustScoreInfo[key].description}`}
                    content={
                      <InfoIcon size={16} className='text-primary' />
                    }
                  />
                  <div key={key} className={cn('flex gap-1 items-center justify-center border-[1.5px] border-opacity-60 py-[2px] px-1 rounded',
                    `${setBorderColor(key as TrustScoreKey)}`, )} title={key + ' trust score'}>
                    <div>{key}:</div>
                    <div className='font-bold uppercase'>{value}</div>
                  </div>
                </div>
              )  
            })}
          </div>
          <p className="text-base text-card-foreground/90">{description}</p>
          
        </header>

        <section className='flex flex-col gap-3 col-span-1 p-4'>
          <section className='flex justify-between py-4'>
            <h2 className='text-xl font-semibold'>📃Offers</h2>
            {user.hasSignedUp && !isListingExpired && 
            // prevent user from making an offer on their own post
            // !memberKeys.includes(posterId) &&
            // prevent new offers if one has already been accepted
            !listingDetails.dealOpened &&
              <Link to={`/listings/${listingDetails._id}/offers/new?title=${encodeURIComponent(listingDetails.title)}`}>
                <Button variant={'default'} size={'sm'} className='self-start'>
                  Make an offer
                </Button>
              </Link>}
          </section>
          {offers.length > 0 ? (
            <section className='flex flex-col space-y-4'>
              {offers.map((offer) => {
                const responderScores = JSON.parse( offer.scoreString)
                return (
                  <article>
                    <div key={offer._id} className={cn('border p-3 border-muted-foreground flex gap-2 items-start rounded-sm', offer.status === 'accepted' ? 'text-green-600' : '')}>
                      <p className='h-12 w-12 p-1 rounded-sm border border-foreground/30 bg-primary/5 mr-2 text-4xl flex justify-center items-center'>{getRandomEmoji()}</p>
                      <div className="flex flex-col gap-2 flex-1">
                        <header className="flex justify-between items-center">
                          <div>
                            <p className='text-foreground overflow-hidden text-ellipsis rounded-md bg-muted-foreground/10 px-1'>
                              ~{offer.responderId.substring(0, 6)}...{offer.responderId.slice(-6)}
                            </p>
                            {/* <p className='text-base text-muted-foreground'>— epoch #{offer.epoch}</p> */}
                          </div>
                          <h5 className='font-semibold text-2xl text-primary'>${parseFloat(offer.offerAmount).toFixed(2)}</h5>
                        </header>
                        <section>
                          <div className='flex gap-1 items-baseline'>
                          {trustScoreKeys.map((key) => {
                            const matchingEntry = Object.entries(responderScores).filter(([scoreName]) => scoreName === key)[0]
                            const revealed = matchingEntry !== undefined;
                            const initiated = matchingEntry ? Number(matchingEntry[1]) >> 23 : 0
                            const value = revealed 
                              ? initiated === 0 
                                ? 'n/a' : calcScoreFromUserData(Number(matchingEntry[1]))
                              : <EyeOff size={12} strokeWidth={3}/>
                            return (
                              <div key={key} className={cn('flex items-center justify-center border-[1.5px] border-opacity-60 py-[2px] px-1 rounded',
                                `${setBorderColor(key as TrustScoreKey)}`, )} title={key + ' trust score'}>
                                {/* // value === 'X' ? 'bg-muted text-muted-foreground border-muted' : '')} title={key + ' trust score'}> */}
                                <div className='flex items-center gap-1.5 text-sm'>
                                  <div>{key}:</div>
                                  <div className='font-bold uppercase'>{value}</div>
                                </div>
                                {/* {value === 'X' ? <Slash className='text-muted-foreground' size={16} /> : value.toLowerCase() === 'n/a' ? <p className='text-sm'> N/A</p> : value} */}
                              </div>
                            )
                            })}

                            {/* {Object.entries(offer.trustScores).map(([key, value]) => (
                              <div key={key} className={cn('flex items-center justify-center border-[1.5px] border-opacity-60 py-[2px] px-1 rounded',
                                `${setBorderColor(key as TrustScoreKey)}`,
                                value === 'X' ? 'bg-muted text-muted-foreground border-muted' : '')} title={key + ' trust score'}>
                                <span className='font-bold text-sm'>{key}:{' '}</span>
                                {value === 'X' ? <Slash className='text-muted-foreground' size={16} /> : value.toLowerCase() === 'n/a' ? <p className='text-sm'> N/A</p> : value}
                              </div>
                            ))} */}
                          </div>
                        </section>
                      </div>
                    </div>
                          
                    {responderId === offer.responderId ? 
                      <p className='uppercase font-semibold text-right'>offer accepted ✅</p>
                    : memberKeys.includes(posterId) && !listingDetails.dealOpened
                      ? <p
                          className='uppercase text-indigo-700 font-semibold underline text-right cursor-pointer'
                          // style={{ backgroundColor: 'blue', color: 'white', fontSize: '0.65rem', padding: '0.25rem 0.5rem', marginLeft: '1.5rem' }}
                          onClick={async () => {
                            try {
                              const newData = {
                                id: _id,
                                responderId: offer.responderId,
                                offerAmount: offer.offerAmount,
                              }
                            acceptOfferAlert(newData)
                            } catch {
                              console.error("Error while updating deal: ");
                            }
                          }}
                        >
                          accept offer
                        </p>
                      : null}
                  </article>
                )
              })}
            </section>
          ) : (
            <p className='text-muted-foreground'>No offers available yet. You can be the first!</p>
          )}

        </section>
      </article>

      <ToastContainer className='dash-toast' toastClassName='toast' bodyClassName='toast-body' position='top-center' autoClose={false} />

    </main>
  );
};

export default ListingDetails;

