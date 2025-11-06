import React, { type ReactElement } from "react"

interface CardProps {
  children: React.ReactNode
  className?: string  
}

export default function Card({ children, className = '' }: CardProps) {
  let footer: ReactElement | null = null;
  const content: any[] = [];
  
  React.Children.forEach(children, child => {
    if(React.isValidElement(child) && child.type === Card.Footer) {
      footer = child;
    }
    else {
      content.push(child);
    }
  });

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {content}
      {footer}
    </div>
  )
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-2 border-t border-gray-200 mt-4">
      <span className="align-middle flex">
      {children}
      </span>
    </div>
  )
}

Card.Footer = CardFooter