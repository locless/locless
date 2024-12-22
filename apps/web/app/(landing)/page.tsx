import Link from 'next/link';

export default async function Home() {
  return (
    <div className='container flex justify-center gap-44'>
      <div>
        <h1 className='text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl'>
          Instant Updates for Your Mobile Apps,
          <span className='text-gray-500'>Without the Hassle of Store Releases.</span>
        </h1>
        <p className='mt-6 text-lg leading-8 text-primary-foreground'>
          Keep your app users engaged by delivering fast updates without waiting for store approvals. Fully open-source
          and developer-friendly.
        </p>
        <div className='mt-10 flex items-center gap-x-6'>
          <Link className='custom-button text-primary-foreground bg-btn_bg' href='/app/projects'>
            Get started
            <div className='custom-button__left'></div>
            <div className='custom-button__right'></div>
          </Link>
          <Link className='custom-button-reverse text-primary-foreground bg-btn_bg' href='/docs'>
            Documentation
            <div className='custom-button-reverse__left'></div>
            <div className='custom-button-reverse__right'></div>
          </Link>
        </div>
      </div>
      <div className='h-[350px] w-11/12 relative overflow-hidden rounded-xl mb-10 mx-auto'>
        <iframe
          width='100%'
          height='100%'
          src='https://www.youtube.com/embed/6rgK8r3k-kE?si=FIr8PG6Uw-A67IJc&autoplay=1&rel=0'
          title='YouTube video player'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          allowFullScreen
        />
      </div>
    </div>
  );
}
