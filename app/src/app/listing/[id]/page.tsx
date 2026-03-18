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
    <div className="py-6 px-4">
      <Link
        href="/"
        className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors mb-4 inline-block uppercase tracking-wider py-2"
      >
        &larr; BACK
      </Link>
      <ListingDetail nullifier={nullifier} />
    </div>
  );
}
