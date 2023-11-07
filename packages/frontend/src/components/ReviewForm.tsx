import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { Button } from './ui/button'

import { InfoIcon } from 'lucide-react'
import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'

type Props = {
  dealId: string
  member: string
  memberKeys: string[]
  currentMemberId: string
  oppositeMemberId: string
  currentMemberReview: string
  oppositeMemberReview: string
}

export default observer(
  ({
    dealId,
    member,
    memberKeys,
    currentMemberId,
    oppositeMemberId,
    currentMemberReview,
    oppositeMemberReview,
  }: Props) => {
    const app = useContext(Trustlist)
    const user = useContext(User)
    const [sentiment, setSentiment] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const sentiments = [
      'hard no',
      'not really',
      'whatever',
      'mostly',
      'yeah def',
    ]

    return (
      <div className="bg-muted p-3 rounded-sm flex flex-col gap-3">
        <div className="flex gap-1">
          <h2 className='font-semibold'>{member.charAt(0).toUpperCase() + member.slice(1)} Review</h2>
          <Dialog>
            <DialogTrigger title='Why should I leave a review?'>
              <InfoIcon size={20} className='text-primary' />
            </DialogTrigger>
            <DialogContent>
              <h4 className='text-xl font-semibold'>Leave a review!</h4>
              <p>Your review of your experience with this member will become part of their trustlist reputation. Neither member will receive reputational data for this deal unless both parties sumbit their review before the epoch expires.</p>
            </DialogContent>
          </Dialog>
        </div>
        {currentMemberReview ? (
          <p className='text-base' >
            ✅ you submitted a review
          </p>
        ) : (
          <>
            <p>
              The member I interacted with in this deal was
              respectful, friendly, and easy to communicate with.
            </p>
            <RadioGroup
              onValueChange={(value) => setSentiment(sentiments.indexOf(value) + 1)}
            >
              {sentiments.map((sentiment, index) => (
                <div className="flex items-center space-x-2" key={index}>
                  <RadioGroupItem value={sentiment} id={sentiment} />
                  <Label htmlFor={sentiment}>{sentiment}</Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              className='md:self-start'
              disabled={isSubmitting}
              onClick={async () => {
                if (!sentiment) {
                  window.alert(
                    'Please select an option'
                  )
                  return
                }
                setIsSubmitting(true)
                // +1 to current member's completed CB score
                await user.requestData(
                  { [2]: 1 },
                  memberKeys.indexOf(
                    currentMemberId
                  ) ?? 0,
                  ''
                )
                // +5 to opposite member's initiated and +0-5 to completed GV score
                const GVscore = (5 << 23) + sentiment
                if (oppositeMemberReview) {
                  await user.requestData(
                    { [3]: GVscore },
                    memberKeys.indexOf(
                      currentMemberId
                    ) ?? 0,
                    oppositeMemberId
                  )
                  await user.requestData(
                    JSON.parse(
                      oppositeMemberReview
                    ),
                    memberKeys.indexOf(
                      currentMemberId
                    ) ?? 0,
                    ''
                  )
                }
                const review = JSON.stringify({
                  [3]: GVscore,
                })
                const message = await app.submitReview(
                  dealId,
                  member,
                  review
                )
                window.alert(message)
                window.location.reload()
              }}
            >
              {isSubmitting ? 'Adding review...' : 'Add review'}
            </Button>

          </>
        )}
      </div>
    )
  }
)
