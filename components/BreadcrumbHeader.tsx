import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function BreadcrumbHeader({ paths }: { paths: { label: string, href: string }[] }) {
  return (
    <Breadcrumb className="mb-2 px-6 pt-4">
      <BreadcrumbList>
        {paths.map((path, index) => (
          <React.Fragment key={path.href}>
            <BreadcrumbItem>
              <BreadcrumbLink href={path.href}>{path.label}</BreadcrumbLink>
            </BreadcrumbItem>
            {index < paths.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}