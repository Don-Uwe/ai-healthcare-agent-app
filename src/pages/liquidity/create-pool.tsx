import dynamic from 'next/dynamic'
const CreatePool = dynamic(() => import('@/features/Create/StandardPool'))

function CreatePoolPage() {
  return <CreatePool />
}

export default CreatePoolPage

export async function getStaticProps() {
  return {
    props: { title: 'Create Pool' }
  }
}
