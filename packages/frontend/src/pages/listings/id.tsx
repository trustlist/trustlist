
import { Button } from '@/components/ui/button';
import User from '@/contexts/User';
import useTrustlist from '@/hooks/useTrustlist';
import { TrustScoreKey } from '@/types/local';
import { cn } from '@/utils/cn';
import { getRandomEmoji } from '@/utils/emoji';
import { ChevronRight, Slash } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

interface ListingProps {
  _id: string;
  title: string;
  description: string;
  amount: string;
  amountType: string;
  epoch: number;
  posterId: string;
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
  const { getDeals, getOffers } = useTrustlist();
  const user = useContext(User)
  const [loading, setLoading] = useState(true);
  const [listingDetails, setListingDetails] = useState<ListingProps | null>(null);

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

  const { title, description, amount, offers } = listingDetails;
  console.log({ ...listingDetails });

  const isListingExpired = listingDetails?.epoch !== user.userState?.sync.calcCurrentEpoch();

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
          <p className="text-card-foreground text-lg">${parseFloat(amount).toFixed(2)}</p>
          <div className="flex gap-1 text-muted-foreground">
            <p>by</p>
            <p className='text-sm text-foreground text-ellipsis rounded-md bg-muted-foreground/10 px-1'>~{listingDetails.posterId.substring(0, 6)}...{listingDetails.posterId.slice(-6)}</p>
            <p>@ epoch #{listingDetails.epoch}</p>
          </div>
          <p className="text-base text-card-foreground/90">{description}</p>
        </header>

        <section className='flex flex-col gap-3 col-span-1 p-4'>
          <section className='flex justify-between py-4'>
            <h2 className='text-xl font-semibold'>📃Offers</h2>
            {!isListingExpired &&
              <Link to={`/listings/${listingDetails._id}/offers/new?title=${encodeURIComponent(listingDetails.title)}`}>
                <Button variant={'default'} size={'sm'} className='self-start'>
                  Make an offer
                </Button>
              </Link>}
          </section>
          {offers.length > 0 ? (
            <section className='flex flex-col space-y-4'>
              {offers.map((offer) => (
                <article key={offer._id} className={cn('border p-3 border-muted-foreground flex gap-2 items-start rounded-sm', offer.status === 'accepted' ? 'text-green-600' : '')}>
                  <p className='h-12 w-12 p-1 rounded-sm border border-foreground/30 bg-primary/5 mr-2 text-4xl flex justify-center items-center'>{getRandomEmoji()}</p>
                  <div className="flex flex-col gap-2 flex-1">
                    <header className="flex justify-between items-center">
                      <div>
                        <p className='text-foreground overflow-hidden text-ellipsis rounded-md bg-muted-foreground/10 px-1'>
                          ~{offer.responderId.substring(0, 6)}...{offer.responderId.slice(-6)}
                        </p>
                        <p className='text-base text-muted-foreground'>— epoch #{offer.epoch}</p>
                      </div>
                      <h5 className='font-semibold text-2xl text-primary'>${parseFloat(offer.offerAmount).toFixed(2)}</h5>
                    </header>
                    <section>
                      <div className='flex gap-1 items-baseline'>
                        {Object.entries(offer.trustScores).map(([key, value]) => (
                          <div key={key} className={cn('flex items-center justify-center border-[1.5px] border-opacity-60 py-[2px] px-1 rounded',
                            `${setBorderColor(key as TrustScoreKey)}`,
                            value === 'X' ? 'bg-muted text-muted-foreground border-muted' : '')} title={key + ' trust score'}>
                            <span className='font-bold text-sm'>{key}:{' '}</span>
                            {value === 'X' ? <Slash className='text-muted-foreground' size={16} /> : value.toLowerCase() === 'n/a' ? <p className='text-sm'> N/A</p> : value}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <p className='text-muted-foreground'>No offers available yet. You can be the first!</p>
          )}

        </section>
      </article>
    </main>
  );
};

export default ListingDetails;

