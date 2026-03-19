'use client';

import { useParams } from 'next/navigation';
import { ListingDetail } from '@/components/listing-detail';
import Link from 'next/link';

export default function ListingPage() {
  const params = useParams();
  const nullifier = params.id as string;

  if (!nullifier) {
    return (
      <div className="text-center py-20">
        <span className="text-zinc-600 text-xs">INVALID LISTING</span>
      </div>
    );
  }

  return (
    <div className="py-4 px-4 max-w-lg mx-auto">
      <Link
        href="/"
        className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors mb-3 inline-block uppercase tracking-wider py-1"
      >
        &larr; BACK
      </Link>
      <ListingDetail nullifier={nullifier} />
    </div>
  );
}
