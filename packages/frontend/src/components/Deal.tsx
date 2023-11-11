import User from "@/contexts/User";
import useTrustlist from "@/hooks/useTrustlist";
import { ListingProps } from "@/pages/listings/id";
import { cn } from "@/utils/cn";
import { InfoIcon, MoveHorizontal, MoveVertical } from "lucide-react";
import { useContext } from "react";
import ReviewForm from "./ReviewForm";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ListingPropsFromDetails {
  listing: ListingProps
}

const Deal = ({ listing }: ListingPropsFromDetails) => {
  const { closeDeal } = useTrustlist()
  const user = useContext(User);
  const memberKeys = [user.epochKey(0), user.epochKey(1), user.epochKey(2)]
  const { _id, amount, offerAmount, posterId, contact, responderId, posterDealClosed, responderDealClosed, posterReview, responderReview } = listing;

  const approveDealAlert = (member: string) => toast.promise(async () => {
    await closeDeal(_id, member)
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
  }, {
    pending: "Please wait a moment while your deal is approved...",
    success: {
      render:
        <>
          <div className="pb-2">You've confirmed the completion of your deal. One "Completed" point will be added to your LP or LO score once both parties have approved.</div>
          <div className="pb-3">Please submit a review of your transaction during this epoch to build your CB and GV reputation.</div>
          <Button className="underline mb-6 text-lg"
            onClick={() => window.location.reload()}>
            Close
          </Button>
        </>,
      closeButton: false
    },
    error: "There was a problem approving your deal, please try again"
  });
  
  return (
    <section className={cn("border border-primary rounded-sm p-4", posterDealClosed && responderDealClosed ? 'border-green-600 border-[1.5px]' : '')}>
      <div className="flex gap-1 items-start">
        <Dialog>
          <DialogTrigger title='Learn about aprrovals and reviews'>
            <InfoIcon size={20} className='text-primary' />
          </DialogTrigger>
          <DialogContent>
            <h4 className='text-xl font-semibold'>How do Trustlist Deals work?</h4>
            <p>This Deal was created when an offer was accepted my the poster of this listing. The 
              participating members will receive 1 "Completed" point for their respective LP or LO 
              scores when they both return to approve this Deal, confirming the success of their offline 
              transaction. Deal approval will also add 1 "Initiated" point to participating members' CB scores.
            </p>
            <p>Deal reveiws will become available after approval of both members. Submitting the review 
              will add 1 "Completed" point to the member's CV score. GV score points will be after both 
              members' reviews are complete.
            </p>
          </DialogContent>
        </Dialog>
        {(!posterDealClosed || !responderDealClosed)
          ? <div className='text-lg pb-4'>
            <p className="text-xs text-primary tracking-wider py-1 px-2 border border-primary uppercase rounded-md self-start font-semibold">DEAL OPEN</p>
            {memberKeys.includes(responderId) ? <p>contact: {contact}</p> : null}
          </div>
          : null}
        {posterDealClosed && responderDealClosed
          ? <p className="text-xs text-green-50 tracking-wider py-1 px-2 border bg-green-500 uppercase rounded-md w-fit font-semibold">
            DEAL COMPLETED
          </p>
          : null}
      </div>

      <article className='flex flex-col md:flex-row gap-4 justify-between py-2'>
        <section>
          <p className="text-muted-foreground font-semibold uppercase text-sm tracking-wider">Poster</p>
          <p className="text-card-foreground font-bold text-2xl">${parseFloat(amount).toFixed(2)}</p>
          {posterDealClosed ?
            <Button disabled variant={'secondary'}>Poster approved</Button>
            :
            <div className="">
              {memberKeys.includes(posterId) ?
                <Button
                  onClick={async () => {
                    approveDealAlert('poster')
                    // const message = await closeDeal(_id, 'poster')
                    // if (responderDealClosed) {
                    //   // +1 to responder's completed LO score, +1 to responder's initiated CB score
                    //   await user.requestData(
                    //     { [1]: 1, [2]: 1 << 23 },
                    //     memberKeys.indexOf(posterId) ?? 0,
                    //     responderId
                    //   )
                    //   // +1 to poster's completed LP score, +1 to poster's initiated CB score
                    //   await user.requestData(
                    //     { [0]: 1, [2]: 1 << 23 },
                    //     memberKeys.indexOf(posterId) ?? 0,
                    //     ''
                    //   )
                    // }
                    // window.alert(message)
                    // window.location.reload()
                  }}
                >
                  Approve
                </Button>
                :
                <Button disabled variant={'secondary'} size={'sm'}>
                  Waiting on poster approval...
                </Button>
              }
            </div>
          }
          {posterDealClosed && responderDealClosed && !posterReview
            ? (<p className="text-orange-500 py-2">Awaiting poster review...</p>) : null}
        </section>
        <MoveVertical className="block md:hidden text-primary" size={32} />
        <MoveHorizontal className="hidden md:block text-primary" size={32} />
        <section>
          <p className="text-muted-foreground font-semibold uppercase text-sm tracking-wider">buyer</p>
          <p className="text-green-700 font-bold text-2xl">${parseFloat(offerAmount).toFixed(2)}</p>
          {responderDealClosed ?
            <Button disabled variant={'secondary'}>Buyer approved</Button>
            :
            <div>
              {memberKeys.includes(responderId)
                ? <Button
                  onClick={async () => {
                    approveDealAlert('responder')
                    // const message = await closeDeal(_id, 'responder')
                    // if (posterDealClosed) {
                    //   // +1 to responder's completed LO score, +1 to responder's initiated CB score
                    //   await user.requestData(
                    //     { [1]: 1, [2]: 1 << 23 },
                    //     memberKeys.indexOf(responderId) ?? 0,
                    //     ''
                    //   )
                    //   // +1 to poster's completed LP score, +1 to poster's initiated CB score
                    //   await user.requestData(
                    //     { [0]: 1, [2]: 1 << 23 },
                    //     memberKeys.indexOf(responderId) ?? 0,
                    //     posterId
                    //   )
                    // }
                    // window.alert(message)
                    // window.location.reload()
                  }}
                >
                  Approve
                </Button>
                :
                <Button variant={'secondary'} size={'sm'} disabled>
                  Waiting on buyer approval...
                </Button>
              }
            </div>
          }
          {posterDealClosed && responderDealClosed && !responderReview
            ? (<p className="text-orange-600 py-2">Awaiting responder review...</p>) : null}
        </section>
      </article>
      <div className="p-2"></div>
      {posterDealClosed && responderDealClosed ?
        <div className="w-full">
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

      <ToastContainer className='dash-toast' toastClassName='toast' bodyClassName='toast-body' position='top-center' autoClose={false} />

    </section>
  )
}

export default Deal