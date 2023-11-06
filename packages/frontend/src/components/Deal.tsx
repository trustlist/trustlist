import User from "@/contexts/User";
import useTrustlist from "@/hooks/useTrustlist";
import { ListingProps } from "@/pages/listings/id";
import { MoveHorizontal, MoveVertical } from "lucide-react";
import { useContext } from "react";
import ReviewForm from "./ReviewForm";
import { Button } from "./ui/button";

interface ListingPropsFromDetails {
  listing: ListingProps
}

const Deal = ({ listing }: ListingPropsFromDetails) => {
  const { closeDeal } = useTrustlist()
  const user = useContext(User)
  const memberKeys = [user.epochKey(0), user.epochKey(1), user.epochKey(2)]
  const { _id, amount, offerAmount, posterId, contact, responderId, posterDealClosed, responderDealClosed, posterReview, responderReview } = listing;

  return (
    <section className="border border-primary rounded-sm p-4">
      {(!posterDealClosed || !responderDealClosed)
        ? <div className='flex text-lg pb-4'>
          <p className="text-xs text-orange-600 tracking-wider py-1 px-2 border border-orange-500 uppercase rounded-md self-start font-semibold">PENDING DEAL</p>
          {memberKeys.includes(responderId) ? <p>contact: {contact}</p> : null}
        </div>
        : null}
      {posterDealClosed && responderDealClosed
        ? <p className="text-xs text-green-600 tracking-wider py-1 px-2 border border-green-500 uppercase rounded-md self-start font-semibold">DEAL COMPLETED</p>
        : null}

      <article className='flex flex-col md:flex-row gap-4 justify-between'>
        <section>
          <p className="text-muted-foreground font-semibold uppercase text-sm tracking-wider">Poster</p>
          <p className="text-card-foreground text-2xl">${parseFloat(amount).toFixed(2)}</p>
          {posterDealClosed ?
            <Button disabled variant={'secondary'}>Poster approved</Button>
            :
            <div className="">
              {memberKeys.includes(posterId) ?
                <Button
                  onClick={async () => {
                    const message = await closeDeal(_id, 'poster')
                    if (responderDealClosed) {
                      // +1 to responder's completed LO score, +1 to responder's initiated CB score
                      await user.requestData(
                        { [1]: 1, [2]: 1 << 23 },
                        memberKeys.indexOf(posterId) ?? 0,
                        responderId
                      )
                      // +1 to poster's completed LP score, +1 to poster's initiated CB score
                      await user.requestData(
                        { [0]: 1, [2]: 1 << 23 },
                        memberKeys.indexOf(posterId) ?? 0,
                        ''
                      )
                    }
                    window.alert(message)
                    window.location.reload()
                  }}
                >
                  Approve
                </Button>
                :
                <Button disabled variant={'secondary'}>
                  Waiting on poster approval...
                </Button>
              }
            </div>
          }
        </section>
        <MoveVertical className="block md:hidden text-primary" size={32} />
        <MoveHorizontal className="hidden md:block text-primary"  size={32}/>
        <section>
          <p className="text-muted-foreground font-semibold uppercase text-sm tracking-wider">buyer</p>
          <p className="text-green-700 text-2xl">${parseFloat(offerAmount).toFixed(2)}</p>
          {responderDealClosed ?
            <Button disabled variant={'secondary'}>Buyer approved</Button>
            :
            <div className="">
              {memberKeys.includes(responderId)
                ? <Button
                  onClick={async () => {
                    const message = await closeDeal(_id, 'responder')
                    if (posterDealClosed) {
                      // +1 to responder's completed LO score, +1 to responder's initiated CB score
                      await user.requestData(
                        { [1]: 1, [2]: 1 << 23 },
                        memberKeys.indexOf(responderId) ?? 0,
                        ''
                      )
                      // +1 to poster's completed LP score, +1 to poster's initiated CB score
                      await user.requestData(
                        { [0]: 1, [2]: 1 << 23 },
                        memberKeys.indexOf(responderId) ?? 0,
                        posterId
                      )
                    }
                    window.alert(message)
                    window.location.reload()
                  }}
                >
                  Approve
                </Button>
                :
                <Button variant={'secondary'} disabled>
                  Waiting on buyer approval
                </Button>
              }
            </div>
          }
        </section>

        {posterDealClosed && responderDealClosed ?
          <div className="container">
            {memberKeys.includes(posterId) && (<ReviewForm
              key={posterId}
              dealId={_id}
              member="poster"
              memberKeys={memberKeys}
              currentMemberId={posterId}
              oppositeMemberId={responderId}
              currentMemberReview={posterReview}
              oppositeMemberReview={responderReview}
            />)}
            {memberKeys.includes(responderId) && (<ReviewForm
              key={responderId}
              dealId={_id}
              member="responder"
              memberKeys={memberKeys}
              currentMemberId={responderId}
              oppositeMemberId={posterId}
              currentMemberReview={responderReview}
              oppositeMemberReview={posterReview}
            />)}
          </div> : null
        }
      </article>
    </section>
  )
}

export default Deal