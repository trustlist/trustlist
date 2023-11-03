
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useTrustlist from '@/hooks/useTrustlist';
import { ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
    id: string,
    status: string,
    price: number,
    trustScores: {
      LP: number;
      GV: number;
      LO: number;
      CB: number;
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
  const [loading, setLoading] = useState(true);
  const [listingDetails, setListingDetails] = useState<ListingProps | null>(null);

  useEffect(() => {
    const fetchListingDetails = async () => {
      const listingResponse = await getDeals(id as string);
      if (listingResponse.data) {
        const offersResponse = await getOffers(id as string)
        const listingDetails = {
          ...listingResponse.data,
          offers: offersResponse.data
        }
        // console.log({listingDetails})
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

  return (
    <section className="flex flex-col space-y-6">
      <article className='flex place-items-center md:justify-center border-b'>
        <Link to='/' className='text-card-foreground m-0'><Button variant={'link'} size={'sm'} className='text-muted-foreground hover:text-foreground duration-300'>Home</Button></Link>
        <ChevronRight size={14} className='text-muted-foreground' />
        <p className='p-3'>{listingDetails.title}</p>
      </article>

      <section className="md:container md:max-w-3xl">
        <section className='flex flex-col gap-3 container px-4 py-6 col-span-1 bg-primary text-secondary rounded-sm'>
          <p className="text-xs tracking-wider py-1 px-2 border border-secondary uppercase rounded-md self-start">EXPIRED</p>
          <h1 className="text-4xl font-medium break-words">{title}</h1>
          <p className="text-secondary text-lg">${parseFloat(amount).toFixed(2)}</p>
          <p className='text-sm text-secondary/70 w-36 overflow-hidden text-ellipsis rounded-md bg-secondary/10 px-1'>~{listingDetails.posterId}</p>
          <p className="text-base text-secondary/70">{description}</p>
        </section>

        <section className='flex flex-col gap-3 col-span-1 p-4'>
          <h2 className='text-xl font-semibold'>📃Listing Offers</h2>
          {offers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>TrustScores</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id} className={offer.status === 'accepted' ? 'text-green-500' : ''}>
                    <TableCell>{offer.id.substring(0, 6)}...</TableCell>
                    <TableCell>${offer.price.toFixed(2)}</TableCell>
                    <TableCell>
                      LP: {offer.trustScores.LP * 100}%<br />
                      GV: {offer.trustScores.GV * 100}%<br />
                      LO: {offer.trustScores.LO * 100}%<br />
                      CB: {offer.trustScores.CB * 100}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className='flex flex-col gap-2'>
              <p className='text-muted-foreground'>No offers available yet. You can be the first!</p>
              <Link to={`/listings/${listingDetails._id}/offers/new`}>
                <Button variant={'secondary'} className='self-start'>Make an offer</Button>
              </Link>
            </div>
          )}
        </section>
      </section>
      {/* <section>
        <p>LP: {trustScores.LP * 100}%</p>
        <p>GV: {trustScores.GV * 100}%</p>
        <p>LO: {trustScores.LO * 100}%</p>
        <p>CB: {trustScores.CB * 100}%</p>
      </section> */}

    </section>
  );
};

export default ListingDetails;

