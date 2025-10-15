"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || undefined;

  return (
    <section className="overflow-hidden py-20 bg-gray-2">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="bg-white shadow-1 rounded-[10px] p-6 sm:p-10">
          <h1 className="text-2xl font-semibold text-green-600 mb-3">
            Payment successful
          </h1>
          <p className="text-dark mb-2">
            Thanks for your purchase! Your order is being processed.
          </p>
          {sessionId ? (
            <p className="text-dark-5 mb-6">Session: {sessionId}</p>
          ) : null}
          <div className="flex gap-3">
            <Link
              href="/"
              className="inline-flex font-medium text-white bg-blue py-2.5 px-6 rounded-md hover:bg-blue-dark"
            >
              Continue shopping
            </Link>
            <Link
              href="/my-account"
              className="inline-flex font-medium text-blue border border-blue py-2.5 px-6 rounded-md hover:bg-blue/10"
            >
              View account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


