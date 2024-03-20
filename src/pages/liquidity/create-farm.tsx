import dynamic from 'next/dynamic'
const CreateFarm = dynamic(() => import('@/features/Farm/Create'))

function CreateFarmPage() {
  return <CreateFarm />
}

export default CreateFarmPage
