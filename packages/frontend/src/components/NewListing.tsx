import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const listingTypes = [
  {
    label: 'devconnect',
    categories: ['available', 'wanted']
  },
  {
    label: 'for sale',
    categories: [
      'antiques',
      'appliances',
      'auto parts',
      'baby',
      'beauty',
      'bikes',
      'boats',
      'books',
      'cars+trucks',
      'clothes',
      'electronics',
      'farm+garden',
      'furniture',
      'household',
      'jewelry',
      'materials',
      'sporting',
      'tickets',
      'tools',
      'toys',
      'trailers',
      'video',
      'wanted',
    ]
  },
  {
    label: 'housing',
    categories: [
      'apts/houses',
      'swap',
      'wanted',
      'commercial',
      'parking/storage',
      'rooms/shared',
      'sublets/temporary',
      'vacation rentals',
    ]
  }
]

const NewListing = () => {
  return (
    <Dialog>
      <DialogTrigger>Add listing</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-3xl'>New Listing</DialogTitle>
          <DialogDescription>
            Step 1 of 3
          </DialogDescription>
        </DialogHeader>

        <section>
          <div className='flex flex-col text-left'>
            <h3 className='text-lg text-left'>Choose the categories for your listing</h3>
            {listingTypes.map(({ label, categories }) => (
              <div key={label} className='mt-4'>
                <p className='text-base font-semibold'>{label}</p>
                <hr className='my-1' />
                <section className='flex flex-wrap gap-3'>
                  {
                    categories.map((category, index) => {
                      const newLabel = `${label}-${category}`;
                      return (
                      <div key={index} className='flex space-x-1'>
                        <input type="checkbox" id={newLabel} name={newLabel} value={newLabel} />
                        <label htmlFor={newLabel} className='text-primary/75 hover:cursor-pointer active:text-primary hover:text-primary group-checked::text-primary'>{category}</label>
                      </div>
                    )})
                  }
                </section>
              </div>
            ))}
          </div>
        </section>
      <DialogFooter>
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded border-none'>
          Continue
        </button>
      </DialogFooter>
      </DialogContent>
    </Dialog>

  )
}

export default NewListing