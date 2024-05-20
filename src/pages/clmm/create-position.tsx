import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useClmmStore } from '@/store'

const CreatePosition = dynamic(() => import('@/features/Clmm/ClmmPosition'))

const action = { type: 'CreatePositionPage' }

function CreatePositionPage() {
  useEffect(
    () => () => {
      useClmmStore.setState(
        {
          currentPoolInfo: undefined
        },
        false,
        action
      )
    },
    []
  )

  return <CreatePosition />
}

export default CreatePositionPage

export async function getStaticProps() {
  return {
    props: { title: 'Create Clmm Position' }
  }
}
