
'use client';

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export function AuthHeader() {
  const { user } = useAuth();

  return (
    <header className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6 absolute top-0 left-0 w-full">
        <Link href="/" className="flex items-center gap-2 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
                <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63zM12 7.5a.75.75 0 01.75.75v3.69l3.44-2.293a.75.75 0 01.912 1.214l-4.25 2.833a.75.75 0 01-.912 0L7.898 11.16a.75.75 0 01.912-1.213L11.25 11.94V8.25A.75.75 0 0112 7.5z" />
            </svg>
            <span className="truncate">{user?.organizationName || 'DocuSync Lite'}</span>
        </Link>
    </header>
  )
}
