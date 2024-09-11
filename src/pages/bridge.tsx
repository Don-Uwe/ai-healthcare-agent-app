import dynamic from 'next/dynamic'
const Wormhole = dynamic(() => import('@/features/Wormhole'))

function Bridge() {
  return <Wormhole />
}

export default Bridge

export async function getStaticProps() {
  return {
    props: { title: 'Wormhole' }
  }
}
