
import { Button } from '@/components/ui/button';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import useTrustlist from '@/hooks/useTrustlist';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface ListingProps {
  title: string;
  description: string;
  amount: string;
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
  const { getDeals } = useTrustlist();
  const [loading, setLoading] = useState(true);
  const [listingDetails, setListingDetails] = useState<ListingProps | null>(null);

  useEffect(() => {
    const fetchListingDetails = async () => {
      const response = await getDeals(id as string);
      setListingDetails(response.data as any);
      setLoading(false);
    };

    fetchListingDetails();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!listingDetails) {
    return <p>No listing details available.</p>;
  }

  const { title, description, amount} = listingDetails;
  console.log({...listingDetails});

  return (
    <article className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md space-x-4">
      <header>
        <h1 className="text-3xl font-medium text-foreground">{title}</h1>
        <p className="text-slate-500">{description}</p>
        <p className="text-slate-500">${parseFloat(amount).toFixed(2)}</p>
      </header>
      {/* <section>
        <p>LP: {trustScores.LP * 100}%</p>
        <p>GV: {trustScores.GV * 100}%</p>
        <p>LO: {trustScores.LO * 100}%</p>
        <p>CB: {trustScores.CB * 100}%</p>
      </section> */}

      {/* <section>
        <h2>Offers</h2>
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
          <div>
            <p>No offers available at the moment.</p>
            <Button >Submit an Offer</Button>
          </div>
        )}
      </section> */}
    </article>
  );
};

export default ListingDetails;

