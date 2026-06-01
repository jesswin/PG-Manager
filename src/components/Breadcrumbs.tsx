"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
}

export default function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-5">
      <Link href="/" className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
        <Home size={14} />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={14} className="text-gray-300" />
          {crumb.href && i < crumbs.length - 1 ? (
            <Link href={crumb.href} className="hover:text-indigo-600 transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
