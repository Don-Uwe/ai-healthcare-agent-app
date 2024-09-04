import dynamic from 'next/dynamic'

const Lock = dynamic(() => import('@/features/Clmm/Lock'))

function LockPage() {
  return <Lock />
}

export default LockPage

export async function getStaticProps() {
  return {
    props: { title: 'Burn Clmm Pool' }
  }
}
